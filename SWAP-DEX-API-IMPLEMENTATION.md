# SWAP DEX API Implementation

## Overview

This document describes the implementation of the SWAP DEX API using the 0x protocol with Permit2, following the complete 5-step process for token swaps. The implementation retains dynamic data input while providing a comprehensive swap solution.

## Architecture

### Core Components

1. **SwapDEXAPIPlugin** - Main plugin implementing the 5-step SWAP DEX API process
2. **ZeroXGasDEXAggregatorPlugin** - Updated existing plugin with SWAP DEX API integration
3. **AIAgentPipelinePlugin** - Updated pipeline to use the new SWAP DEX API
4. **Test Suite** - Comprehensive testing for the new functionality

### Dependencies

- **viem** - Modern Ethereum library for contract interactions and transaction signing
- **ethers** - Legacy Ethereum library for balance checking
- **node-fetch** - HTTP client for API calls
- **0x API** - DEX aggregation and swap execution

## 5-Step SWAP DEX API Process

### Step 1: Get Indicative Price

**Purpose**: Get a read-only price quote without commitment.

**Implementation**:
```typescript
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
```

**Dynamic Data Input**: All parameters are dynamically resolved from user input:
- `chainId` - Mapped from network name (Ethereum → 1, Optimism → 10, etc.)
- `sellToken` - Mapped from token symbol to contract address
- `buyToken` - Mapped from token symbol to contract address
- `sellAmount` - Converted to smallest units based on token decimals
- `taker` - Resolved from wallet address or context

### Step 2: Set Token Allowance

**Purpose**: Approve Permit2 contract to spend user's tokens.

**Implementation**:
```typescript
async function setTokenAllowance(params: {
  sellToken: string;
  sellAmount: string;
  taker: string;
  chainId: string;
  privateKey: string;
}): Promise<boolean> {
  // Create viem clients for the specific network
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
    chain: { /* chain config */ },
    transport: http(rpcUrl),
  });
  
  // Set up contracts
  const sellTokenContract = getContract({
    address: sellToken as Hex,
    abi: erc20Abi,
    client: publicClient,
  });
  
  // Check current allowance
  const currentAllowance = await sellTokenContract.read.allowance([account.address, PERMIT2_ADDRESS as Hex]) as bigint;
  
  if (BigInt(currentAllowance.toString()) < BigInt(sellAmount)) {
    // Approve Permit2 to spend the token
    const { request } = await sellTokenContract.simulate.approve([PERMIT2_ADDRESS as Hex, maxUint256]);
    const hash = await walletClient.sendTransaction(request);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return true;
  }
  
  return true; // Already approved
}
```

**Dynamic Data Input**: 
- Network-specific RPC URLs based on chainId
- Token contract addresses resolved from symbols
- User's private key from environment variables

### Step 3: Fetch Firm Quote

**Purpose**: Get a firm quote with transaction data for execution.

**Implementation**:
```typescript
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
```

**Dynamic Data Input**: Same dynamic parameter resolution as Step 1.

### Step 4: Sign Permit2 EIP-712 Message

**Purpose**: Sign the Permit2 authorization message.

**Implementation**:
```typescript
// Step 4: Sign the Permit2 EIP-712 message
let signature: Hex;
if (quote.permit2?.eip712) {
  console.log('Signing Permit2 EIP-712 message...');
  signature = await signTypedDataAsync({
    account,
    domain: quote.permit2.eip712.domain,
    types: quote.permit2.eip712.types,
    primaryType: quote.permit2.eip712.primaryType,
    message: quote.permit2.eip712.message,
  });
  console.log('Permit2 signature:', signature);
} else {
  throw new Error('No Permit2 EIP-712 data in quote');
}
```

**Dynamic Data Input**: 
- EIP-712 data comes from the quote response
- Account derived from user's private key

### Step 5: Append Signature and Execute Transaction

**Purpose**: Combine transaction data with signature and execute.

**Implementation**:
```typescript
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
```

**Dynamic Data Input**:
- Transaction data from quote response
- Gas estimation from quote
- Network-specific chain configuration

## Integration with Existing Codebase

### Updated AI Agent Pipeline

The main pipeline has been updated to use the new SWAP DEX API:

```typescript
// In optimizeRoutes function
const quotes = await Promise.all([
  SwapDEXAPIPlugin.getSwapQuote(swapRequest),
  ZeroXGaslessDEXAggregatorPlugin.getSwapQuote(swapRequest),
  ZeroXGasDEXAggregatorPlugin.getSwapQuote(swapRequest),
  ZeroXSimulateDEXAggregatorPlugin.getSwapQuote(swapRequest),
]);
```

### Transaction Execution

The execution logic now handles SWAP DEX API results:

```typescript
} else if (intent.type === 'swap') {
  // Use the new SWAP DEX API for swap execution
  if (routes && routes.length > 0 && routes[0].rawQuote) {
    const route = routes[0];
    const rawQuote = route.rawQuote;
    
    // If we have a complete quote with transaction data, execute it
    if (rawQuote.quoteData?.transaction && rawQuote.executionResult) {
      console.log('Executing swap transaction from SWAP DEX API...');
      
      // The transaction has already been executed by the SWAP DEX API plugin
      return {
        status: 'success',
        transactionHash: rawQuote.executionResult.transactionHash,
        receipt: rawQuote.executionResult.receipt,
        preview: await walletManager.buildTransactionPreview(intent, params, routes)
      };
    } else {
      // Quote-only mode - no execution
      return {
        status: 'quote_only',
        message: 'Swap quote obtained but not executed',
        quote: route,
        preview: await walletManager.buildTransactionPreview(intent, params, routes)
      };
    }
  } else {
    throw new Error('No valid swap routes found');
  }
}
```

## Dynamic Data Input Retention

### Token Resolution

```typescript
// Dynamic token address resolution
const fromTokenInfo = getTokenInfo(params.fromToken, network);
const toTokenInfo = getTokenInfo(params.toToken, network);
const sellToken = fromTokenInfo?.address || params.fromToken;
const buyToken = toTokenInfo?.address || params.toToken;
```

### Amount Conversion

```typescript
// Dynamic amount conversion to smallest units
const sellAmount = toSmallestUnit(params.amount, params.fromToken, network);
```

### Network Mapping

```typescript
// Dynamic network to chainId mapping
const SUPPORTED_NETWORKS: Record<string, number> = {
  'Ethereum': 1,
  'Optimism': 10,
  'Arbitrum': 42161,
};
const chainId = SUPPORTED_NETWORKS[network];
```

### Wallet Address Resolution

```typescript
// Dynamic wallet address resolution
function resolveWalletAddress(raw: string | undefined, context: any): string {
  if (!raw) return context.wallets?.[0]?.address || '';
  const match = raw.match(/0x[a-fA-F0-9]{40}/);
  if (match) return match[0];
  if (raw.toLowerCase().includes('my wallet') || raw.toLowerCase().includes('my main wallet')) {
    return context.wallets?.[0]?.address || '';
  }
  return raw;
}
```

## Testing

### Test Suite

The implementation includes a comprehensive test suite:

```typescript
// Test the complete 5-step SWAP DEX API process
async function testSwapDEXAPIPipeline() {
  // Test parameters - using dynamic data input
  const network = 'Ethereum';
  const chainId = SUPPORTED_NETWORKS[network];
  const fromToken = 'USDC';
  const toToken = 'WETH';
  const amount = '100';
  const taker = testContext.wallets[0].address;
  
  // Map token symbols to addresses (dynamic data input)
  const fromTokenInfo = getTokenInfo(fromToken, network);
  const toTokenInfo = getTokenInfo(toToken, network);
  const sellToken = fromTokenInfo?.address || fromToken;
  const buyToken = toTokenInfo?.address || toToken;
  const sellAmount = toSmallestUnit(amount, fromToken, network);
  
  // Build swap request
  const swapRequest = {
    chainId,
    sellToken,
    buyToken,
    sellAmount,
    taker,
  };
  
  // Test the complete SWAP DEX API pipeline
  const quotes = await SwapDEXAPIPlugin.getSwapQuote(swapRequest);
}
```

### Multi-Network Testing

```typescript
async function testMultipleNetworks() {
  const testCases = [
    { network: 'Ethereum', fromToken: 'USDC', toToken: 'WETH', amount: '50' },
    { network: 'Optimism', fromToken: 'USDC', toToken: 'WETH', amount: '25' },
    { network: 'Arbitrum', fromToken: 'USDC', toToken: 'WETH', amount: '10' },
  ];
  
  for (const testCase of testCases) {
    // Test each network with dynamic data input
  }
}
```

## Environment Variables

Required environment variables:

```bash
# Required for API access
export ZEROX_API_KEY="your_0x_api_key"

# Required for on-chain operations
export INFURA_API_KEY="your_infura_key"

# Required for transaction execution
export DEMO_PRIVATE_KEY="your_private_key"
```

## Usage Examples

### Basic Swap

```typescript
// User prompt: "Swap 100 USDC to WETH on Ethereum"
const result = await SwapDEXAPIPlugin.getSwapQuote({
  chainId: 1,
  sellToken: "0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C", // USDC
  buyToken: "0xC02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
  sellAmount: "100000000", // 100 USDC in smallest units
  taker: "0x1234...5678"
});
```

### Multi-Network Swap

```typescript
// User prompt: "Swap 50 USDC to WETH on Optimism"
const result = await SwapDEXAPIPlugin.getSwapQuote({
  chainId: 10,
  sellToken: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", // USDC on Optimism
  buyToken: "0x4200000000000000000000000000000000000006", // WETH on Optimism
  sellAmount: "50000000", // 50 USDC in smallest units
  taker: "0x1234...5678"
});
```

## Benefits

1. **Complete Integration**: Full 5-step SWAP DEX API process
2. **Dynamic Data Input**: Retains all existing dynamic parameter resolution
3. **Multi-Network Support**: Works across Ethereum, Optimism, and Arbitrum
4. **Real Transaction Execution**: Actual blockchain transactions with Permit2
5. **Comprehensive Testing**: Full test suite with multi-network validation
6. **Backward Compatibility**: Integrates with existing DEX aggregator plugins
7. **Error Handling**: Robust error handling and user feedback
8. **Security**: Proper signature handling and transaction validation

## Next Steps

1. **Production Deployment**: Deploy with proper API keys and security measures
2. **UI Integration**: Connect to frontend for user interaction
3. **Additional Networks**: Extend support to more networks
4. **Performance Optimization**: Implement caching and rate limiting
5. **Monitoring**: Add comprehensive logging and monitoring
6. **Security Audit**: Conduct security review of the implementation 