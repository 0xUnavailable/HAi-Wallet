// Registry for chain IDs and token addresses
const NETWORKS = {
  Ethereum: {
    chainId: 11155111,
    tokens: {
      USDC: '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238',
      WETH: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
      ETH: '0x0000000000000000000000000000000000000000', // convention for native ETH
    },
    decimals: {
      USDC: 6,
      USDT: 6,
      ETH: 18,
    },
  },
  Base: {
    chainId: 84532,
    tokens: {
      USDC: '0x036cbd53842c5426634e7929541ec2318f3dcf7e',
      WETH: '0x4200000000000000000000000000000000000006',
      ETH: '0x0000000000000000000000000000000000000000', // Base native ETH (WETH)
    },
    decimals: {
      USDC: 6,
      USDT: 6,
      ETH: 18,
    },
  },
  Optimism: {
    chainId: 11155420,
    tokens: {
      ETH: '0x0000000000000000000000000000000000000000', // Optimism native ETH (WETH)
    },
    decimals: {
      USDC: 6,
      USDT: 6,
      ETH: 18,
    },
  },
};

export function getChainId(networkName: string): number {
  const net = NETWORKS[networkName as keyof typeof NETWORKS];
  if (!net) throw new Error(`Unknown network: ${networkName}`);
  return net.chainId;
}

export function getTokenAddress(tokenSymbol: string, networkName: string): string {
  const net = NETWORKS[networkName as keyof typeof NETWORKS];
  if (!net) throw new Error(`Unknown network: ${networkName}`);
  const addr = net.tokens[tokenSymbol as keyof typeof net.tokens];
  if (!addr) throw new Error(`Unknown token ${tokenSymbol} on network ${networkName}`);
  return addr;
}

export function parseAmount(amount: string, tokenSymbol: string, networkName: string): bigint {
  if (amount == null) {
    throw new Error(`Amount is required for token ${tokenSymbol} on ${networkName}`);
  }
  const net = NETWORKS[networkName as keyof typeof NETWORKS];
  if (!net) throw new Error(`Unknown network: ${networkName}`);
  const decimals = net.decimals[tokenSymbol as keyof typeof net.decimals];
  if (decimals === undefined) throw new Error(`Unknown decimals for ${tokenSymbol} on ${networkName}`);
  // Support decimal input (e.g., '1.23')
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = (fraction + '0'.repeat(decimals)).slice(0, decimals);
  return BigInt(whole + paddedFraction);
}

interface TokenParam {
  amount: string | null;
  token: string;
}

interface NLPParams {
  from: string;
  to: string;
  source_network: string;
  dest_network: string;
  tokens: TokenParam[];
  token2: any;
  query_type: any;
}

type Intent = 'Swap' | 'Bridge' | 'Transfer';

export function buildQuoteParams(intent: Intent, params: NLPParams) {
  const user = params.from;
  const recipient = params.to;
  const originChainId = getChainId(params.source_network);
  const destinationChainId = getChainId(params.dest_network);
  let originCurrency, destinationCurrency, amount;

  if (intent === 'Swap') {
    originCurrency = getTokenAddress(params.tokens[0].token, params.source_network);
    destinationCurrency = getTokenAddress(params.tokens[1].token, params.dest_network);
    amount = parseAmount(params.tokens[0].amount!, params.tokens[0].token, params.source_network);
    return {
      user,
      originChainId,
      destinationChainId,
      originCurrency,
      destinationCurrency,
      amount: amount.toString(),
      tradeType: 'EXACT_INPUT',
    };
  } else if (intent === 'Bridge') {
    originCurrency = getTokenAddress(params.tokens[0].token, params.source_network);
    destinationCurrency = getTokenAddress(params.tokens[0].token, params.dest_network);
    amount = parseAmount(params.tokens[0].amount!, params.tokens[0].token, params.source_network);
    return {
      user,
      originChainId,
      destinationChainId,
      originCurrency,
      destinationCurrency,
      amount: amount.toString(),
      tradeType: 'EXACT_INPUT',
    };
  } else if (intent === 'Transfer') {
    originCurrency = getTokenAddress(params.tokens[0].token, params.source_network);
    destinationCurrency = getTokenAddress(params.tokens[0].token, params.dest_network);
    amount = parseAmount(params.tokens[0].amount!, params.tokens[0].token, params.source_network);
    return {
      user,
      recipient,
      originChainId,
      destinationChainId,
      originCurrency,
      destinationCurrency,
      amount: amount.toString(),
      tradeType: 'EXACT_INPUT',
    };
  } else {
    throw new Error(`Unsupported intent: ${intent}`);
  }
} 