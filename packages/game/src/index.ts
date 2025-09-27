import { createBoard, printBoard } from "./createBoard";
import { dropCoin } from "./dropCoin";
import { checkWinner, isDraw } from "./checkWinner";

export interface GameState{
  board: string[][];
  currentPlayer: "X" | "O";
  gameOver: boolean;
  winner?: "X" | "O";
  isDraw?: boolean;
  invalidMove?: boolean;
}

export function makeMove(gameState: GameState, column: number): GameState {
  if (gameState.gameOver) {
    return { ...gameState, invalidMove: true };
  }

  const nextBoard = gameState.board.map(row => [...row]);
  const updatedBoard = dropCoin(nextBoard, column, gameState.currentPlayer);

  if (!updatedBoard) {
    return { ...gameState, invalidMove: true };
  }

  if (checkWinner(updatedBoard, gameState.currentPlayer)) {
    return {
      board: updatedBoard,
      currentPlayer: gameState.currentPlayer,
      gameOver: true,
      winner: gameState.currentPlayer,
      invalidMove: false,
    };
  }

  if (isDraw(updatedBoard)) {
    return {
      board: updatedBoard,
      currentPlayer: gameState.currentPlayer,
      gameOver: true,
      isDraw: true,
      invalidMove: false,
    };
  }

  return {
    board: updatedBoard,
    currentPlayer: gameState.currentPlayer === "X" ? "O" : "X",
    gameOver: false,
    invalidMove: false,
  };
}

export { createBoard, printBoard } from "./createBoard";
export { dropCoin } from "./dropCoin";
export { checkWinner, isDraw } from "./checkWinner";