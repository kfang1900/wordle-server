"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const wordFetcher_1 = require("./wordFetcher");
function testFetch() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Running test fetch...");
        yield (0, wordFetcher_1.fetchNewWord)();
        console.log("Test fetch completed.");
    });
}
node_cron_1.default.schedule("* * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Testing cron job: Fetching new word...");
    yield (0, wordFetcher_1.fetchNewWord)();
}));
testFetch().catch(console.error);
console.log("Daily word update scheduled for 9 AM EST.");
