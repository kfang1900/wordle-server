import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { setupSocket } from "./socketHandler";
import { fetchNewWord } from "./wordFetcher";
import cron from "node-cron";

const app = express();

// Updated CORS configuration to allow connections from multiple origins
const corsOptions = {
  origin: [
    "https://wordle.kevinfaang.com",
    "https://ws.wordle.kevinfaang.com",
    "http://localhost:3000",
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true,
};

// Enable CORS for Express
app.use(cors(corsOptions));

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO with updated CORS configuration
export const io = new Server(server, {
  cors: corsOptions,
  transports: ["websocket", "polling"],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Add a basic route for health checks
app.get("/health", (req, res) => {
  res.status(200).send({ status: "ok" });
});
setupSocket(io);

const PORT = 3001;

server.listen(PORT, async () => {
  console.log(`WebSocket server running on port ${PORT}`);

  try {
    console.log("Fetching initial word...");
    await fetchNewWord();
    console.log("Initial word fetched.");
  } catch (error) {
    console.error("Error fetching initial word:", error);
  }

  // Rest word at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("Cron job running: Fetching new word...");
    await fetchNewWord();
  });
});
