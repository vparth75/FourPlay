import { WebSocketServer, WebSocket } from "ws";

const ws = new WebSocketServer({ port:8080 });

const users = new Set<WebSocket>;
let userCount = 0;

ws.on("connection", (socket: WebSocket) => {
  userCount++;

  users.add(socket);

  socket.send(JSON.stringify({
    type: "info",
    message: "connected"
  }));

  socket.on("message", (message: string) => {
    try{
      const parsedMessage = JSON.parse(message);
    
      if (parsedMessage.type === "chat"){
        const textData = parsedMessage.message;

        users.forEach(user => user.send(JSON.stringify({
          type: "chat",
          message: `${textData}`
        })));
      }
    } catch {
      socket.send(JSON.stringify({
        type: "info",
        message: "Couldnt send message"
      }))
    }
  })
});