import { Server, Socket } from "socket.io";
import { gameState } from "./gameState";
import { ROWS, COLS } from "./config";
import { getCurState, setNewWord } from "./wordFetcher";
import words from "word-list";
import fs from "fs";
const wordListText = fs.readFileSync(words, "utf8");
const allEnglishWords = wordListText.split("\n");

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function setupSocket(io: Server) {
  io.on("connection", async (socket: Socket) => {
    console.log("User connected:", socket.id);
    if (getCurState().currentWord.length !== COLS) {
      await setNewWord();
    }
    socket.emit("gameState", gameState);

    socket.on(
      "addLetter",
      ({ letter, user, color }: { letter: string; user: string; color: string }) => {
        if (gameState.col < COLS) {
          gameState.board[gameState.row][gameState.col] = letter;
          gameState.users[gameState.row][gameState.col] = user;
          gameState.colors[gameState.row][gameState.col] = color;
          gameState.history.push({ user, letter, row: gameState.row, col: gameState.col });
          gameState.col++;
          io.emit("gameState", gameState);
        }
      }
    );

    socket.on(
      "submitWord",
      async ({ user, submitColors }: { user: string; submitColors: string[] }) => {
        if (gameState.winner) {
          io.emit("validation", "You already won!");
          return;
        }
        if (gameState.col < COLS) {
          io.emit("validation", "Not enough letters");
          return;
        }

        const submittedWord = gameState.board[gameState.row].join("");
        if (!allEnglishWords.includes(submittedWord.toLowerCase())) {
          io.emit("validation", "Not in word list");
          return;
        }
        console.log(`${user} submitted row ${gameState.row}: ${submittedWord}`);
        gameState.history.push({ user, action: "submit", row: gameState.row });
        gameState.colors[gameState.row] = submitColors;
        const wordSet = new Set(gameState.targetWord);
        for (let i = 0; i < COLS; i++) {
          const letter = gameState.board[gameState.row][i];
          if (!wordSet.has(letter)) {
            gameState.keyboardColors[letter] = "incorrect";
          } else if (letter === gameState.targetWord[i]) {
            gameState.keyboardColors[letter] = "correct";
            // If letter guessed correctly before, leave it correct
          } else if (gameState.keyboardColors[letter] !== "correct") {
            gameState.keyboardColors[letter] = "misplaced";
          }
        }
        gameState.row++;
        gameState.col = 0;
        if (submittedWord === gameState.targetWord) {
          console.log(`${user} won the game!`);
          gameState.winner = user;
        }
        if (gameState.row === ROWS && !gameState.winner) {
          console.log("No Winners.");
          io.emit("validation", `The word was ${gameState.targetWord}`);
        }
        io.emit("gameState", gameState);
        if (gameState.winner || gameState.row === ROWS) {
          await delay(5000);
          await setNewWord();
        }
      }
    );

    socket.on("backspace", (user: string) => {
      if (gameState.col > 0) {
        gameState.col--;
        gameState.board[gameState.row][gameState.col] = "";
        gameState.users[gameState.row][gameState.col] = null;
        gameState.colors[gameState.row][gameState.col] = "empty";
        gameState.history.push({
          user,
          action: "backspace",
          row: gameState.row,
          col: gameState.col,
        });
        io.emit("gameState", gameState);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}
