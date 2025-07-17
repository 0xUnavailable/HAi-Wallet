import { IAIAgentPipelinePlugin, AIAgentPipelineContext, AIPipelineResult, IntentResult } from '../../../packages/core/plugin/AIAgentPipelinePlugin';
import { getOpenAICompletion } from '../utils/openaiClient';

// Helper: Prompt engineering for intent recognition
function buildIntentPrompt(userPrompt: string): string {
  return `Classify the user's intent from the following crypto wallet prompt. Respond in JSON with fields: type (one of transfer, swap, bridge, multi), description, confidence (0-1), and raw (the original prompt).\nPrompt: "${userPrompt}"`;
}

async function recognizeIntent(prompt: string, context: AIAgentPipelineContext): Promise<IntentResult> {
  const systemPrompt = buildIntentPrompt(prompt);
  const response = await getOpenAICompletion(systemPrompt, { model: 'gpt-3.5-turbo', temperature: 0 });
  try {
    // Try to parse the response as JSON
    const parsed = JSON.parse(response);
    return {
      type: parsed.type,
      description: parsed.description,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 1.0,
      raw: prompt,
    };
  } catch (e) {
    // Fallback: If not JSON, return a default intent
    return {
      type: 'unknown',
      description: response,
      confidence: 0.5,
      raw: prompt,
    };
  }
}

export const AIAgentPipelinePlugin: IAIAgentPipelinePlugin = {
  id: 'ai-agent-pipeline',
  name: 'AI Agent Pipeline',
  version: '1.0.0',
  type: 'ai-pipeline',
  async init(context: AIAgentPipelineContext) {
    // Any setup logic (e.g., load OpenAI config)
  },
  async dispose() {
    // Any cleanup logic
  },
  async processPrompt(prompt: string, context: AIAgentPipelineContext): Promise<AIPipelineResult> {
    // Step 1: Intent Recognition
    const intent = await recognizeIntent(prompt, context);
    // The rest of the pipeline will be implemented next
    throw new Error('Pipeline not fully implemented. Intent recognition result: ' + JSON.stringify(intent));
  }
}; 