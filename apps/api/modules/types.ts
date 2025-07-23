// types.ts
// TypeScript types for relay.link API

export interface Chain {
  id: number;
  name: string;
  [key: string]: any;
}

export interface GetChainsResponse {
  chains: Chain[];
}

export interface GetExecutionStatusParams {
  requestId: string;
}
export interface ExecutionStatusResponse {
  status: string;
  details?: string;
  inTxHashes?: string[];
  txHashes?: string[];
  time?: number;
  originChainId?: number;
  destinationChainId?: number;
}

export interface GetRequestsParams {
  [key: string]: any;
}
export interface GetRequestsResponse {
  requests: any[];
}

export interface GetTokenPriceParams {
  address: string;
  chainId: number;
}
export interface GetTokenPriceResponse {
  price: number;
}

export interface GetCurrenciesBody {
  [key: string]: any;
}
export interface GetCurrenciesResponse {
  [key: string]: any;
}

export interface GetQuoteBody {
  [key: string]: any;
}
export interface GetQuoteResponse {
  [key: string]: any;
}

export interface GetMultiInputQuoteBody {
  [key: string]: any;
}
export interface GetMultiInputQuoteResponse {
  [key: string]: any;
}

export interface IndexTransactionBody {
  [key: string]: any;
}
export interface IndexTransactionResponse {
  message: string;
}

export interface IndexSingleTransactionBody {
  [key: string]: any;
}
export interface IndexSingleTransactionResponse {
  message: string;
} 