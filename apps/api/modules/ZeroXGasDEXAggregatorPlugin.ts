import { IDEXAggregatorPlugin, SwapQuoteRequest, SwapQuote } from '../../../packages/core/plugin/IDEXAggregatorPlugin';
import fetch from 'node-fetch';
import { getTokenInfo } from './tokenRegistry';
import { ethers } from 'ethers';

const ZEROX_GAS_API_BASE = 'https://api.0x.org/swap/permit2/quote';
const ZEROX_API_KEY = process.env.ZEROX_API_KEY || '';

async function getERC20Balance({
  walletAddress,
  tokenAddress,
  network = 'Ethereum',
  infuraKey
}: {
  walletAddress: string;
  tokenAddress: string;
  network?: string;
  infuraKey: string;
}): Promise<string> {
  let rpcUrl = '';
  if (network === 'Ethereum') {
    rpcUrl = `https://mainnet.infura.io/v3/${infuraKey}`;
  } else if (network === 'Optimism') {
    rpcUrl = `https://optimism-mainnet.infura.io/v3/${infuraKey}`;
  } else if (network === 'Arbitrum') {
    rpcUrl = `https://arbitrum-mainnet.infura.io/v3/${infuraKey}`;
  }
  if (!rpcUrl) throw new Error(`Unsupported network: ${network}`);
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const erc20Abi = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"];
  const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
  const balance = await contract.balanceOf(walletAddress);
  return balance.toString();
}

export const ZeroXGasDEXAggregatorPlugin: IDEXAggregatorPlugin = {
  id: 'dex-0x-gas',
  name: '0x Gas DEX Aggregator',
  version: '1.0.0',
  type: 'dex-aggregator',
  async init() {},
  async dispose() {},
  async getSwapQuote(request: SwapQuoteRequest): Promise<SwapQuote[]> {
    try {
      const { chainId, sellToken, buyToken, sellAmount, taker } = request;
      console.log('ZeroXGasDEXAggregatorPlugin.getSwapQuote - Query Parameters:', {
        chainId, sellToken, buyToken, sellAmount, taker
      });
      const params = new URLSearchParams({
        chainId: chainId.toString(),
        sellToken,
        buyToken,
        sellAmount,
        taker
      });
      if (taker) params.append('takerAddress', taker);
      const url = `${ZEROX_GAS_API_BASE}?${params.toString()}`;
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
      // On-chain balance check (block if insufficient)
      if (taker && sellToken && sellAmount) {
        try {
          const infuraKey = process.env.INFURA_API_KEY || '';
          let network = 'Ethereum';
          if (chainId === 10) network = 'Optimism';
          if (chainId === 42161) network = 'Arbitrum';
          const onChainBalance = await getERC20Balance({
            walletAddress: taker,
            tokenAddress: sellToken,
            network,
            infuraKey
          });
          if (BigInt(onChainBalance) < BigInt(sellAmount)) {
            return [{
              provider: '0x-gas',
              output: '0',
              gas: '',
              time: '',
              priceImpact: '',
              recommended: false,
              reason: `Insufficient balance: taker address ${taker} has ${onChainBalance}, needs ${sellAmount}.`,
              rawQuote: null,
            }];
          }
        } catch (err) {
          return [{
            provider: '0x-gas',
            output: '0',
            gas: '',
            time: '',
            priceImpact: '',
            recommended: false,
            reason: `Error checking on-chain balance for taker address ${taker}.`,
            rawQuote: null,
          }];
        }
      }
      const quote: SwapQuote = {
        provider: '0x-gas',
        output: dataObj.buyAmount,
        gas: (dataObj.estimatedGas || dataObj.gas || '').toString(),
        time: (dataObj.expectedDuration || '').toString(),
        priceImpact: dataObj.estimatedPriceImpact ? `${(dataObj.estimatedPriceImpact * 100).toFixed(2)}%` : '',
        recommended: true,
        reason: dataObj.reason || 'Live quote from 0x Gas API',
        rawQuote: dataObj,
      };
      return [quote];
    } catch (e: any) {
      return [{
        provider: '0x-gas',
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