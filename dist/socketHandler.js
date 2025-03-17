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
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = setupSocket;
const gameState_1 = require("./gameState");
const config_1 = require("./config");
const wordFetcher_1 = require("./wordFetcher");
function setupSocket(io) {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
        socket.emit("gameState", gameState_1.gameState);
        socket.on("addLetter", ({ letter, user, color }) => {
            if (gameState_1.gameState.col < config_1.COLS) {
                gameState_1.gameState.board[gameState_1.gameState.row][gameState_1.gameState.col] = letter;
                gameState_1.gameState.users[gameState_1.gameState.row][gameState_1.gameState.col] = user;
                gameState_1.gameState.colors[gameState_1.gameState.row][gameState_1.gameState.col] = color;
                gameState_1.gameState.history.push({ user, letter, row: gameState_1.gameState.row, col: gameState_1.gameState.col });
                gameState_1.gameState.col++;
                io.emit("gameState", gameState_1.gameState);
            }
        });
        socket.on("submitWord", (_a) => __awaiter(this, [_a], void 0, function* ({ user, submitColors }) {
            if (gameState_1.gameState.col !== config_1.COLS || gameState_1.gameState.winner) {
                return;
            }
            const submittedWord = gameState_1.gameState.board[gameState_1.gameState.row].join("");
            console.log(`${user} submitted row ${gameState_1.gameState.row}: ${submittedWord}`);
            gameState_1.gameState.history.push({ user, action: "submit", row: gameState_1.gameState.row });
            gameState_1.gameState.colors[gameState_1.gameState.row] = submitColors;
            const wordSet = new Set(gameState_1.gameState.targetWord);
            for (let i = 0; i < config_1.COLS; i++) {
                const letter = gameState_1.gameState.board[gameState_1.gameState.row][i];
                if (!wordSet.has(letter)) {
                    gameState_1.gameState.keyboardColors[letter] = "incorrect";
                }
                else if (letter === gameState_1.gameState.targetWord[i]) {
                    gameState_1.gameState.keyboardColors[letter] = "correct";
                    // If letter guessed correctly before, leave it correct
                }
                else if (gameState_1.gameState.keyboardColors[letter] !== "correct") {
                    gameState_1.gameState.keyboardColors[letter] = "misplaced";
                }
            }
            gameState_1.gameState.row++;
            gameState_1.gameState.col = 0;
            if (submittedWord === gameState_1.gameState.targetWord) {
                console.log(`${user} won the game!`);
                gameState_1.gameState.winner = user;
                yield (0, wordFetcher_1.fetchNewWord)();
            }
            if (gameState_1.gameState.row === config_1.ROWS && !gameState_1.gameState.winner) {
                console.log("No Winners.");
                yield (0, wordFetcher_1.fetchNewWord)();
            }
            io.emit("gameState", gameState_1.gameState);
        }));
        socket.on("backspace", (user) => {
            if (gameState_1.gameState.col > 0) {
                gameState_1.gameState.col--;
                gameState_1.gameState.board[gameState_1.gameState.row][gameState_1.gameState.col] = "";
                gameState_1.gameState.users[gameState_1.gameState.row][gameState_1.gameState.col] = null;
                gameState_1.gameState.colors[gameState_1.gameState.row][gameState_1.gameState.col] = "empty";
                gameState_1.gameState.history.push({
                    user,
                    action: "backspace",
                    row: gameState_1.gameState.row,
                    col: gameState_1.gameState.col,
                });
                io.emit("gameState", gameState_1.gameState);
            }
        });
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
}
