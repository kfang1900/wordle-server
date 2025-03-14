export type GameState = {
  board: (string | null)[][];
  users: (string | null)[][];
  history: { user: string; letter?: string; row?: number; col?: number; action?: string }[];
  row: number;
  col: number;
  winner: string | null;
  targetWord: string | null;
};

const ROWS = 6;
const COLS = 5;

export let gameState: GameState = {
  board: Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
  users: Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
  history: [],
  row: 0,
  col: 0,
  winner: null,
  targetWord: null,
};

export function resetGameState(newWord: string) {
  gameState.board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  gameState.users = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  gameState.history = [];
  gameState.row = 0;
  gameState.col = 0;
  gameState.winner = null;
  gameState.targetWord = newWord;
}
