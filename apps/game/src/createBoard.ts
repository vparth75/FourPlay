const ROWS = 6;
const COLS = 7;

export function createBoard(): string[][]{
  return Array.from({ length: ROWS }, () => Array(COLS).fill("."));
}

export function printBoard(board: string[][]){
  for (let row of board){
    console.log(row.join(" "));
  }
  console.log("0 1 2 3 4 5 6");
}