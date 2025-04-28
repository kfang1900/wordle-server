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
const wordOrderFilePath = "./word-order.json"; // New file to store word order
// Function to get or create a persistent randomized word list
function getOrCreateWordOrder() {
    if (fs_1.default.existsSync(wordOrderFilePath)) {
        // If the word order file exists, load it
        return JSON.parse(fs_1.default.readFileSync(wordOrderFilePath, "utf8"));
    }
    else {
        // If the file doesn't exist, create a new randomized word list
        const wordListText = fs_1.default.readFileSync(word_list_1.default, "utf8");
        const allEnglishWords = wordListText.split("\n");
        const fiveLetterWords = allEnglishWords
            .filter(word => word.length === 5 && !word.endsWith("s"))
            .map(word => word.toUpperCase());
        // Randomize the array (Fisher-Yates shuffle)
        for (let i = fiveLetterWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [fiveLetterWords[i], fiveLetterWords[j]] = [fiveLetterWords[j], fiveLetterWords[i]];
        }
        // Save the randomized list to a file
        fs_1.default.writeFileSync(wordOrderFilePath, JSON.stringify(fiveLetterWords));
        return fiveLetterWords;
    }
}
function getCurState() {
    if (!fs_1.default.existsSync(filePath)) {
        const data = { currentWord: "", usedWords: [], wordIndex: 0 };
        fs_1.default.writeFileSync(filePath, JSON.stringify(data));
        return { currentWord: "", usedWords: new Set(), wordIndex: 0 };
    }
    const data = JSON.parse(fs_1.default.readFileSync(filePath, "utf8"));
    return {
        currentWord: data.currentWord,
        usedWords: new Set(data.usedWords),
        wordIndex: data.wordIndex || 0, // Backward compatibility
    };
}
function fetchNewWord() {
    const { usedWords, wordIndex: currentIndex } = getCurState();
    const wordOrder = getOrCreateWordOrder();
    // Start from the current index and find the next unused word
    let index = currentIndex;
    let loopCount = 0;
    while (loopCount < wordOrder.length) {
        // Wrap around if we reach the end of the array
        if (index >= wordOrder.length) {
            index = 0;
        }
        const candidate = wordOrder[index];
        if (!usedWords.has(candidate)) {
            // Update the index for next time
            updateWordIndex(index + 1);
            return candidate;
        }
        index++;
        loopCount++;
    }
    // If all words have been used, start over
    console.log("All words have been used, resetting usage tracking");
    updateWordIndex(1);
    return wordOrder[0];
}
function updateWordIndex(newIndex) {
    const { currentWord, usedWords } = getCurState();
    const data = {
        currentWord,
        usedWords: [...usedWords],
        wordIndex: newIndex,
    };
    fs_1.default.writeFileSync(filePath, JSON.stringify(data));
}
function setNewWord(reason = "gameWon") {
    const { usedWords, wordIndex } = getCurState();
    const gamesPlayed = usedWords.size;
    let newWord;
    if (reason === "serverRestart") {
        const currentState = getCurState();
        newWord = currentState.currentWord;
        console.log("Server restarted, keeping current word:", newWord);
    }
    else {
        // Get a new word when a game is won
        newWord = fetchNewWord();
        console.log("New Word of the Day:", newWord);
    }
    (0, gameState_1.resetGameState)(newWord, gamesPlayed);
    const newUsedWordsList = reason === "serverRestart" ? [...usedWords] : [...usedWords, newWord];
    const newData = {
        currentWord: newWord,
        usedWords: newUsedWordsList,
        wordIndex: wordIndex,
    };
    fs_1.default.writeFileSync(filePath, JSON.stringify(newData));
    server_1.io.emit("gameState", gameState_1.gameState);
}
