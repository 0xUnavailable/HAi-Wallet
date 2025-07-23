// relayApiClient.ts
// Centralized client for relay.link API
import fetch, { Response } from 'node-fetch';
import { ENDPOINT_PATHS } from './endpoints';
import * as Types from './types';

export type RelayEnv = 'mainnet' | 'testnet';

const BASE_URLS = {
  mainnet: 'https://api.relay.link',
  testnet: 'https://api.testnets.relay.link',
};

class RelayApiError extends Error {
  response: Response;
  constructor(message: string, response: Response) {
    super(message);
    this.response = response;
  }
}

export class RelayApiClient {
  baseUrl: string;

  constructor(env: RelayEnv = 'testnet') {
    this.baseUrl = BASE_URLS[env];
  }

  // Get supported chains
  async getChains(): Promise<Types.GetChainsResponse> {
    const res = await fetch(this.baseUrl + ENDPOINT_PATHS.CHAINS);
    if (!res.ok) throw new RelayApiError(`Failed to fetch chains: ${res.statusText}`, res);
    return res.json() as Promise<Types.GetChainsResponse>;
  }

  // Get execution status
  async getExecutionStatus(requestId: string): Promise<Types.ExecutionStatusResponse> {
    const url = `${this.baseUrl + ENDPOINT_PATHS.EXECUTION_STATUS}?requestId=${encodeURIComponent(requestId)}`;
    const res = await fetch(url);
    if (!res.ok) throw new RelayApiError(`Failed to fetch execution status: ${res.statusText}`, res);
    return res.json() as Promise<Types.ExecutionStatusResponse>;
  }

  // Get all requests
  async getRequests(params: Types.GetRequestsParams): Promise<Types.GetRequestsResponse> {
    const query = new URLSearchParams(params as any).toString();
    const url = `${this.baseUrl + ENDPOINT_PATHS.REQUESTS}${query ? '?' + query : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new RelayApiError(`Failed to fetch requests: ${res.statusText}`, res);
    return res.json() as Promise<Types.GetRequestsResponse>;
  }

  // Get token price
  async getTokenPrice(address: string, chainId: number): Promise<Types.GetTokenPriceResponse> {
    const url = `${this.baseUrl + ENDPOINT_PATHS.TOKEN_PRICE}?address=${encodeURIComponent(address)}&chainId=${encodeURIComponent(chainId)}`;
    const res = await fetch(url);
    if (!res.ok) throw new RelayApiError(`Failed to fetch token price: ${res.statusText}`, res);
    return res.json() as Promise<Types.GetTokenPriceResponse>;
  }

  // Get currencies metadata
  async getCurrencies(body: Types.GetCurrenciesBody): Promise<Types.GetCurrenciesResponse> {
    const res = await fetch(this.baseUrl + ENDPOINT_PATHS.CURRENCIES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new RelayApiError(`Failed to fetch currencies: ${res.statusText}`, res);
    return res.json() as Promise<Types.GetCurrenciesResponse>;
  }

  // Get quote for swap/bridge/call
  async getQuote(body: Types.GetQuoteBody): Promise<Types.GetQuoteResponse> {
    const res = await fetch(this.baseUrl + ENDPOINT_PATHS.QUOTE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new RelayApiError(`Failed to fetch quote: ${res.statusText}`, res);
    return res.json() as Promise<Types.GetQuoteResponse>;
  }

  // Multi-input swap quote
  async getMultiInputQuote(body: Types.GetMultiInputQuoteBody): Promise<Types.GetMultiInputQuoteResponse> {
    const res = await fetch(this.baseUrl + ENDPOINT_PATHS.MULTI_INPUT_QUOTE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new RelayApiError(`Failed to fetch multi-input quote: ${res.statusText}`, res);
    return res.json() as Promise<Types.GetMultiInputQuoteResponse>;
  }

  // Notify backend to index a transaction
  async indexTransaction(body: Types.IndexTransactionBody): Promise<Types.IndexTransactionResponse> {
    const res = await fetch(this.baseUrl + ENDPOINT_PATHS.TRANSACTIONS_INDEX, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new RelayApiError(`Failed to index transaction: ${res.statusText}`, res);
    return res.json() as Promise<Types.IndexTransactionResponse>;
  }

  // Notify backend to index a single transfer/wrap/unwrap
  async indexSingleTransaction(body: Types.IndexSingleTransactionBody): Promise<Types.IndexSingleTransactionResponse> {
    const res = await fetch(this.baseUrl + ENDPOINT_PATHS.TRANSACTIONS_SINGLE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new RelayApiError(`Failed to index single transaction: ${res.statusText}`, res);
    return res.json() as Promise<Types.IndexSingleTransactionResponse>;
  }
} 