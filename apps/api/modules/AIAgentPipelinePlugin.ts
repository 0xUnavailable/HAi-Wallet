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
        return missing.length > 0 ? { ...parsed, missing, parsingWarning: 'Parsed from markdown block with extra explanation.' } : { ...parsed, parsingWarning: 'Parsed from markdown block with extra explanation.' };
      } catch (e2) {
        // Continue to next fallback
      }
    }
    // Fallback: Try to extract the first JSON object/array from the string
    const jsonObjMatch = cleaned.match(/\{[\s\S]*?\}|\[[\s\S]*?\]/);
    if (jsonObjMatch) {
      try {
        const parsed = JSON.parse(jsonObjMatch[0]);
        const missing = findMissingFields(parsed);
        return missing.length > 0 ? { ...parsed, missing, parsingWarning: 'Parsed from partial response with extra explanation.' } : { ...parsed, parsingWarning: 'Parsed from partial response with extra explanation.' };
      } catch (e3) {
        return { error: 'Could not parse JSON, see raw response.', raw: cleaned };
      }
    }
    return { error: 'No JSON found in response.', raw: cleaned };
  }
}

// Validation & Enrichment step
async function validateAndEnrich(params: ParameterMap, prompt: string, intent: IntentResult, context: AIAgentPipelineContext): Promise<ParameterMap> {
  if (!params.missing || params.missing.length === 0) {
    return params;
  }
  const missingFields = params.missing.join(', ');
  const systemPrompt = `The following crypto transaction parameters are missing or ambiguous: ${missingFields}.\nPrompt: "${prompt}"\nIntent: ${intent.type}\nCurrent parameters: ${JSON.stringify(params)}\n\nSuggest clarifying questions for the user or reasonable defaults for each missing field. Respond in JSON with fields for each missing parameter, using null if you cannot infer a value, and a 'clarification' field with suggested questions if needed.`;
  const response = await getOpenAICompletion(systemPrompt);
  let cleaned = response.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/```json|```/g, '').trim();
  }
  try {
    const parsed = JSON.parse(cleaned);
    return { ...params, ...parsed };
  } catch (e) {
    const match = cleaned.match(/```json\n([\s\S]*?)```/);
    if (match) {
      try {
        const jsonBlock = match[1].trim();
        const parsed = JSON.parse(jsonBlock);
        return { ...params, ...parsed, parsingWarning: 'Parsed from markdown block with extra explanation.' };
      } catch (e2) {}
    }
    const jsonObjMatch = cleaned.match(/\{[\s\S]*?\}|\[[\s\S]*?\]/);
    if (jsonObjMatch) {
      try {
        const parsed = JSON.parse(jsonObjMatch[0]);
        return { ...params, ...parsed, parsingWarning: 'Parsed from partial response with extra explanation.' };
      } catch (e3) {
        return { ...params, enrichmentError: 'Could not parse JSON, see raw response.', raw: cleaned };
      }
    }
    return { ...params, enrichmentError: 'No JSON found in response.', raw: cleaned };
  }
}

// Route Optimization step
async function optimizeRoutes(params: ParameterMap, prompt: string, intent: IntentResult, context: AIAgentPipelineContext): Promise<any> {
  // Build a prompt for OpenAI to suggest the best route(s)
  const systemPrompt = `Given the following crypto transaction parameters, suggest a maximum of two route recommendations for swaps, bridges, and transfers. Focus on the best options only. Compare available options (output, gas, time, price impact) and recommend the optimal route. Respond in JSON as an array of up to two route options, each with fields: provider, output, gas, time, priceImpact, recommended (boolean), and a 'reason' field explaining the recommendation.\nPrompt: "${prompt}"\nIntent: ${intent.type}\nParameters: ${JSON.stringify(params)}`;

  const response = await getOpenAICompletion(systemPrompt);

  let cleaned = response.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/```json|```/g, '').trim();
  }

  try {
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (e) {
    const match = cleaned.match(/```json\n([\s\S]*?)```/);
    if (match) {
      try {
        const jsonBlock = match[1].trim();
        const parsed = JSON.parse(jsonBlock);
        return parsed;
      } catch (e2) {
        return { error: cleaned };
      }
    }
    const jsonObjMatch = cleaned.match(/\[.*\]|\{[\s\S]*?\}/);
    if (jsonObjMatch) {
      try {
        const parsed = JSON.parse(jsonObjMatch[0]);
        return parsed;
      } catch (e3) {
        return { error: cleaned };
      }
    }
    return { error: cleaned };
  }
}

// Risk Assessment step
async function assessRisks(params: ParameterMap, routes: any, prompt: string, intent: IntentResult, context: AIAgentPipelineContext): Promise<any> {
  const risks: any[] = [];

  // 1. Insufficient Balance (if wallet and token info available)
  if (params.amount && params.token && context.wallets && context.wallets.length > 0) {
    const wallet = context.wallets[0]; // For MVP, use the first wallet
    if (wallet.tokens && wallet.tokens.includes(params.token)) {
      // For demo, assume user has 50 of each token (simulate insufficient balance)
      const fakeBalance = 50;
      if (Number(params.amount) > fakeBalance) {
        risks.push({
          issue: 'Insufficient balance',
          severity: 'high',
          suggestion: `Reduce the amount or deposit more ${params.token} (current balance: ${fakeBalance}).`
        });
      }
    }
  }

  // 2. Unknown Sender
  if (!params.sender && (!context.wallets || context.wallets.length === 0)) {
    risks.push({
      issue: 'Unknown sender wallet',
      severity: 'high',
      suggestion: 'Specify a valid sender wallet address from your account.'
    });
  }

  // 3. Missing Transaction Parameters
  if (params.missing && Array.isArray(params.missing) && params.missing.length > 0) {
    for (const field of params.missing) {
      risks.push({
        issue: `Missing transaction parameter: ${field}`,
        severity: 'high',
        suggestion: `Please provide a valid value for ${field}.`
      });
    }
  }

  // If we already found risks, return them (for MVP, skip OpenAI call if any are found)
  if (risks.length > 0) {
    return risks;
  }

  // Otherwise, call OpenAI for additional risk analysis
  const systemPrompt = `Given the following crypto transaction parameters and route recommendations, flag any potential risks or warnings for the user. Focus on: insufficient balance, high gas fees or slippage, and any other warning or risk relevant to the transaction. Respond in JSON as an array of risk objects, each with fields: issue, severity (low|medium|high), and suggestion.\nPrompt: "${prompt}"\nIntent: ${intent.type}\nParameters: ${JSON.stringify(params)}\nRoutes: ${JSON.stringify(routes)}`;

  const response = await getOpenAICompletion(systemPrompt);

  let cleaned = response.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/```json|```/g, '').trim();
  }

  try {
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (e) {
    const match = cleaned.match(/```json\n([\s\S]*?)```/);
    if (match) {
      try {
        const jsonBlock = match[1].trim();
        const parsed = JSON.parse(jsonBlock);
        return parsed;
      } catch (e2) {
        return { error: cleaned };
      }
    }
    const jsonObjMatch = cleaned.match(/\[.*\]|\{[\s\S]*?\}/);
    if (jsonObjMatch) {
      try {
        const parsed = JSON.parse(jsonObjMatch[0]);
        return parsed;
      } catch (e3) {
        return { error: cleaned };
      }
    }
    return { error: cleaned };
  }
}

export { recognizeIntent, extractParameters, validateAndEnrich, optimizeRoutes, assessRisks };

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