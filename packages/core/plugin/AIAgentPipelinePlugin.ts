import { IPlugin } from './IPlugin';

export interface AIAgentPipelineContext {
  userId: string;
  wallets: any[];
  contacts: any[];
  // Add more context fields as needed
}

export interface IntentResult {
  type: string;
  description: string;
  confidence: number;
  raw: string;
}

export interface ParameterMap {
  [key: string]: any;
}

export interface RouteOption {
  provider: string;
  output: string;
  gas: string;
  time: string;
  priceImpact: string;
  recommended: boolean;
}

export interface RiskAssessment {
  issues: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface SimulationResult {
  steps: any[];
  totalGas: string;
  totalTime: string;
  savings?: string;
}

export interface AIPipelineResult {
  intent: IntentResult;
  parameters: ParameterMap;
  enriched: ParameterMap;
  routes: RouteOption[];
  risks: RiskAssessment;
  simulation: SimulationResult;
  confidence: number;
}

export interface IAIAgentPipelinePlugin extends IPlugin<AIAgentPipelineContext> {
  processPrompt(prompt: string, context: AIAgentPipelineContext): Promise<AIPipelineResult>;
} 