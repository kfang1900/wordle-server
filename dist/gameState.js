"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameState = void 0;
exports.resetGameState = resetGameState;
const config_1 = require("./config");
exports.gameState = {
    board: Array.from({ length: config_1.ROWS }, () => Array(config_1.COLS).fill("")),
    users: Array.from({ length: config_1.ROWS }, () => Array(config_1.COLS).fill(null)),
    colors: Array.from({ length: config_1.ROWS }, () => Array(config_1.COLS).fill("normal")),
    keyboardColors: Object.fromEntries(config_1.ALPHABET.split("").map(letter => [letter, "normal"])),
    row: 0,
    col: 0,
    winner: null,
    targetWord: "",
    gamesPlayed: 0,
    targetWordDict: Object.fromEntries(config_1.ALPHABET.split("").map(letter => [letter, 0])),
};
function resetGameState(newWord, gamesPlayed) {
    exports.gameState.board = Array.from({ length: config_1.ROWS }, () => Array(config_1.COLS).fill(""));
    exports.gameState.users = Array.from({ length: config_1.ROWS }, () => Array(config_1.COLS).fill(null));
    exports.gameState.colors = Array.from({ length: config_1.ROWS }, () => Array(config_1.COLS).fill("normal"));
    exports.gameState.keyboardColors = Object.fromEntries(config_1.ALPHABET.split("").map(letter => [letter, "normal"]));
    exports.gameState.row = 0;
    exports.gameState.col = 0;
    exports.gameState.winner = null;
    exports.gameState.targetWord = newWord;
    exports.gameState.gamesPlayed = gamesPlayed;
    const newWordDict = Object.fromEntries(config_1.ALPHABET.split("").map(letter => [letter, 0]));
    for (const letter of exports.gameState.targetWord) {
        newWordDict[letter] += 1;
    }
    exports.gameState.targetWordDict = newWordDict;
}
