import { ROWS, COLS } from "./config";

export type GameState = {
  board: string[][];
  users: (string | null)[][];
  colors: string[][];
  keyboardColors: Record<string, string>;
  history: { user: string; letter?: string; row?: number; col?: number; action?: string }[];
  row: number;
  col: number;
  winner: string | null;
  targetWord: string;
};

export let gameState: GameState = {
  board: Array.from({ length: ROWS }, () => Array(COLS).fill("")),
  users: Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
  colors: Array.from({ length: ROWS }, () => Array(COLS).fill("normal")),
  keyboardColors: Object.fromEntries(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(letter => [letter, "normal"])
  ),
  history: [],
  row: 0,
  col: 0,
  winner: null,
  targetWord: "",
};

export function resetGameState(newWord: string) {
  gameState.board = Array.from({ length: ROWS }, () => Array(COLS).fill(""));
  gameState.users = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  gameState.colors = Array.from({ length: ROWS }, () => Array(COLS).fill("normal"));
  gameState.keyboardColors = Object.fromEntries(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(letter => [letter, "normal"])
  );
  gameState.history = [];
  gameState.row = 0;
  gameState.col = 0;
  gameState.winner = null;
  gameState.targetWord = newWord;
}
