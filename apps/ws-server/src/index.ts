import { WebSocketServer, WebSocket } from "ws";
import { makeMove, GameState, createBoard, printBoard } from "@repo/game";
import jwt from 'jsonwebtoken';
import { prismaClient } from '@repo/db/client';

const wss = new WebSocketServer({ port: 8080 });

interface Room {
  players: WebSocket[];
  gameState: GameState;
}

const users = new Set<WebSocket>();
const roomByPlayer = new Map<WebSocket, Room>();
const queue: WebSocket[] = [];
const JWT_SECRET = process.env.JWT_SECRET;

async function checkUser(token: string): Promise<string | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string);

    if (typeof decoded === "string") {
      return null;
    }

    if (!decoded || !decoded.userId) {
      return null;
    }

    const user = await prismaClient.player.findFirst({
      where: {
        id: decoded.userId
      }
    })

    return decoded.userId;
  } catch (e) {
    return null;
  }
}

wss.on("connection", async (socket: WebSocket, req) => {
  const url = req.url;
  if(!url) return;

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";
  const userId = await checkUser(token);
  
  if (!userId) {
    socket.close();
    return;
  }

  users.add(socket);
  queue.unshift(socket);

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

  const room: Room = {
    players: [p1, p2],
    gameState: {
      board: createBoard(),
      currentPlayer: "X",
      gameOver: false,
    },
  };

  room.players.forEach((player, index) => {
    roomByPlayer.set(player, room);
    const playerSymbol = index === 0 ? 'X' : 'O';
    player.send(
      JSON.stringify({
        type: "start",
        gameState: room.gameState,
        playerSymbol: playerSymbol,
      }),
    );
    player.on("message", message => handleMessage(player, message.toString()));
  });

  printBoard(room.gameState.board);
});

function handleMessage(sender: WebSocket, raw: string) {
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
