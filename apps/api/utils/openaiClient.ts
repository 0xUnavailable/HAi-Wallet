// OpenAI API Client Utility
// Reads API key from environment and provides a function to send prompts and get completions

import { Configuration, OpenAIApi } from 'openai';

const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const configuration = new Configuration({ apiKey: openaiApiKey });
export const openai = new OpenAIApi(configuration);

/**
 * Send a prompt to OpenAI and get a completion.
 * @param prompt - The prompt string to send
 * @param options - Additional options (model, temperature, etc.)
 */
export async function getOpenAICompletion(prompt: string, options: Partial<{ model: string; temperature: number; max_tokens: number; }> = {}) {
  const response = await openai.createChatCompletion({
    model: options.model || 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: options.temperature ?? 0.2,
    max_tokens: options.max_tokens ?? 512,
  });
  return response.data.choices[0]?.message?.content || '';
}

// Usage example:
// const result = await getOpenAICompletion('What is the intent of: Send 100 USDC to Bob?'); 