import { WebSocketServer, WebSocket } from "ws";
import { makeMove, GameState, createBoard, printBoard, dropCoin, checkWinner } from "@repo/game";
import jwt from 'jsonwebtoken';
import { prismaClient } from '@repo/db/client';

const wss = new WebSocketServer({ port: 8080 });

interface Room {
  players: WebSocket[];
  users: string[];
  gameState: GameState;
  isBot?: boolean;
}

interface queuePlayer{
  socket: WebSocket;
  userId: string;
  username: string | null | undefined;
  timeout?: NodeJS.Timeout;
}

const users = new Set<WebSocket>();
const roomByPlayer = new Map<WebSocket, Room>();
const queue: queuePlayer[] = [];
const JWT_SECRET = process.env.JWT_SECRET;

interface UserInfo {
  userId: string;
  username: string | null | undefined;
}

const BOT_PLAYER: "O" = "O";
const HUMAN_PLAYER: "X" = "X";
const EMPTY_CELL = ".";

function cloneBoard(board: string[][]): string[][] {
  return board.map(row => [...row]);
}

function getValidColumns(board: string[][]): number[] {
  if (board.length === 0) return [];
  const columns = board[0]!.length;
  const valid: number[] = [];

  for (let col = 0; col < columns; col++) {
    if (board[0]?.[col] === EMPTY_CELL) {
      valid.push(col);
    }
  }

  return valid;
}

function simulateMove(board: string[][], column: number, player: "X" | "O"): string[][] | null {
  const snapshot = cloneBoard(board);
  const result = dropCoin(snapshot, column, player);
  return result ? snapshot : null;
}

function evaluateWindow(window: string[]): number {
  const botCount = window.filter(cell => cell === BOT_PLAYER).length;
  const humanCount = window.filter(cell => cell === HUMAN_PLAYER).length;
  const emptyCount = window.filter(cell => cell === EMPTY_CELL).length;

  let score = 0;

  if (botCount === 4) {
    score += 10000;
  } else if (botCount === 3 && emptyCount === 1) {
    score += 150;
  } else if (botCount === 2 && emptyCount === 2) {
    score += 15;
  }

  if (humanCount === 3 && emptyCount === 1) {
    score -= 200;
  } else if (humanCount === 2 && emptyCount === 2) {
    score -= 10;
  }

  return score;
}

function scorePosition(board: string[][]): number {
  let score = 0;

  const rows = board.length;
  const cols = board[0]?.length ?? 0;

  const centerColumn = Math.floor(cols / 2);
  const centerArray = board.map(row => row?.[centerColumn] ?? EMPTY_CELL);
  const centerCount = centerArray.filter(cell => cell === BOT_PLAYER).length;
  score += centerCount * 25;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= cols - 4; c++) {
      const window = [
        board[r]?.[c] ?? EMPTY_CELL,
        board[r]?.[c + 1] ?? EMPTY_CELL,
        board[r]?.[c + 2] ?? EMPTY_CELL,
        board[r]?.[c + 3] ?? EMPTY_CELL,
      ];
      score += evaluateWindow(window);
    }
  }

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r <= rows - 4; r++) {
      const window = [
        board[r]?.[c] ?? EMPTY_CELL,
        board[r + 1]?.[c] ?? EMPTY_CELL,
        board[r + 2]?.[c] ?? EMPTY_CELL,
        board[r + 3]?.[c] ?? EMPTY_CELL,
      ];
      score += evaluateWindow(window);
    }
  }

  for (let r = 0; r <= rows - 4; r++) {
    for (let c = 0; c <= cols - 4; c++) {
      const window = [
        board[r]?.[c] ?? EMPTY_CELL,
        board[r + 1]?.[c + 1] ?? EMPTY_CELL,
        board[r + 2]?.[c + 2] ?? EMPTY_CELL,
        board[r + 3]?.[c + 3] ?? EMPTY_CELL,
      ];
      score += evaluateWindow(window);
    }
  }

  for (let r = 0; r <= rows - 4; r++) {
    for (let c = 3; c < cols; c++) {
      const window = [
        board[r]?.[c] ?? EMPTY_CELL,
        board[r + 1]?.[c - 1] ?? EMPTY_CELL,
        board[r + 2]?.[c - 2] ?? EMPTY_CELL,
        board[r + 3]?.[c - 3] ?? EMPTY_CELL,
      ];
      score += evaluateWindow(window);
    }
  }

  return score;
}

function opponentHasImmediateWin(board: string[][]): boolean {
  const validColumns = getValidColumns(board);

  for (const column of validColumns) {
    const hypothetical = simulateMove(board, column, HUMAN_PLAYER);
    if (hypothetical && checkWinner(hypothetical, HUMAN_PLAYER)) {
      return true;
    }
  }

  return false;
}

function makeBotMove(gameState: GameState): number {
  const validColumns = getValidColumns(gameState.board);

  if (validColumns.length === 0) {
    return 0;
  }

  for (const column of validColumns) {
    const simulatedBoard = simulateMove(gameState.board, column, BOT_PLAYER);
    if (simulatedBoard && checkWinner(simulatedBoard, BOT_PLAYER)) {
      return column;
    }
  }

for (const column of validColumns) {
    const simulatedBoard = simulateMove(gameState.board, column, HUMAN_PLAYER);
    if (simulatedBoard && checkWinner(simulatedBoard, HUMAN_PLAYER)) {
      return column;
    }
  }

  let bestScore = -Infinity;
  const bestColumns: number[] = [];

  for (const column of validColumns) {
    const simulatedBoard = simulateMove(gameState.board, column, BOT_PLAYER);
    if (!simulatedBoard) {
      continue;
    }

    let score = scorePosition(simulatedBoard);

    if (opponentHasImmediateWin(simulatedBoard)) {
      score -= 750;
    }

    if (score > bestScore) {
      bestScore = score;
      bestColumns.length = 0;
      bestColumns.push(column);
    } else if (score === bestScore) {
      bestColumns.push(column);
    }
  }

  if (bestColumns.length === 0) {
    return validColumns[0]!;
  }

  const centerColumn = Math.floor((gameState.board[0]?.length ?? 1) / 2);
  bestColumns.sort((a, b) => Math.abs(a - centerColumn) - Math.abs(b - centerColumn));

  return bestColumns[0]!;
}

function createBotRoom(player: queuePlayer): Room {
  const room: Room = {
    players: [player.socket],
    users: [player.username!, "Bot"],
    gameState: {
      board: createBoard(),
      currentPlayer: "X",
      gameOver: false,
    },
    isBot: true,
  };

  roomByPlayer.set(player.socket, room);
  
  player.socket.send(
    JSON.stringify({
      type: "start",
      opponentUsername: "Bot",
      gameState: room.gameState,
      playerSymbol: "X",
    }),
  );
  
  player.socket.on("message", message => handleMessage(player.socket, message.toString(), player.userId));
  
  return room;
}

function handleBotMove(room: Room) {
  if (room.gameState.gameOver || room.gameState.currentPlayer !== "O") return;
  
  setTimeout(() => {
    const botColumn = makeBotMove(room.gameState);
    const newState = makeMove(room.gameState, botColumn);
    
    if (!newState.invalidMove) {
      room.gameState = newState;
      printBoard(room.gameState.board);
      
      room.players[0]!.send(
        JSON.stringify({
          type: "move",
          column: botColumn,
          gameState: room.gameState,
        }),
      );
      
      if (newState.winner) {
        console.log(`Game ended! Winner: ${newState.winner}`);
      }
    }
  }, 400 + Math.random() * 600);
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

    if (decoded.username) {
      return {
        userId: decoded.userId,
        username: decoded.username
      };
    }
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

  const matchmakingTimeout = setTimeout(() => {

    const playerIndex = queue.findIndex(p => p.socket === socket);
    if (playerIndex !== -1) {
      const player = queue.splice(playerIndex, 1)[0];
      

      const botRoom = createBotRoom(player!);
      printBoard(botRoom.gameState.board);
      
      console.log(`Player ${username} matched with bot after timeout`);
    }
  }, 10000);

  const player = {
    socket,
    userId,
    username,
    timeout: matchmakingTimeout
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
    
    if (player.timeout) {
      clearTimeout(player.timeout);
    }
    const queueIndex = queue.findIndex(p => p.socket === socket);
    if (queueIndex !== -1) {
      queue.splice(queueIndex, 1);
    }
  });

  if (queue.length < 2) return;

  const p1 = queue.pop();
  const p2 = queue.pop();

  if (!p1 || !p2) return;
  if (!p1.username || !p2.username) return;

  if (p1.timeout) clearTimeout(p1.timeout);
  if (p2.timeout) clearTimeout(p2.timeout);

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
    if (room.isBot && !room.gameState.gameOver) {
      handleBotMove(room);
    }
  } catch (error) {
    sender.send(
      JSON.stringify({
        type: "info",
        message: "Could not process message",
      }),
    );
  }
}
