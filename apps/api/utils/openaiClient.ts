// OpenAI API Client Utility for v4+
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openaiApiKey = process.env.OPENAI_API_KEY;


if (!openaiApiKey) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

export const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: openaiApiKey
});

/**
 * Send a prompt to OpenAI/OpenRouter and get a completion.
 * @param prompt - The prompt string to send
 */
export async function getOpenAICompletion(prompt: string) {
  const completion = await openai.chat.completions.create({
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