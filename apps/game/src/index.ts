import * as readline from "readline";
import { createBoard, printBoard } from "./createBoard";
import { dropCoin } from "./dropCoin";
import { checkWinner, isDraw } from "./checkWinner";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function playGame() {
  let board = createBoard();
  let currentPlayer = "X";

  while (true) {
    printBoard(board);
    let col = parseInt(await ask(`Player ${currentPlayer}, choose a column (0-6): `));

    if (!dropCoin(board, col, currentPlayer)) {
      console.log("Invalid move. Try again.");
      continue;
    }

    if (checkWinner(board, currentPlayer)) {
      printBoard(board);
      console.log(`Player ${currentPlayer} wins! 🎉`);
      break;
    }

    if (isDraw(board)) {
      printBoard(board);
      console.log("It's a draw!");
      break;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
  }

  rl.close();
}

playGame();