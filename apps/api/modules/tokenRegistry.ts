// Centralized token registry for supported networks and tokens

export type SupportedNetwork = 'Ethereum' | 'Optimism' | 'Arbitrum';

export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
}

const TOKEN_REGISTRY: Record<SupportedNetwork, Record<string, TokenInfo>> = {
  Ethereum: {
    ETH: {
      symbol: 'ETH',
      name: 'Ether',
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
    },
    WETH: {
      symbol: 'WETH',
      name: 'Wrapped Ether',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18,
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
    },
    USDT: {
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
    },
  },
  Optimism: {
    ETH: {
      symbol: 'ETH',
      name: 'Ether',
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
    },
    WETH: {
      symbol: 'WETH',
      name: 'Wrapped Ether',
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      decimals: 6,
    },
    USDT: {
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      decimals: 6,
    },
  },
  Arbitrum: {
    ETH: {
      symbol: 'ETH',
      name: 'Ether',
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
    },
    WETH: {
      symbol: 'WETH',
      name: 'Wrapped Ether',
      address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
      decimals: 18,
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      decimals: 6,
    },
    USDT: {
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
      decimals: 6,
    },
  },
};

export function getTokenInfo(symbol: string, network: string): TokenInfo | undefined {
  const net = network as SupportedNetwork;
  return TOKEN_REGISTRY[net]?.[symbol.toUpperCase()];
} 