import { IAIAgentPipelinePlugin, AIAgentPipelineContext, AIPipelineResult, IntentResult, ParameterMap } from '../../../packages/core/plugin/AIAgentPipelinePlugin';
import { getOpenAICompletion } from '../utils/openaiClient';

// Helper: Prompt engineering for intent recognition
function buildIntentPrompt(userPrompt: string): string {
  return `Classify the user's intent from the following crypto wallet prompt. Respond in JSON with fields: type (one of transfer, swap, bridge, multi), description, confidence (0-1), and raw (the original prompt).\nPrompt: "${userPrompt}"`;
}

// Helper: Prompt engineering for parameter extraction
function buildParameterPrompt(userPrompt: string, intent: IntentResult): string {
  return `Extract all actionable parameters from the following crypto wallet prompt, given the intent: ${intent.type}. Respond in JSON with fields for each parameter (amount, token, recipient, network, action, etc.).\nPrompt: "${userPrompt}"`;
}

async function recognizeIntent(prompt: string, context: AIAgentPipelineContext): Promise<IntentResult> {
  const systemPrompt = buildIntentPrompt(prompt);
  const response = await getOpenAICompletion(systemPrompt);

  // Remove markdown formatting if present
  let cleaned = response.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/```json|```/g, '').trim();
  }

  try {
    const parsed = JSON.parse(cleaned);
    return {
      type: parsed.type,
      description: parsed.description,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 1.0,
      raw: prompt,
    };
  } catch (e) {
    return {
      type: 'unknown',
      description: cleaned,
      confidence: 0.5,
      raw: prompt,
    };
  }
}

// Helper to find missing fields in a parameter object or array of objects
function findMissingFields(params: any): string[] {
  const requiredFields = ['amount', 'token', 'recipient', 'network', 'action'];
  let missing: string[] = [];
  const check = (obj: any) => {
    for (const field of requiredFields) {
      if (!(field in obj) || obj[field] === null || obj[field] === undefined || obj[field] === '') {
        if (!missing.includes(field)) missing.push(field);
      }
    }
  };
  if (Array.isArray(params)) {
    params.forEach(check);
  } else if (typeof params === 'object') {
    check(params);
  }
  return missing;
}

// Parameter extraction step
async function extractParameters(prompt: string, intent: IntentResult, context: AIAgentPipelineContext): Promise<ParameterMap> {
  const systemPrompt = buildParameterPrompt(prompt, intent);
  const response = await getOpenAICompletion(systemPrompt);

  // Remove markdown formatting if present
  let cleaned = response.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/```json|```/g, '').trim();
  }

  // Try to parse as JSON directly
  try {
    const parsed = JSON.parse(cleaned);
    const missing = findMissingFields(parsed);
    return missing.length > 0 ? { ...parsed, missing } : parsed;
  } catch (e) {
    // Try to extract JSON block from error string
    const match = cleaned.match(/```json\n([\s\S]*?)```/);
    if (match) {
      try {
        const jsonBlock = match[1].trim();
        const parsed = JSON.parse(jsonBlock);
        const missing = findMissingFields(parsed);
        return missing.length > 0 ? { ...parsed, missing } : parsed;
      } catch (e2) {
        // Continue to next fallback
      }
    }
    // Fallback: Try to extract the first JSON object from the string
    const jsonObjMatch = cleaned.match(/{[\s\S]*?}/);
    if (jsonObjMatch) {
      try {
        const parsed = JSON.parse(jsonObjMatch[0]);
        const missing = findMissingFields(parsed);
        return missing.length > 0 ? { ...parsed, missing } : parsed;
      } catch (e3) {
        return { error: cleaned };
      }
    }
    return { error: cleaned };
  }
}

export { recognizeIntent, extractParameters };

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