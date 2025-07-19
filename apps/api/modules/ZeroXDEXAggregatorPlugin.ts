import { IDEXAggregatorPlugin, SwapQuoteRequest, SwapQuote } from '../../../packages/core/plugin/IDEXAggregatorPlugin';
import fetch from 'node-fetch';
import { getTokenInfo } from './tokenRegistry';

const ZEROX_GASLESS_API_BASE = 'https://api.0x.org/gasless/quote';
const ZEROX_API_KEY = process.env.ZEROX_API_KEY || '';

export const ZeroXDEXAggregatorPlugin: IDEXAggregatorPlugin = {
  id: 'dex-0x-gasless',
  name: '0x Gasless DEX Aggregator',
  version: '1.0.0',
  type: 'dex-aggregator',
  async init() {},
  async dispose() {},

  async getSwapQuote(request: SwapQuoteRequest): Promise<SwapQuote[]> {
    try {
      const { chainId, sellToken, buyToken, sellAmount, taker } = request;
      console.log('ZeroXDEXAggregatorPlugin.getSwapQuote - Query Parameters:', {
        chainId, sellToken, buyToken, sellAmount, taker
      });
      const params = new URLSearchParams({
        chainId: chainId.toString(),
        sellToken,
        buyToken,
        sellAmount,
        taker,
      });
      const url = `${ZEROX_GASLESS_API_BASE}?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          '0x-api-key': ZEROX_API_KEY,
          '0x-version': 'v2',
        },
      });
      const data = await response.json();
      const dataObj = data as Record<string, any>;
      if (!response.ok) {
        throw { message: dataObj.message || 'API error', response: { data: dataObj } };
      }
      const quote: SwapQuote = {
        provider: '0x-gasless',
        output: dataObj.buyAmount,
        gas: (dataObj.estimatedGas || dataObj.gas || '').toString(),
        time: (dataObj.expectedDuration || '').toString(),
        priceImpact: dataObj.estimatedPriceImpact ? `${(dataObj.estimatedPriceImpact * 100).toFixed(2)}%` : '',
        recommended: true,
        reason: dataObj.reason || 'Live quote from 0x Gasless API',
        rawQuote: dataObj,
      };
      return [quote];
    } catch (e: any) {
      return [{
        provider: '0x-gasless',
        output: '0',
        gas: '',
        time: '',
        priceImpact: '',
        recommended: false,
        reason: `Error fetching quote: ${e.message}`,
        rawQuote: e.response?.data || null,
      }];
    }
  },
}; 