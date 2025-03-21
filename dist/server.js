"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const socketHandler_1 = require("./socketHandler");
const wordFetcher_1 = require("./wordFetcher");
const app = (0, express_1.default)();
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
app.use((0, cors_1.default)(corsOptions));
// Create HTTP server
const server = (0, http_1.createServer)(app);
// Initialize Socket.IO with updated CORS configuration
exports.io = new socket_io_1.Server(server, {
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
(0, socketHandler_1.setupSocket)(exports.io);
const PORT = 3001;
server.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`WebSocket server running on port ${PORT}`);
    try {
        yield (0, wordFetcher_1.setNewWord)();
    }
    catch (error) {
        console.error("Error fetching initial word:", error);
    }
    // // Rest word at midnight
    // cron.schedule("0 0 * * *", async () => {
    //   console.log("Cron job running: Fetching new word...");
    //   await setNewWord();
    // });
}));
