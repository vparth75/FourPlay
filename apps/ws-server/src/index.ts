import { WebSocketServer, WebSocket } from "ws";
import { makeMove, GameState, createBoard, printBoard } from "@repo/game";
import jwt from 'jsonwebtoken';
import { prismaClient } from '@repo/db/client';

const wss = new WebSocketServer({ port: 8080 });

interface Room {
  players: WebSocket[];
  users: string[];
  gameState: GameState;
}

interface queuePlayer{
  socket: WebSocket;
  userId: string;
  username: string | null | undefined;
}

const users = new Set<WebSocket>();
const roomByPlayer = new Map<WebSocket, Room>();
const queue: queuePlayer[] = [];
const JWT_SECRET = process.env.JWT_SECRET;

interface UserInfo {
  userId: string;
  username: string | null | undefined;
}

async function checkUser(token: string): Promise<UserInfo | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string);

    if (typeof decoded === "string") {
      return null;
    }

    if (!decoded || !decoded.userId) {
      return null;
    }

    // If username is in the JWT token, use it directly
    if (decoded.username) {
      return {
        userId: decoded.userId,
        username: decoded.username
      };
    }

    // Fallback: get username from database
    const user = await prismaClient.player.findFirst({
      where: {
        id: decoded.userId
      }
    })

    return {
      userId: decoded.userId,
      username: user?.username
    };
  } catch (e) {
    console.log(`${e}`);
    return null;
  }
}

wss.on("connection", async (socket: WebSocket, req) => {
  const url = req.url;
  if(!url) return;

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";
  const userInfo = await checkUser(token);
  
  if (!userInfo) {
    socket.close();
    return;
  }
  
  const { userId, username } = userInfo;
  
  if(!userId || !username){
    socket.close();
    return;
  }

  const player = {
    socket,
    userId,
    username
  }

  users.add(socket);
  queue.unshift(player);

  socket.send(
    JSON.stringify({
      type: "info",
      message: "connected",
    }),
  );

  socket.on("close", () => {
    users.delete(socket);
    roomByPlayer.delete(socket);
  });

  if (queue.length < 2) return;

  const p1 = queue.pop();
  const p2 = queue.pop();

  if (!p1 || !p2) return;
  if (!p1.username || !p2.username) return;

  const room: Room = {
    players: [p1.socket, p2.socket],
    users: [p1.username, p2.username],
    gameState: {
      board: createBoard(),
      currentPlayer: "X",
      gameOver: false,
    },
  };

  room.players.forEach((player, index) => {
    roomByPlayer.set(player, room);
    const playerSymbol = index === 0 ? 'X' : 'O';
    const opponentUsername = index === 0 ? `${p2.username}` : `${p1.username}`;
    const userId = index === 0 ? `${p1.userId}` : `${p2.userId}`;
    player.send(
      JSON.stringify({
        type: "start",
        opponentUsername,
        gameState: room.gameState,
        playerSymbol: playerSymbol,
      }),
    );
    player.on("message", message => handleMessage(player, message.toString(), userId));
  });

  printBoard(room.gameState.board);
});

async function handleMessage(sender: WebSocket, raw: string, userId: string) {
  try {
    const room = roomByPlayer.get(sender);
    if (!room) return;

    const parsedMessage = JSON.parse(raw);
    if (parsedMessage.type !== "move") return;

    const column = Number(parsedMessage.column);
    const newState = makeMove(room.gameState, column);

    if (!newState.invalidMove) {
      room.gameState = newState;
      printBoard(room.gameState.board);
    }

    if (newState.winner) {
      const addPoints = await prismaClient.player.update({
        where: {
          id: userId
        },
        data: {
          points: {
            increment: 10
          }
        }
      })
      printBoard(newState.board);
      console.log(`${newState.currentPlayer} won!`)
    }

    room.players.forEach(player =>
      player.send(
        JSON.stringify({
          type: "move",
          column,
          gameState: room.gameState,
        }),
      ),
    );
  } catch (error) {
    sender.send(
      JSON.stringify({
        type: "info",
        message: "Could not process message",
      }),
    );
  }
}
