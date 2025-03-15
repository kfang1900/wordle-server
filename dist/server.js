"use strict";
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
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const server = (0, http_1.createServer)(app);
exports.io = new socket_io_1.Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
});
(0, socketHandler_1.setupSocket)(exports.io);
const PORT = 3001;
server.listen(PORT, () => console.log(`WebSocket server running on port ${PORT}`));
