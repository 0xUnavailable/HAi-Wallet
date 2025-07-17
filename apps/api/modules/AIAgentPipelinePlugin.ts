import { IAIAgentPipelinePlugin, AIAgentPipelineContext, AIPipelineResult } from '../../../packages/core/plugin/AIAgentPipelinePlugin';

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
    // This will call the real OpenAI-powered pipeline (to be implemented next)
    throw new Error('Not implemented: processPrompt');
  }
}; 