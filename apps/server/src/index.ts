import { WebSocketServer, WebSocket } from "ws";
import { makeMove, GameState, createBoard, printBoard } from "@repo/game";

const wss = new WebSocketServer({ port: 8080 });

interface Room {
  players: WebSocket[];
  gameState: GameState;
}

const users = new Set<WebSocket>();
const roomByPlayer = new Map<WebSocket, Room>();
const queue: WebSocket[] = [];

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

wss.on("connection", (socket: WebSocket) => {
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

  room.players.forEach(player => {
    roomByPlayer.set(player, room);
    player.send(
      JSON.stringify({
        type: "start",
        gameState: room.gameState,
      }),
    );
    player.on("message", message => handleMessage(player, message.toString()));
  });

  printBoard(room.gameState.board);
});