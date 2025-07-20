import { IDEXAggregatorPlugin, SwapQuoteRequest, SwapQuote } from '../../../packages/core/plugin/IDEXAggregatorPlugin';
import fetch from 'node-fetch';
import { getTokenInfo } from './tokenRegistry';
import { ethers } from 'ethers';
import { 
  signTypedData
} from 'viem/accounts';
import { privateKeyToAccount } from 'viem/accounts';
import { type Hex } from 'viem';

const ZEROX_GASLESS_PRICE_API_BASE = 'https://api.0x.org/gasless/price';
const ZEROX_GASLESS_QUOTE_API_BASE = 'https://api.0x.org/gasless/quote';
const ZEROX_GASLESS_SUBMIT_API_BASE = 'https://api.0x.org/gasless/submit';
const ZEROX_GASLESS_STATUS_API_BASE = 'https://api.0x.org/gasless/status';
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

// Step 1: Get Indicative Price
async function getGaslessIndicativePrice(params: {
  chainId: string;
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  taker: string;
}): Promise<any> {
  const priceParams = new URLSearchParams({
    chainId: params.chainId,
    sellToken: params.sellToken,
    buyToken: params.buyToken,
    sellAmount: params.sellAmount,
    taker: params.taker,
  });

  const headers = {
    '0x-api-key': ZEROX_API_KEY,
    '0x-version': 'v2',
  };

  const priceResponse = await fetch(`${ZEROX_GASLESS_PRICE_API_BASE}?${priceParams.toString()}`, { headers });
  const priceData = await priceResponse.json() as any;
  
  if (!priceResponse.ok) {
    throw new Error(`Gasless Price API error: ${priceData.message || 'Unknown error'}`);
  }
  
  return priceData;
}

// Step 2: Get Firm Quote
async function getGaslessFirmQuote(params: {
  chainId: string;
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  taker: string;
}): Promise<any> {
  const quoteParams = new URLSearchParams({
    sellToken: params.sellToken,
    buyToken: params.buyToken,
    sellAmount: params.sellAmount,
    taker: params.taker,
    chainId: params.chainId,
  });

  const headers = {
    '0x-api-key': ZEROX_API_KEY,
    '0x-version': 'v2',
  };

  const response = await fetch(`${ZEROX_GASLESS_QUOTE_API_BASE}?${quoteParams.toString()}`, { headers });
  const data = await response.json() as any;
  
  if (!response.ok) {
    throw new Error(`Gasless Quote API error: ${data.message || 'Unknown error'}`);
  }
  
  return data;
}

// Step 3: Submit Transaction
async function submitGaslessTransaction(params: {
  quote: any;
  privateKey: string;
}): Promise<any> {
  const { quote, privateKey } = params;
  const account = privateKeyToAccount(privateKey as Hex);
  
  console.log('Step 3: Signing and submitting gasless transaction...');
  
  // Sign the trade EIP-712 message
  let tradeSignature;
  if (quote.trade?.eip712) {
    console.log('Signing trade EIP-712 message...');
    tradeSignature = await signTypedData({
      privateKey: privateKey as Hex,
      domain: quote.trade.eip712.domain,
      types: quote.trade.eip712.types,
      primaryType: quote.trade.eip712.primaryType,
      message: quote.trade.eip712.message,
    });
    console.log('Trade signature:', tradeSignature);
  } else {
    throw new Error('No trade EIP-712 data in quote');
  }
  
  // Sign the approval EIP-712 message (if applicable)
  let approvalSignature = null;
  if (quote.approval?.eip712) {
    console.log('Signing approval EIP-712 message...');
    approvalSignature = await signTypedData({
      privateKey: privateKey as Hex,
      domain: quote.approval.eip712.domain,
      types: quote.approval.eip712.types,
      primaryType: quote.approval.eip712.primaryType,
      message: quote.approval.eip712.message,
    });
    console.log('Approval signature:', approvalSignature);
  }
  
  // Prepare submission payload
  const submitPayload: any = {
    trade: {
      type: quote.trade.type,
      eip712: quote.trade.eip712,
      signature: {
        v: parseInt(tradeSignature.slice(130, 132), 16),
        r: tradeSignature.slice(0, 66),
        s: '0x' + tradeSignature.slice(66, 130),
        signatureType: 2
      }
    }
  };
  
  // Add approval if present
  if (approvalSignature && quote.approval) {
    submitPayload.approval = {
      type: quote.approval.type,
      eip712: quote.approval.eip712,
      signature: {
        v: parseInt(approvalSignature.slice(130, 132), 16),
        r: approvalSignature.slice(0, 66),
        s: '0x' + approvalSignature.slice(66, 130),
        signatureType: 2
      }
    };
  }
  
  // Submit the transaction
  const headers = {
    '0x-api-key': ZEROX_API_KEY,
    '0x-version': 'v2',
    'Content-Type': 'application/json',
  };
  
  console.log('Submitting gasless transaction...');
  const submitResponse = await fetch(ZEROX_GASLESS_SUBMIT_API_BASE, {
    method: 'POST',
    headers,
    body: JSON.stringify(submitPayload),
  });
  
  const submitData = await submitResponse.json() as any;
  
  if (!submitResponse.ok) {
    throw new Error(`Gasless Submit API error: ${submitData.message || 'Unknown error'}`);
  }
  
  console.log('Gasless transaction submitted:', submitData);
  return submitData;
}

// Step 4: Check Trade Status
async function checkGaslessTradeStatus(tradeHash: string): Promise<any> {
  const headers = {
    '0x-api-key': ZEROX_API_KEY,
    '0x-version': 'v2',
  };
  
  const statusResponse = await fetch(`${ZEROX_GASLESS_STATUS_API_BASE}/${tradeHash}`, { headers });
  const statusData = await statusResponse.json() as any;
  
  if (!statusResponse.ok) {
    throw new Error(`Gasless Status API error: ${statusData.message || 'Unknown error'}`);
  }
  
  return statusData;
}

export const GaslessDEXAPIPlugin: IDEXAggregatorPlugin = {
  id: 'dex-gasless-api',
  name: 'Gasless DEX API Plugin',
  version: '1.0.0',
  type: 'dex-aggregator',
  async init() {},
  async dispose() {},
  
  async getSwapQuote(request: SwapQuoteRequest): Promise<SwapQuote[]> {
    try {
      const { chainId, sellToken, buyToken, sellAmount, taker } = request;
      console.log('GaslessDEXAPIPlugin.getSwapQuote - Query Parameters:', {
        chainId, sellToken, buyToken, sellAmount, taker
      });
      
      // Step 1: Get Indicative Price (always get price quote first)
      console.log('Step 1: Getting gasless indicative price...');
      const priceData = await getGaslessIndicativePrice({
        chainId: chainId.toString(),
        sellToken,
        buyToken,
        sellAmount,
        taker
      });
      console.log('Gasless indicative price received:', priceData);
      
      // Step 2: Get Firm Quote (always get quote for price display)
      console.log('Step 2: Getting gasless firm quote...');
      const quoteData = await getGaslessFirmQuote({
        chainId: chainId.toString(),
        sellToken,
        buyToken,
        sellAmount,
        taker
      });
      console.log('Gasless firm quote received:', quoteData);
      
      // Check balance after getting quotes (for execution decision only)
      let hasSufficientBalance = true;
      let balanceError = null;
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
            hasSufficientBalance = false;
            balanceError = `Insufficient balance: taker address ${taker} has ${onChainBalance}, needs ${sellAmount}.`;
          }
        } catch (err) {
          hasSufficientBalance = false;
          balanceError = `Error checking on-chain balance for taker address ${taker}.`;
        }
      }
      
      // Step 3: Submit Transaction (only if we have sufficient balance and private key)
      let submitResult = null;
      if (hasSufficientBalance && process.env.DEMO_PRIVATE_KEY) {
        console.log('Step 3: Submitting gasless transaction...');
        submitResult = await submitGaslessTransaction({
          quote: quoteData,
          privateKey: process.env.DEMO_PRIVATE_KEY
        });
        console.log('Gasless transaction submission result:', submitResult);
      }
      
      // Step 4: Check Trade Status (only if transaction was submitted)
      let statusResult = null;
      if (submitResult?.tradeHash) {
        console.log('Step 4: Checking gasless trade status...');
        statusResult = await checkGaslessTradeStatus(submitResult.tradeHash);
        console.log('Gasless trade status:', statusResult);
      }
      
      const quote: SwapQuote = {
        provider: 'gasless-dex-api',
        output: quoteData.buyAmount,
        gas: '0', // Gasless transactions have no gas cost for user
        time: (quoteData.expectedDuration || '').toString(),
        priceImpact: quoteData.estimatedPriceImpact ? `${(quoteData.estimatedPriceImpact * 100).toFixed(2)}%` : '',
        recommended: hasSufficientBalance,
        reason: hasSufficientBalance 
          ? (quoteData.reason || 'Live quote from Gasless DEX API')
          : (balanceError || 'Insufficient balance for gasless swap execution'),
        rawQuote: {
          priceData,
          quoteData,
          submitResult,
          statusResult,
          hasSufficientBalance
        },
      };
      
      return [quote];
    } catch (e: any) {
      return [{
        provider: 'gasless-dex-api',
        output: '0',
        gas: '0',
        time: '',
        priceImpact: '',
        recommended: false,
        reason: `Error fetching gasless quote: ${e.message}`,
        rawQuote: e.response?.data || null,
      }];
    }
  },
}; 