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
exports.fetchNewWord = fetchNewWord;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const gameState_1 = require("./gameState");
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = require("./server");
const config_1 = require("./config");
dotenv_1.default.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
function fetchNewWord() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g;
        try {
            const response = yield axios_1.default.post(GEMINI_API_URL, {
                contents: [
                    {
                        parts: [
                            {
                                text: "Give me a random 5-letter English word. The word should be different each time. Just return the word, in all caps, and nothing else.",
                            },
                        ],
                    },
                ],
            });
            let newWord = ((_g = (_f = (_e = (_d = (_c = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.candidates) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.parts) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.text) === null || _g === void 0 ? void 0 : _g.trim().toUpperCase()) || null;
            if (newWord && newWord.length === config_1.COLS) {
                console.log("New Word of the Day:", newWord);
                fs_1.default.writeFileSync("/tmp/word_of_the_day.txt", newWord);
                (0, gameState_1.resetGameState)(newWord);
                server_1.io.emit("gameState", gameState_1.gameState);
            }
            else {
                console.log("Invalid word received:", newWord);
            }
        }
        catch (error) {
            console.log("Failed to fetch word:", error);
        }
    });
}
