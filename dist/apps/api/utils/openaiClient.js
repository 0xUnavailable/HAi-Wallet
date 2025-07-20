"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = void 0;
exports.getOpenAICompletion = getOpenAICompletion;
// OpenAI API Client Utility for v4+
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
}
exports.openai = new openai_1.default({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: openaiApiKey
});
/**
 * Send a prompt to OpenAI/OpenRouter and get a completion.
 * @param prompt - The prompt string to send
 */
async function getOpenAICompletion(prompt) {
    const completion = await exports.openai.chat.completions.create({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
    });
    return completion.choices[0]?.message?.content || '';
}
// Usage example:
// const result = await getOpenAICompletion('What is the meaning of life?'); 
