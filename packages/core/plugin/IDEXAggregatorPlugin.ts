import { IPlugin } from './IPlugin';

export interface SwapQuoteRequest {
  chainId: number;
  sellToken: string;
  buyToken: string;
  sellAmount: string; // in fromToken units
  taker: string;
  // Optionally, keep legacy fields for compatibility
  fromToken?: string;
  toToken?: string;
  amount?: string;
  fromAddress?: string;
  toAddress?: string;
  network?: string;
}

export interface SwapQuote {
  provider: string;
  output: string;
  gas: string;
  time: string;
  priceImpact: string;
  recommended: boolean;
  reason: string;
  rawQuote?: any;
}

export interface IDEXAggregatorPlugin extends IPlugin<any> {
  getSwapQuote(request: SwapQuoteRequest): Promise<SwapQuote[]>;
} 