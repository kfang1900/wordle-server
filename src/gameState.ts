import { ROWS, COLS, ALPHABET } from "./config";

export type GameState = {
  board: string[][];
  users: (string | null)[][];
  colors: string[][];
  keyboardColors: Record<string, string>;
  row: number;
  col: number;
  winner: string | null;
  targetWord: string;
  gamesPlayed: number;
  targetWordDict: Record<string, number>;
};

export let gameState: GameState = {
  board: Array.from({ length: ROWS }, () => Array(COLS).fill("")),
  users: Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
  colors: Array.from({ length: ROWS }, () => Array(COLS).fill("normal")),
  keyboardColors: Object.fromEntries(ALPHABET.split("").map(letter => [letter, "normal"])),
  row: 0,
  col: 0,
  winner: null,
  targetWord: "",
  gamesPlayed: 0,
  targetWordDict: Object.fromEntries(ALPHABET.split("").map(letter => [letter, 0])),
};

export function resetGameState(newWord: string, gamesPlayed: number) {
  gameState.board = Array.from({ length: ROWS }, () => Array(COLS).fill(""));
  gameState.users = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  gameState.colors = Array.from({ length: ROWS }, () => Array(COLS).fill("normal"));
  gameState.keyboardColors = Object.fromEntries(
    ALPHABET.split("").map(letter => [letter, "normal"])
  );
  gameState.row = 0;
  gameState.col = 0;
  gameState.winner = null;
  gameState.targetWord = newWord;
  gameState.gamesPlayed = gamesPlayed;
  const newWordDict = Object.fromEntries(ALPHABET.split("").map(letter => [letter, 0]));
  for (const letter of gameState.targetWord) {
    newWordDict[letter] += 1;
  }
  gameState.targetWordDict = newWordDict;
}
