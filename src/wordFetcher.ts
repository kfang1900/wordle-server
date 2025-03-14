import axios from "axios";
import fs from "fs";
import { gameState, resetGameState } from "./gameState";
import dotenv from "dotenv";
import { io } from "./server";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function fetchNewWord(): Promise<void> {
  try {
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: "Give me a random 5-letter word." }] }],
    });
    let newWord =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase() || null;
    if (newWord && newWord.length === 5) {
      console.log("New Word of the Day:", newWord);
      fs.writeFileSync("/tmp/word_of_the_day.txt", newWord);

      resetGameState(newWord);
      io.emit("gameState", gameState);
    } else {
      console.log("Invalid word received:", newWord);
    }
  } catch (error) {
    console.log("Failed to fetch word:", error);
  }
}
