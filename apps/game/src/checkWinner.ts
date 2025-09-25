const ROWS = 6;
const COLS = 7;

export function checkWinner(board: string[][], player: string): boolean {
  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const currentRow = board[r];
      if (currentRow && currentRow[c] === player &&
          currentRow[c+1] === player &&
          currentRow[c+2] === player &&
          currentRow[c+3] === player) {
        return true;
      }
    }
  }

  // Vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      const currentRow = board[r];
      if (currentRow && currentRow[c] === player &&
          currentRow[c] === player &&
          currentRow[c] === player &&
          currentRow[c] === player) {
        return true;
      }
    }
  }

  // Diagonal right 
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const currentRow = board[r];
      if (currentRow && currentRow[c] === player &&
          currentRow[c+1] === player &&
          currentRow[c+2] === player &&
          currentRow[c+3] === player) {
        return true;
      }
    }
  }

  // Diagonal left
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 3; c < COLS; c++) {
      const currentRow = board[r];
      if (currentRow && currentRow[c] === player &&
          currentRow[c-1] === player &&
          currentRow[c-2] === player &&
          currentRow[c-3] === player) {
        return true;
      }
    }
  }

  return false;
}

export function isDraw(board: string[][]): boolean {
  return board.every(row => row.every(cell => cell !== "."));
}
