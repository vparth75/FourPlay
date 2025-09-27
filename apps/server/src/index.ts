import { WebSocketServer, WebSocket } from "ws";
import { makeMove, GameState, createBoard, printBoard} from "@repo/game";

const wss = new WebSocketServer({ port:8080 });

const users = new Set<WebSocket>();
let gameState: GameState = {
  board: createBoard(),
  currentPlayer: "X",
  gameOver: false,
}

wss.on("connection", (socket: WebSocket) => {
  users.add(socket);

  printBoard(gameState.board);

  socket.send(JSON.stringify({
    type: "info",
    message: "connected"
  }));

  socket.on("message", (message: string) => {
    try{
      const parsedMessage = JSON.parse(message);
    
      if (parsedMessage.type === "move"){
        const column = Number(parsedMessage.column);
        gameState.currentPlayer = parsedMessage.gameState.currentPlayer;

        const newState = makeMove(gameState, column);

        if(!newState.invalidMove){
          gameState = newState;
        }

        if(newState.winner){
          printBoard(gameState.board);
          console.log(`${gameState.currentPlayer} won!`);
        }

        users.forEach(user => user.send(JSON.stringify({
          type: "move",
          column,
          gameState
        })));
      }

    } catch(e) {
      console.log(`${e} \n`);

      socket.send(JSON.stringify({
        type: "info",
        message: "Couldnt send message"
      }))
    }
  })

  socket.on("close", () => {
    users.delete(socket);
  })
});