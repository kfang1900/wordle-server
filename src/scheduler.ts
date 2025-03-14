import cron from "node-cron";
import { fetchNewWord } from "./wordFetcher";

cron.schedule("0 14 * * *", async () => {
  console.log("Fetching new word at 9 AM EST...");
  await fetchNewWord();
});

console.log("Daily word update scheduled for 9 AM EST.");
