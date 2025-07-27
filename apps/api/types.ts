// Type definitions for the HAi Wallet API

// Intent Types
export type Intent = 'Swap' | 'Bridge' | 'Transfer' | 'Query' | 'Multi';

// NLP Service Response Types
export interface NLPResponse {
  status: 'success' | 'error';
  result?: NLPResult;
  error?: string;
}

export interface NLPResult {
  intent_count?: number;
  intent: string | null;
  parameters: NLPParameters;
  intents?: NLPIntent[];
}

export interface NLPIntent {
  intent: string;
  parameters: NLPParameters;
}

export interface NLPParameters {
  from: string;
  to: string | null;
  source_network: string | null;
  dest_network: string | null;
  tokens: NLPToken[];
  token2: string | null;
  query_type: string | null;
  recipient?: string; // Alias for 'to' field
  amount?: string;
  amountIn?: string;
  value?: string;
  quantity?: string;
  originCurrency?: string;
  originNetwork?: string;
  destinationNetwork?: string;
  token?: string; // Legacy field for backward compatibility
}

export interface NLPToken {
  amount: string | null;
  token: string;
}

// API Request/Response Types
export interface PromptRequest {
  prompt: string;
  uid?: string;
}

export interface QuoteExecuteRequest {
  prompt: string;
  uid: string;
}

export interface ContactRequest {
  uid: string;
  name: string;
  address: string;
}

export interface ContactResponse {
  uid: string;
  contacts: Record<string, string>;
  contactCount: number;
  demoMode: boolean;
  allUserContacts: Record<string, Record<string, string>>;
}

// Error Response Type
export interface ErrorResponse {
  error: string;
  details?: any;
}

// Success Response Type
export interface SuccessResponse {
  status: 'success';
  data?: any;
  message?: string;
} 