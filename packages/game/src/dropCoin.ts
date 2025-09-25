const ROWS = 6;
const COLS = 7;

export function dropCoin(board: string[][], col: number, player: string): boolean{
  if (col < 0 || col >= COLS){
    return false;
  }

  for(let row = ROWS-1; row>=0; row--){
    const currentRow = board[row];
    if(currentRow && currentRow[col] === "."){
      currentRow[col] = player;
      return true;
    } 
  }
  return false;
}