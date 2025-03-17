import { Server, Socket } from "socket.io";
import { gameState } from "./gameState";
import { ROWS, COLS } from "./config";
import { fetchNewWord } from "./wordFetcher";

export function setupSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

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
        if (gameState.col !== COLS || gameState.winner) {
          return;
        }

        const submittedWord = gameState.board[gameState.row].join("");

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
          await fetchNewWord();
        }
        if (gameState.row === ROWS && !gameState.winner) {
          console.log("No Winners.");
          await fetchNewWord();
        }
        io.emit("gameState", gameState);
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
