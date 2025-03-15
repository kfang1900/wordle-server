"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameState = void 0;
exports.resetGameState = resetGameState;
const config_1 = require("./config");
exports.gameState = {
    board: Array.from({ length: config_1.ROWS }, () => Array(config_1.COLS).fill("")),
    users: Array.from({ length: config_1.ROWS }, () => Array(config_1.COLS).fill(null)),
    colors: Array.from({ length: config_1.ROWS }, () => Array(config_1.COLS).fill("normal")),
    keyboardColors: Object.fromEntries("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(letter => [letter, "normal"])),
    history: [],
    row: 0,
    col: 0,
    winner: null,
    targetWord: "PICKL",
};
function resetGameState(newWord) {
    exports.gameState.board = Array.from({ length: config_1.ROWS }, () => Array(config_1.COLS).fill(""));
    exports.gameState.users = Array.from({ length: config_1.ROWS }, () => Array(config_1.COLS).fill(null));
    exports.gameState.colors = Array.from({ length: config_1.ROWS }, () => Array(config_1.COLS).fill("normal"));
    exports.gameState.keyboardColors = Object.fromEntries("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(letter => [letter, "normal"]));
    exports.gameState.history = [];
    exports.gameState.row = 0;
    exports.gameState.col = 0;
    exports.gameState.winner = null;
    exports.gameState.targetWord = newWord;
}
