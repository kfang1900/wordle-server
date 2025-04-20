import fs from "fs";
import { gameState, resetGameState } from "./gameState";
import { io } from "./server";
import words from "word-list";

const filePath = "./word.json";
const wordOrderFilePath = "./word-order.json"; // New file to store word order

// Function to get or create a persistent randomized word list
function getOrCreateWordOrder(): string[] {
  if (fs.existsSync(wordOrderFilePath)) {
    // If the word order file exists, load it
    return JSON.parse(fs.readFileSync(wordOrderFilePath, "utf8"));
  } else {
    // If the file doesn't exist, create a new randomized word list
    const wordListText = fs.readFileSync(words, "utf8");
    const allEnglishWords = wordListText.split("\n");
    const fiveLetterWords = allEnglishWords
      .filter(word => word.length === 5 && !word.endsWith("s"))
      .map(word => word.toUpperCase());

    // Randomize the array (Fisher-Yates shuffle)
    for (let i = fiveLetterWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [fiveLetterWords[i], fiveLetterWords[j]] = [fiveLetterWords[j], fiveLetterWords[i]];
    }

    // Save the randomized list to a file
    fs.writeFileSync(wordOrderFilePath, JSON.stringify(fiveLetterWords));
    return fiveLetterWords;
  }
}

export function getCurState(): { currentWord: string; usedWords: Set<string>; wordIndex: number } {
  if (!fs.existsSync(filePath)) {
    const data = { currentWord: "", usedWords: [], wordIndex: 0 };
    fs.writeFileSync(filePath, JSON.stringify(data));
    return { currentWord: "", usedWords: new Set(), wordIndex: 0 };
  }
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return {
    currentWord: data.currentWord,
    usedWords: new Set(data.usedWords),
    wordIndex: data.wordIndex || 0, // Backward compatibility
  };
}

function fetchNewWord(): string {
  const { usedWords, wordIndex: currentIndex } = getCurState();
  const wordOrder = getOrCreateWordOrder();

  // Start from the current index and find the next unused word
  let index = currentIndex;
  let loopCount = 0;

  while (loopCount < wordOrder.length) {
    // Wrap around if we reach the end of the array
    if (index >= wordOrder.length) {
      index = 0;
    }

    const candidate = wordOrder[index];
    if (!usedWords.has(candidate)) {
      // Update the index for next time
      updateWordIndex(index + 1);
      return candidate;
    }

    index++;
    loopCount++;
  }

  // If all words have been used, start over
  console.log("All words have been used, resetting usage tracking");
  updateWordIndex(1);
  return wordOrder[0];
}

function updateWordIndex(newIndex: number): void {
  const { currentWord, usedWords } = getCurState();
  const data = {
    currentWord,
    usedWords: [...usedWords],
    wordIndex: newIndex,
  };
  fs.writeFileSync(filePath, JSON.stringify(data));
}

export function setNewWord(reason: "gameWon" | "serverRestart" = "gameWon"): void {
  const { usedWords, wordIndex } = getCurState();
  const gamesPlayed = usedWords.size;
  let newWord;
  if (reason === "serverRestart") {
    const currentState = getCurState();
    newWord = currentState.currentWord;
    console.log("Server restarted, keeping current word:", newWord);
  } else {
    // Get a new word when a game is won
    newWord = fetchNewWord();
    console.log("New Word of the Day:", newWord);
  }

  resetGameState(newWord, gamesPlayed);
  const newUsedWordsList = reason === "serverRestart" ? [...usedWords] : [...usedWords, newWord];
  const newData = {
    currentWord: newWord,
    usedWords: newUsedWordsList,
    wordIndex: wordIndex,
  };
  fs.writeFileSync(filePath, JSON.stringify(newData));
  io.emit("gameState", gameState);
}
