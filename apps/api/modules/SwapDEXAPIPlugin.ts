import { IDEXAggregatorPlugin, SwapQuoteRequest, SwapQuote } from '../../../packages/core/plugin/IDEXAggregatorPlugin';
import fetch from 'node-fetch';
import { getTokenInfo } from './tokenRegistry';
import { ethers } from 'ethers';
import { 
  getContract, 
  createPublicClient, 
  createWalletClient,
  http, 
  type Hex,
  concat, 
  numberToHex, 
  size,
  maxUint256,
  type WalletClient,
  type PublicClient
} from 'viem';
import { signTypedData } from 'viem/accounts';
import { privateKeyToAccount } from 'viem/accounts';

const ZEROX_PRICE_API_BASE = 'https://api.0x.org/swap/permit2/price';
const ZEROX_QUOTE_API_BASE = 'https://api.0x.org/swap/permit2/quote';
const ZEROX_API_KEY = process.env.ZEROX_API_KEY || '';

// Permit2 contract address
const PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3';

// ERC20 ABI for allowance and approve functions
const erc20Abi = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function allowance(address,address) view returns (uint256)',
  'function approve(address,uint256) returns (bool)'
] as const;

// Exchange Proxy ABI for Permit2
const exchangeProxyAbi = [
  'function allowance(address,address) view returns (uint256)'
] as const;

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
  const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
  const balance = await contract.balanceOf(walletAddress);
  return balance.toString();
}

// Step 1: Get Indicative Price
async function getIndicativePrice(params: {
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

  const priceResponse = await fetch(`${ZEROX_PRICE_API_BASE}?${priceParams.toString()}`, { headers });
  const priceData = await priceResponse.json() as any;
  
  if (!priceResponse.ok) {
    throw new Error(`Price API error: ${priceData.message || 'Unknown error'}`);
  }
  
  return priceData;
}

// Step 2: Set Token Allowance
async function setTokenAllowance(params: {
  sellToken: string;
  sellAmount: string;
  taker: string;
  chainId: string;
  privateKey: string;
}): Promise<boolean> {
  const { sellToken, sellAmount, taker, chainId, privateKey } = params;
  
  // Create viem clients
  let rpcUrl = '';
  if (chainId === '1') {
    rpcUrl = `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`;
  } else if (chainId === '10') {
    rpcUrl = `https://optimism-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`;
  } else if (chainId === '42161') {
    rpcUrl = `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`;
  }
  
  if (!rpcUrl) throw new Error(`Unsupported chainId: ${chainId}`);
  
  const publicClient = createPublicClient({
    chain: { 
      id: parseInt(chainId),
      name: chainId === '1' ? 'Ethereum' : chainId === '10' ? 'Optimism' : 'Arbitrum',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [rpcUrl] } }
    },
    transport: http(rpcUrl),
  });
  
  const walletClient = createWalletClient({
    account: privateKeyToAccount(privateKey as Hex),
    chain: { 
      id: parseInt(chainId),
      name: chainId === '1' ? 'Ethereum' : chainId === '10' ? 'Optimism' : 'Arbitrum',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [rpcUrl] } }
    },
    transport: http(rpcUrl),
  });
  
  const account = privateKeyToAccount(privateKey as Hex);
  
  // Set up contracts
  const Permit2 = getContract({
    address: PERMIT2_ADDRESS as Hex,
    abi: exchangeProxyAbi,
    client: publicClient,
  });
  
  const sellTokenContract = getContract({
    address: sellToken as Hex,
    abi: erc20Abi,
    client: publicClient,
  });
  
  // Check allowance
  const currentAllowance = await sellTokenContract.read.allowance([account.address, PERMIT2_ADDRESS as Hex]) as bigint;
  
  if (BigInt(currentAllowance.toString()) < BigInt(sellAmount)) {
    try {
      // Approve Permit2 to spend the token
      const { request } = await sellTokenContract.simulate.approve([PERMIT2_ADDRESS as Hex, maxUint256]);
      console.log('Approving Permit2 to spend token...', request);
      
      // Send the approval transaction
      const hash = await walletClient.sendTransaction({
        ...request,
        to: sellToken as Hex,
      });
      console.log('Approval transaction hash:', hash);
      
      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log('Approved Permit2 to spend token.', receipt);
      return true;
    } catch (error) {
      console.log('Error approving Permit2:', error);
      return false;
    }
  } else {
    console.log('Token already approved for Permit2');
    return true;
  }
}

// Step 3: Fetch Firm Quote
async function getFirmQuote(params: {
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

  const response = await fetch(`${ZEROX_QUOTE_API_BASE}?${quoteParams.toString()}`, { headers });
  const data = await response.json() as any;
  
  if (!response.ok) {
    throw new Error(`Quote API error: ${data.message || 'Unknown error'}`);
  }
  
  return data;
}

// Step 4 & 5: Sign Permit2 and Execute Transaction
async function signAndExecuteTransaction(params: {
  quote: any;
  privateKey: string;
  chainId: string;
}): Promise<any> {
  const { quote, privateKey, chainId } = params;
  
  // Create viem clients
  let rpcUrl = '';
  if (chainId === '1') {
    rpcUrl = `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`;
  } else if (chainId === '10') {
    rpcUrl = `https://optimism-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`;
  } else if (chainId === '42161') {
    rpcUrl = `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`;
  }
  
  if (!rpcUrl) throw new Error(`Unsupported chainId: ${chainId}`);
  
  const publicClient = createPublicClient({
    chain: { 
      id: parseInt(chainId),
      name: chainId === '1' ? 'Ethereum' : chainId === '10' ? 'Optimism' : 'Arbitrum',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [rpcUrl] } }
    },
    transport: http(rpcUrl),
  });
  
  const walletClient = createWalletClient({
    account: privateKeyToAccount(privateKey as Hex),
    chain: { 
      id: parseInt(chainId),
      name: chainId === '1' ? 'Ethereum' : chainId === '10' ? 'Optimism' : 'Arbitrum',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [rpcUrl] } }
    },
    transport: http(rpcUrl),
  });
  
  const account = privateKeyToAccount(privateKey as Hex);
  
  // Step 4: Sign the Permit2 EIP-712 message
  let signature: Hex;
  if (quote.permit2?.eip712) {
    console.log('Signing Permit2 EIP-712 message...');
    signature = await signTypedData({
      privateKey: privateKey as Hex,
      domain: quote.permit2.eip712.domain,
      types: quote.permit2.eip712.types,
      primaryType: quote.permit2.eip712.primaryType,
      message: quote.permit2.eip712.message,
    });
    console.log('Permit2 signature:', signature);
  } else {
    throw new Error('No Permit2 EIP-712 data in quote');
  }
  
  // Step 5: Append signature to transaction data
  let transactionData = quote.transaction.data;
  if (quote.permit2?.eip712) {
    const signatureLengthInHex = numberToHex(size(signature), {
      signed: false,
      size: 32,
    });
    transactionData = concat([transactionData, signatureLengthInHex, signature]);
  }
  
  // Execute transaction
  const transactionRequest = {
    account: account.address,
    gas: quote.transaction.gas ? BigInt(quote.transaction.gas) : undefined,
    to: quote.transaction.to as Hex,
    data: transactionData,
    chainId: parseInt(chainId),
  };
  
  console.log('Executing swap transaction...');
  const hash = await walletClient.sendTransaction(transactionRequest);
  console.log('Swap transaction hash:', hash);
  
  // Wait for transaction confirmation
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log('Swap transaction confirmed:', receipt);
  
  return {
    transactionHash: hash,
    status: 'success',
    receipt,
    data: transactionData
  };
}

export const SwapDEXAPIPlugin: IDEXAggregatorPlugin = {
  id: 'dex-swap-api',
  name: 'SWAP DEX API Plugin',
  version: '1.0.0',
  type: 'dex-aggregator',
  async init() {},
  async dispose() {},
  
  async getSwapQuote(request: SwapQuoteRequest): Promise<SwapQuote[]> {
    try {
      const { chainId, sellToken, buyToken, sellAmount, taker } = request;
      console.log('SwapDEXAPIPlugin.getSwapQuote - Query Parameters:', {
        chainId, sellToken, buyToken, sellAmount, taker
      });
      
      // Step 1: Get Indicative Price (always get price quote first)
      console.log('Step 1: Getting indicative price...');
      const priceData = await getIndicativePrice({
        chainId: chainId.toString(),
        sellToken,
        buyToken,
        sellAmount,
        taker
      });
      console.log('Indicative price received:', priceData);
      
      // Step 3: Fetch Firm Quote (always get quote for price display)
      console.log('Step 3: Fetching firm quote...');
      const quoteData = await getFirmQuote({
        chainId: chainId.toString(),
        sellToken,
        buyToken,
        sellAmount,
        taker
      });
      console.log('Firm quote received:', quoteData);
      
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
      

      
      // Step 2: Set Token Allowance (only if we have sufficient balance and private key)
      let allowanceSet = hasSufficientBalance; // Only true if sufficient balance
      if (hasSufficientBalance && process.env.DEMO_PRIVATE_KEY) {
        console.log('Step 2: Setting token allowance...');
        allowanceSet = await setTokenAllowance({
          sellToken,
          sellAmount,
          taker,
          chainId: chainId.toString(),
          privateKey: process.env.DEMO_PRIVATE_KEY
        });
        if (!allowanceSet) {
          return [{
            provider: 'swap-dex-api',
            output: quoteData.buyAmount,
            gas: (quoteData.estimatedGas || quoteData.gas || '').toString(),
            time: (quoteData.expectedDuration || '').toString(),
            priceImpact: quoteData.estimatedPriceImpact ? `${(quoteData.estimatedPriceImpact * 100).toFixed(2)}%` : '',
            recommended: false,
            reason: 'Failed to set token allowance for Permit2',
            rawQuote: {
              priceData,
              quoteData,
              permit2: quoteData.permit2,
              allowanceSet: false
            },
          }];
        }
      }
      
      // Step 4 & 5: Sign and Execute (only if we have sufficient balance and private key)
      let executionResult = null;
      if (hasSufficientBalance && process.env.DEMO_PRIVATE_KEY && quoteData.permit2?.eip712) {
        console.log('Step 4 & 5: Signing and executing transaction...');
        executionResult = await signAndExecuteTransaction({
          quote: quoteData,
          privateKey: process.env.DEMO_PRIVATE_KEY,
          chainId: chainId.toString()
        });
        console.log('Transaction execution result:', executionResult);
      }
      
      const quote: SwapQuote = {
        provider: 'swap-dex-api',
        output: quoteData.buyAmount,
        gas: (quoteData.estimatedGas || quoteData.gas || '').toString(),
        time: (quoteData.expectedDuration || '').toString(),
        priceImpact: quoteData.estimatedPriceImpact ? `${(quoteData.estimatedPriceImpact * 100).toFixed(2)}%` : '',
        recommended: hasSufficientBalance,
        reason: hasSufficientBalance 
          ? (quoteData.reason || 'Live quote from SWAP DEX API with Permit2')
          : (balanceError || 'Insufficient balance for swap execution'),
        rawQuote: {
          priceData,
          quoteData,
          permit2: quoteData.permit2,
          executionResult,
          allowanceSet
        },
      };
      
      return [quote];
    } catch (e: any) {
      return [{
        provider: 'swap-dex-api',
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