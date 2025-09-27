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

export function makeMove(gameState: GameState, column: number): GameState{
  
  if (!gameState.gameOver){
    const newBoard = dropCoin(gameState.board, column, gameState.currentPlayer);
    if (!newBoard) return ({
      board: gameState.board,
      currentPlayer: gameState.currentPlayer,
      gameOver: gameState.gameOver,
      invalidMove: true
    });

    if(isDraw(newBoard)) return ({
      board: newBoard,
      currentPlayer: gameState.currentPlayer,
      gameOver: true,
      isDraw: true
    });

    if(checkWinner(newBoard, gameState.currentPlayer)) return ({
      board: newBoard,
      currentPlayer: gameState.currentPlayer,
      gameOver: true,
      winner: gameState.currentPlayer
    })
    
    printBoard(newBoard);

    return({
      board: newBoard,
      currentPlayer: gameState.currentPlayer,
      gameOver: false
    }) 
  } else {
    return ({
      board: gameState.board,
      currentPlayer: gameState.currentPlayer,
      gameOver: true
    })
  }
}

export { createBoard, printBoard } from "./createBoard";
export { dropCoin } from "./dropCoin";
export { checkWinner, isDraw } from "./checkWinner";