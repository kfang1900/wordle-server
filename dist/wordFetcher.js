"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurState = getCurState;
exports.setNewWord = setNewWord;
const fs_1 = __importDefault(require("fs"));
const gameState_1 = require("./gameState");
const server_1 = require("./server");
const word_list_1 = __importDefault(require("word-list"));
const filePath = "./word.json";
function getRandomWord() {
    const wordListText = fs_1.default.readFileSync(word_list_1.default, "utf8");
    const allEnglishWords = wordListText.split("\n");
    const fiveLetterWords = allEnglishWords.filter(word => word.length === 5 && !word.endsWith("s"));
    const randomIndex = Math.floor(Math.random() * fiveLetterWords.length);
    return fiveLetterWords[randomIndex].toUpperCase();
}
function getCurState() {
    if (!fs_1.default.existsSync(filePath)) {
        const data = { currentWord: "", usedWords: [] };
        fs_1.default.writeFileSync(filePath, JSON.stringify(data));
        return { currentWord: "", usedWords: new Set() };
    }
    const data = JSON.parse(fs_1.default.readFileSync(filePath, "utf8"));
    return { currentWord: data.currentWord, usedWords: new Set(data.usedWords) };
}
function fetchNewWord() {
    const { usedWords } = getCurState();
    let attempts = 0;
    let newWord;
    while (attempts < 100) {
        newWord = getRandomWord();
        if (!usedWords.has(newWord)) {
            return newWord;
        }
        attempts++;
    }
    // If all attempts fail, just return a word
    return getRandomWord();
}
function setNewWord() {
    const { usedWords } = getCurState();
    const gamesPlayed = usedWords.size;
    let newWord = fetchNewWord();
    console.log("New Word of the Day:", newWord);
    (0, gameState_1.resetGameState)(newWord, gamesPlayed);
    const newUsedWordsList = [...usedWords, newWord];
    const newData = { currentWord: newWord, usedWords: newUsedWordsList };
    fs_1.default.writeFileSync(filePath, JSON.stringify(newData));
    server_1.io.emit("gameState", gameState_1.gameState);
}
