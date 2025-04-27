import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http:localhost:3000",
  }
})

io.on('connection', (socket) => {
  console.log(`User conncted: ${socket.id}`);

  socket.on('join chat', (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} has data: ${data}`);
  })
})

server.listen(PORT, () => {
  console.log("Server is running...");
})