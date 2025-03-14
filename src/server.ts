import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { setupSocket } from "./socketHandler";

const app = express();
app.use(cors());

const server = createServer(app);
export const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

setupSocket(io);

const PORT = 3001;
server.listen(PORT, () => console.log(`WebSocket server running on port ${PORT}`));
