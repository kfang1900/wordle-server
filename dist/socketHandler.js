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
exports.setupSocket = setupSocket;
const gameState_1 = require("./gameState");
const config_1 = require("./config");
const wordFetcher_1 = require("./wordFetcher");
const word_list_1 = __importDefault(require("word-list"));
const fs_1 = __importDefault(require("fs"));
const wordListText = fs_1.default.readFileSync(word_list_1.default, "utf8");
const allEnglishWords = wordListText.split("\n");
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function setupSocket(io) {
    io.on("connection", (socket) => __awaiter(this, void 0, void 0, function* () {
        console.log("User connected:", socket.id);
        if ((0, wordFetcher_1.getCurState)().currentWord.length !== config_1.COLS) {
            (0, wordFetcher_1.setNewWord)();
        }
        socket.emit("gameState", gameState_1.gameState);
        socket.on("addLetter", ({ letter, color }) => {
            if (gameState_1.gameState.col < config_1.COLS) {
                gameState_1.gameState.board[gameState_1.gameState.row][gameState_1.gameState.col] = letter;
                gameState_1.gameState.colors[gameState_1.gameState.row][gameState_1.gameState.col] = color;
                gameState_1.gameState.col++;
                io.emit("gameState", gameState_1.gameState);
            }
        });
        socket.on("submitWord", () => __awaiter(this, void 0, void 0, function* () {
            if (gameState_1.gameState.winner) {
                io.emit("validation", "You already won!");
                return;
            }
            if (gameState_1.gameState.col < config_1.COLS) {
                io.emit("validation", "Not enough letters");
                return;
            }
            const submittedWord = gameState_1.gameState.board[gameState_1.gameState.row].join("");
            const wordSet = new Set(gameState_1.gameState.targetWord);
            if (!allEnglishWords.includes(submittedWord.toLowerCase()) &&
                submittedWord !== gameState_1.gameState.targetWord) {
                io.emit("validation", "Not in word list");
                return;
            }
            console.log(`${gameState_1.gameState.row}: ${submittedWord}`);
            const newSubmitColors = Array(config_1.COLS).fill("");
            const guessDict = Object.fromEntries(config_1.ALPHABET.split("").map(letter => [letter, 0]));
            for (const [pos, letter] of [...submittedWord].entries()) {
                if (letter === gameState_1.gameState.targetWord[pos]) {
                    guessDict[letter] += 1;
                    newSubmitColors[pos] = "correct";
                }
            }
            for (const [pos, letter] of [...submittedWord].entries()) {
                if (newSubmitColors[pos] === "correct") {
                    continue;
                }
                guessDict[letter] += 1;
                if (wordSet.has(letter) && guessDict[letter] <= gameState_1.gameState.targetWordDict[letter]) {
                    newSubmitColors[pos] = "misplaced";
                }
                else {
                    newSubmitColors[pos] = "incorrect";
                }
            }
            gameState_1.gameState.colors[gameState_1.gameState.row] = newSubmitColors;
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
                io.emit("validation", "🦙🦙🦙🦙🦙");
                gameState_1.gameState.winner = "Helen";
            }
            if (gameState_1.gameState.row === config_1.ROWS && !gameState_1.gameState.winner) {
                console.log("No Winners.");
                io.emit("validation", `The word was ${gameState_1.gameState.targetWord}`);
            }
            io.emit("gameState", gameState_1.gameState);
            if (gameState_1.gameState.winner || gameState_1.gameState.row === config_1.ROWS) {
                yield delay(5000);
                (0, wordFetcher_1.setNewWord)("gameWon");
            }
        }));
        socket.on("backspace", () => {
            if (gameState_1.gameState.col > 0) {
                gameState_1.gameState.col--;
                gameState_1.gameState.board[gameState_1.gameState.row][gameState_1.gameState.col] = "";
                gameState_1.gameState.users[gameState_1.gameState.row][gameState_1.gameState.col] = null;
                gameState_1.gameState.colors[gameState_1.gameState.row][gameState_1.gameState.col] = "empty";
                io.emit("gameState", gameState_1.gameState);
            }
        });
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    }));
}
