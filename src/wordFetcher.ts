import axios from "axios";
import fs from "fs";
import { gameState, resetGameState } from "./gameState";
import dotenv from "dotenv";
import { io } from "./server";
import { COLS } from "./config";

dotenv.config();

const filePath = "./word.json";

export function getCurState(): { currentWord: string; usedWords: Set<string> } {
  if (!fs.existsSync(filePath)) {
    const data = { currentWord: "", usedWords: [] };
    fs.writeFileSync(filePath, JSON.stringify(data));
    return { currentWord: "", usedWords: new Set() };
  }
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return { currentWord: data.currentWord, usedWords: new Set(data.usedWords) };
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

async function fetchNewWord(): Promise<string> {
  const { usedWords } = getCurState();
  const usedWordsArray = Array.from(usedWords);
  const usedWordsString = usedWordsArray.join(", ");
  console.log(
    `Give me a random 5-letter English word for a Wordle game. The word should not be ${usedWordsString}. The word should not be plural. Just return the word, in all caps, and nothing else.`
  );
  try {
    const response = await axios.post(GEMINI_API_URL, {
      contents: [
        {
          parts: [
            {
              text: `Give me a random 5-letter English word for a Wordle game. The word should not be ${usedWordsString}. The word should not be plural. Just return the word, in all caps, and nothing else.`,
            },
          ],
        },
      ],
    });
    const newWord =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase() || null;
    if (newWord && newWord.length === COLS) {
      return newWord;
    } else {
      console.log("Invalid word received:", newWord);
      return "";
    }
  } catch (error) {
    console.log("Failed to fetch word:", error);
    return "";
  }
}

export async function setNewWord(): Promise<void> {
  const { usedWords } = getCurState();
  let newWord = await fetchNewWord();
  while (newWord.length !== COLS || usedWords.has(newWord)) {
    newWord = await fetchNewWord();
  }
  console.log("New Word of the Day:", newWord);
  resetGameState(newWord);
  const newUsedWordsList = [...usedWords, newWord];
  const newData = { currentWord: newWord, usedWords: newUsedWordsList };
  fs.writeFileSync(filePath, JSON.stringify(newData));
  io.emit("gameState", gameState);
}
