import { Server, Socket } from "socket.io";
import { gameState } from "./gameState";
import { ROWS, COLS, ALPHABET } from "./config";
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
      setNewWord();
    }
    socket.emit("gameState", gameState);

    socket.on("addLetter", ({ letter, color }: { letter: string; color: string }) => {
      if (gameState.col < COLS) {
        gameState.board[gameState.row][gameState.col] = letter;
        gameState.colors[gameState.row][gameState.col] = color;
        gameState.col++;
        io.emit("gameState", gameState);
      }
    });

    socket.on("submitWord", async () => {
      if (gameState.winner) {
        io.emit("validation", "You already won!");
        return;
      }
      if (gameState.col < COLS) {
        io.emit("validation", "Not enough letters");
        return;
      }

      const submittedWord = gameState.board[gameState.row].join("");
      const wordSet = new Set(gameState.targetWord);
      if (
        !allEnglishWords.includes(submittedWord.toLowerCase()) &&
        submittedWord !== gameState.targetWord
      ) {
        io.emit("validation", "Not in word list");
        return;
      }
      console.log(`${gameState.row}: ${submittedWord}`);

      const newSubmitColors: string[] = Array(COLS).fill("");
      const guessDict: Record<string, number> = Object.fromEntries(
        ALPHABET.split("").map(letter => [letter, 0])
      );
      for (const [pos, letter] of [...submittedWord].entries()) {
        if (letter === gameState.targetWord[pos]) {
          guessDict[letter] += 1;
          newSubmitColors[pos] = "correct";
        }
      }
      for (const [pos, letter] of [...submittedWord].entries()) {
        if (newSubmitColors[pos] === "correct") {
          continue;
        }
        guessDict[letter] += 1;
        if (wordSet.has(letter) && guessDict[letter] <= gameState.targetWordDict[letter]) {
          newSubmitColors[pos] = "misplaced";
        } else {
          newSubmitColors[pos] = "incorrect";
        }
      }

      gameState.colors[gameState.row] = newSubmitColors;

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
        io.emit("validation", "🦙🦙🦙🦙🦙");
        gameState.winner = "Helen";
      }
      if (gameState.row === ROWS && !gameState.winner) {
        console.log("No Winners.");
        io.emit("validation", `The word was ${gameState.targetWord}`);
      }
      io.emit("gameState", gameState);
      if (gameState.winner || gameState.row === ROWS) {
        await delay(5000);
        setNewWord("gameWon");
      }
    });

    socket.on("backspace", () => {
      if (gameState.col > 0) {
        gameState.col--;
        gameState.board[gameState.row][gameState.col] = "";
        gameState.users[gameState.row][gameState.col] = null;
        gameState.colors[gameState.row][gameState.col] = "empty";
        io.emit("gameState", gameState);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}
