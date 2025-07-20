// Centralized token registry for supported networks and tokens

export type SupportedNetwork = 'Ethereum' | 'Optimism' | 'Arbitrum' | 'Base';

export interface TokenInfo {
  symbol: string;
  name: string;
  address: string | null; // null for native tokens like ETH
  decimals: number;
  network?: string; // Optional network identifier
}

export interface NetworkChainConfig {
  id: number;
  name: string;
  network: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrl: string;
  blockExplorer?: string;
}

export interface TokenRegistryNetwork {
  chain: NetworkChainConfig;
  tokens: Record<string, TokenInfo>;
}

// Move these above TOKEN_REGISTRY
const MAINNET_TOKENS: Record<SupportedNetwork, Record<string, TokenInfo>> = {
  Ethereum: {
    ETH: {
      symbol: 'ETH',
      name: 'Ether',
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Standard native ETH placeholder
      decimals: 18,
      network: 'Ethereum'
    },
    WETH: {
      symbol: 'WETH',
      name: 'Wrapped Ether',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18,
      network: 'Ethereum'
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
      network: 'Ethereum'
    },
    USDT: {
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      network: 'Ethereum'
    }
  },
  Optimism: {
    ETH: {
      symbol: 'ETH',
      name: 'Ether',
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      network: 'Optimism'
    },
    WETH: {
      symbol: 'WETH',
      name: 'Wrapped Ether',
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      network: 'Optimism'
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      decimals: 6,
      network: 'Optimism'
    },
    USDT: {
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      decimals: 6,
      network: 'Optimism'
    }
  },
  Arbitrum: {
    ETH: {
      symbol: 'ETH',
      name: 'Ether',
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      network: 'Arbitrum'
    },
    WETH: {
      symbol: 'WETH',
      name: 'Wrapped Ether',
      address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
      decimals: 18,
      network: 'Arbitrum'
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      decimals: 6,
      network: 'Arbitrum'
    },
    USDT: {
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
      decimals: 6,
      network: 'Arbitrum'
    }
  },
  Base: {
    ETH: {
      symbol: 'ETH',
      name: 'Base Ether',
      address: '0x4200000000000000000000000000000000000006', // Native ETH on Base
      decimals: 18,
      network: 'Base'
    },
    WETH: {
      symbol: 'WETH',
      name: 'Wrapped Base Ether',
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      network: 'Base'
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0xd9AAEC86B6eB8cB6e0B6e0B6e0B6e0B6e0B6e0B6', // Example address, update as needed
      decimals: 6,
      network: 'Base'
    },
    USDT: {
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0x2e3A2fb8473316A02b8A297B982498E661E1f6f5', // Example address, update as needed
      decimals: 6,
      network: 'Base'
    }
  }
};

// Testnet token configurations
const TESTNET_TOKENS: Record<string, Record<string, TokenInfo>> = {
  Sepolia: {
    ETH: {
      symbol: 'ETH',
      name: 'Sepolia Ether',
      address: null, // Native token
      decimals: 18,
      network: 'Sepolia'
    },
    WETH: {
      symbol: 'WETH',
      name: 'Wrapped Sepolia Ether',
      address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
      decimals: 18,
      network: 'Sepolia'
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin (Sepolia)',
      address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      decimals: 6,
      network: 'Sepolia'
    },
    USDT: {
      symbol: 'USDT',
      name: 'Tether USD (Sepolia)',
      address: '0x516de3a7a567d81737e3a46ec4ff9cfd1fcb0136', // Example address, update as needed
      decimals: 6,
      network: 'Sepolia'
    }
  },
  'Optimism Sepolia': {
    ETH: {
      symbol: 'ETH',
      name: 'Optimism Sepolia Ether',
      address: null, // Native token
      decimals: 18,
      network: 'Optimism Sepolia'
    },
    WETH: {
      symbol: 'WETH',
      name: 'Wrapped Optimism Sepolia Ether',
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      network: 'Optimism Sepolia'
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin (Optimism Sepolia)',
      address: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7',
      decimals: 6,
      network: 'Optimism Sepolia'
    },
    USDT: {
      symbol: 'USDT',
      name: 'Tether USD (Optimism Sepolia)',
      address: '0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9', // Example address, update as needed
      decimals: 6,
      network: 'Optimism Sepolia'
    }
  },
  'Arbitrum Sepolia': {
    ETH: {
      symbol: 'ETH',
      name: 'Arbitrum Sepolia Ether',
      address: null, // Native token
      decimals: 18,
      network: 'Arbitrum Sepolia'
    },
    WETH: {
      symbol: 'WETH',
      name: 'Wrapped Arbitrum Sepolia Ether',
      address: '0x980B62Da83eFf3D4576C647993b0c1D7faf17c73',
      decimals: 18,
      network: 'Arbitrum Sepolia'
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin (Arbitrum Sepolia)',
      address: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
      decimals: 6,
      network: 'Arbitrum Sepolia'
    },
    USDT: {
      symbol: 'USDT',
      name: 'Tether USD (Arbitrum Sepolia)',
      address: '0xD9BA894E0097f8cC2BBc9D24D308b98e36dc6D02', // Example address, update as needed
      decimals: 6,
      network: 'Arbitrum Sepolia'
    }
  },
  'Base Sepolia': {
    ETH: {
      symbol: 'ETH',
      name: 'Base Sepolia Ether',
      address: null, // Native token
      decimals: 18,
      network: 'Base Sepolia'
    },
    WETH: {
      symbol: 'WETH',
      name: 'Wrapped Base Sepolia Ether',
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      network: 'Base Sepolia'
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin (Base Sepolia)',
      address: '0xD9BA894E0097f8cC2BBc9D24D308b98e36dc6D02', // Example address, update as needed
      decimals: 6,
      network: 'Base Sepolia'
    },
    USDT: {
      symbol: 'USDT',
      name: 'Tether USD (Base Sepolia)',
      address: '0x516de3a7a567d81737e3a46ec4ff9cfd1fcb0136', // Example address, update as needed
      decimals: 6,
      network: 'Base Sepolia'
    }
  }
};

// Now TOKEN_REGISTRY can reference them
const TOKEN_REGISTRY: Record<string, TokenRegistryNetwork> = {
  'Ethereum': {
    chain: {
      id: 1,
      name: 'Ethereum',
      network: 'mainnet',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrl: process.env.ETHEREUM_MAINNET_RPC_URL || 'https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}',
      blockExplorer: 'https://etherscan.io'
    },
    tokens: MAINNET_TOKENS['Ethereum']
  },
  'Optimism': {
    chain: {
      id: 10,
      name: 'Optimism',
      network: 'optimism',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrl: process.env.OPTIMISM_MAINNET_RPC_URL || 'https://optimism-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}',
      blockExplorer: 'https://optimistic.etherscan.io'
    },
    tokens: MAINNET_TOKENS['Optimism']
  },
  'Arbitrum': {
    chain: {
      id: 42161,
      name: 'Arbitrum',
      network: 'arbitrum',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrl: process.env.ARBITRUM_MAINNET_RPC_URL || 'https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}',
      blockExplorer: 'https://arbiscan.io'
    },
    tokens: MAINNET_TOKENS['Arbitrum']
  },
  'Base': {
    chain: {
      id: 8453,
      name: 'Base',
      network: 'base',
      nativeCurrency: { name: 'Base Ether', symbol: 'ETH', decimals: 18 },
      rpcUrl: process.env.BASE_MAINNET_RPC_URL || 'https://mainnet.base.org',
      blockExplorer: 'https://basescan.org'
    },
    tokens: MAINNET_TOKENS['Base']
  },
  'Sepolia': {
    chain: {
      id: 11155111,
      name: 'Sepolia',
      network: 'sepolia',
      nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
      rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
      blockExplorer: 'https://sepolia.etherscan.io'
    },
    tokens: TESTNET_TOKENS['Sepolia']
  },
  'Optimism Sepolia': {
    chain: {
      id: 11155420,
      name: 'Optimism Sepolia',
      network: 'optimism-sepolia',
      nativeCurrency: { name: 'Optimism Sepolia Ether', symbol: 'ETH', decimals: 18 },
      rpcUrl: process.env.OPTIMISM_SEPOLIA_RPC_URL || 'https://optimism-sepolia.publicnode.com',
      blockExplorer: 'https://sepolia-optimism.etherscan.io'
    },
    tokens: TESTNET_TOKENS['Optimism Sepolia']
  },
  'Arbitrum Sepolia': {
    chain: {
      id: 421614,
      name: 'Arbitrum Sepolia',
      network: 'arbitrum-sepolia',
      nativeCurrency: { name: 'Arbitrum Sepolia Ether', symbol: 'ETH', decimals: 18 },
      rpcUrl: process.env.ARBITRUM_SEPOLIA_RPC_URL || 'https://arbitrum-sepolia.publicnode.com',
      blockExplorer: 'https://sepolia.arbiscan.io'
    },
    tokens: TESTNET_TOKENS['Arbitrum Sepolia']
  },
  'Base Sepolia': {
    chain: {
      id: 84532,
      name: 'Base Sepolia',
      network: 'base-sepolia',
      nativeCurrency: { name: 'Base Sepolia Ether', symbol: 'ETH', decimals: 18 },
      rpcUrl: process.env.BASE_SEPOLIA_RPC_URL || 'https://base-sepolia.public.blastapi.io',
      blockExplorer: 'https://base-sepolia.blockscout.com'
    },
    tokens: TESTNET_TOKENS['Base Sepolia']
  }
};

export function getTokenInfo(symbol: string, network: string): TokenInfo | null {
  // First check testnet tokens
  if (TESTNET_TOKENS[network] && TESTNET_TOKENS[network][symbol.toUpperCase()]) {
    return TESTNET_TOKENS[network][symbol.toUpperCase()];
  }
  
  // Fallback to mainnet tokens (for reference)
  const net = network as SupportedNetwork;
  if (MAINNET_TOKENS[net] && MAINNET_TOKENS[net][symbol.toUpperCase()]) {
    return MAINNET_TOKENS[net][symbol.toUpperCase()];
  }
  // Fallback for native ETH on any EVM network
  if (symbol.toUpperCase() === 'ETH') {
    return {
      symbol: 'ETH',
      name: `${network} Ether`,
      address: null, // Native token
      decimals: 18,
      network
    };
  }
  return null;
}

export function getNetworkChainConfig(network: string): NetworkChainConfig | null {
  return TOKEN_REGISTRY[network]?.chain || null;
} 