import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const PORT = process.env.PORT || 5000;

const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 15;
const MIN_MESSAGE_LENGTH = 1;
const MAX_MESSAGE_LENGTH = 10000;

app.use(cors());

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});


const getTimestamp = () => {
  const newDate = new Date();

  const hours = `0${newDate.getHours()}`.slice(-2);
  const minutes =`0${newDate.getMinutes()}`.slice(-2);

  return `${hours}:${minutes}`;
}

io.on("connect", (socket) => {
  console.log(`User connected: ${socket.id}`);

  ////////// Присоединение к чату //////////
  socket.on("join chat", (data) => {
    const username = data.text.trim() || "";

    if (username.length < MIN_USERNAME_LENGTH) {
      socket.emit(
        "error",
        `${username} contains an insufficient number of characters`
      );
      return;
    }

    if (username.length > MAX_USERNAME_LENGTH) {
      socket.emit(
        "error",
        `${username} contains too many characters`
      );
      return;
    }

    socket.username = username;
    const timestamp = getTimestamp();

    io.emit("receive message", {
      type: "system",
      data: {
        id: socket.id,
        text: `${username} joined the chat at ${timestamp}`,
        timestamp: timestamp,
      },
    });

    console.log(`User with ID: ${socket.id} joined with username: ${data.text}`);
  });

  ////////// Отправка сообщения //////////
  socket.on("send message", (data) => {
    const text = data.text.trim() || "";

    if (text.length < MIN_MESSAGE_LENGTH) {
      socket.emit(
        "error",
        "Message contains an insufficient number of characters"
      );
      return;
    }

    if (text.length > MAX_MESSAGE_LENGTH) {
      socket.emit(
        "error",
        "Message contains too many characters"
      );
      return;
    }

    const timestamp = getTimestamp();

    io.emit("receive message", {
      type: "user",
      data: {
        id: socket.id,
        username: data.username,
        text: text,
        timestamp: timestamp,
      }
    })
  });

  ////////// Отключение //////////
  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);

    const timestamp = getTimestamp();
    if (socket.username) {
      io.emit("receive message", {
        type: "system",
        data: {
          id: socket.id,
          text: `${socket.username} left the chat at ${timestamp}`,
          timestamp: timestamp,
        },
      });
    }
  });
});

server.listen(PORT, () => {
  console.log("Server is running...");
});
