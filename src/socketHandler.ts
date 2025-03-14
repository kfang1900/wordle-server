import { Server, Socket } from "socket.io";
import { gameState } from "./gameState";

export function setupSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    socket.emit("gameState", gameState);

    socket.on("addLetter", ({ letter, user }: { letter: string; user: string }) => {
      if (gameState.col < 5) {
        gameState.board[gameState.row][gameState.col] = letter;
        gameState.users[gameState.row][gameState.col] = user;
        gameState.history.push({ user, letter, row: gameState.row, col: gameState.col });
        gameState.col++;
        io.emit("gameState", gameState);
      }
    });

    socket.on("submitWord", (user: string) => {
      if (gameState.col !== 5 || gameState.winner) {
        return;
      }

      const submittedWord = gameState.board[gameState.row].join("");

      console.log(`${user} submitted row ${gameState.row}: ${submittedWord}`);
      gameState.history.push({ user, action: "submit", row: gameState.row });

      if (submittedWord === gameState.targetWord) {
        console.log(`${user} won the game!`);
        gameState.winner = user;
        io.emit("gameState", gameState);
        return;
      }
      if (gameState.row < 5) {
        gameState.row++;
        gameState.col = 0;
      } else {
        console.log("No Winners.");
      }
      io.emit("gameState", gameState);
    });

    socket.on("backspace", (user: string) => {
      if (gameState.col > 0) {
        gameState.col--;
        gameState.board[gameState.row][gameState.col] = null;
        gameState.users[gameState.row][gameState.col] = null;
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
