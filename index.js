import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();

app.use(cors());

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http:localhost:3000",
  }
})

server.listen(5000, () => {
  console.log("Server is running...");
})