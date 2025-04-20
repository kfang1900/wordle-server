import fs from "fs";
import { gameState, resetGameState } from "./gameState";
import { io } from "./server";
import words from "word-list";

const filePath = "./word.json";

function getRandomWord(): string {
  const wordListText = fs.readFileSync(words, "utf8");
  const allEnglishWords = wordListText.split("\n");
  const fiveLetterWords = allEnglishWords.filter(word => word.length === 5 && !word.endsWith("s"));

  const randomIndex = Math.floor(Math.random() * fiveLetterWords.length);
  return fiveLetterWords[randomIndex].toUpperCase();
}

export function getCurState(): { currentWord: string; usedWords: Set<string> } {
  if (!fs.existsSync(filePath)) {
    const data = { currentWord: "", usedWords: [] };
    fs.writeFileSync(filePath, JSON.stringify(data));
    return { currentWord: "", usedWords: new Set() };
  }
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return { currentWord: data.currentWord, usedWords: new Set(data.usedWords) };
}

function fetchNewWord(): string {
  const { usedWords } = getCurState();
  let attempts = 0;
  let newWord;

  while (attempts < 100) {
    newWord = getRandomWord();
    if (!usedWords.has(newWord)) {
      return newWord;
    }
    attempts++;
  }
  // If all attempts fail, just return a word
  return getRandomWord();
}

export function setNewWord(): void {
  const { usedWords } = getCurState();
  const gamesPlayed = usedWords.size;
  let newWord = fetchNewWord();
  console.log("New Word of the Day:", newWord);
  resetGameState(newWord, gamesPlayed);
  const newUsedWordsList = [...usedWords, newWord];
  const newData = { currentWord: newWord, usedWords: newUsedWordsList };
  fs.writeFileSync(filePath, JSON.stringify(newData));
  io.emit("gameState", gameState);
}
