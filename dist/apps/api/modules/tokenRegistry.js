"use strict";
// Centralized token registry for supported networks and tokens
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenInfo = getTokenInfo;
const MAINNET_TOKENS = {
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
// Testnet token configurations
const TESTNET_TOKENS = {
    'Sepolia': {
        'ETH': {
            symbol: 'ETH',
            name: 'Sepolia Ether',
            address: null, // Native token
            decimals: 18,
            network: 'Sepolia'
        },
        'WETH': {
            symbol: 'WETH',
            name: 'Wrapped Sepolia Ether',
            address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // Sepolia WETH
            decimals: 18,
            network: 'Sepolia'
        },
        'USDC': {
            symbol: 'USDC',
            name: 'USD Coin (Sepolia)',
            address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
            decimals: 6,
            network: 'Sepolia'
        },
        'DAI': {
            symbol: 'DAI',
            name: 'Dai Stablecoin (Sepolia)',
            address: '0x68194a729C2450ad26072b3D33ADaCbcef39D574', // Sepolia DAI
            decimals: 18,
            network: 'Sepolia'
        },
        'LINK': {
            symbol: 'LINK',
            name: 'Chainlink (Sepolia)',
            address: '0x779877A7B0D9E8603169DdbD7836e478b4624789', // Sepolia LINK
            decimals: 18,
            network: 'Sepolia'
        }
    },
    'Optimism Sepolia': {
        'ETH': {
            symbol: 'ETH',
            name: 'Optimism Sepolia Ether',
            address: null, // Native token
            decimals: 18,
            network: 'Optimism Sepolia'
        },
        'WETH': {
            symbol: 'WETH',
            name: 'Wrapped Optimism Sepolia Ether',
            address: '0x4200000000000000000000000000000000000006', // Optimism Sepolia WETH
            decimals: 18,
            network: 'Optimism Sepolia'
        },
        'USDC': {
            symbol: 'USDC',
            name: 'USD Coin (Optimism Sepolia)',
            address: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7', // Optimism Sepolia USDC
            decimals: 6,
            network: 'Optimism Sepolia'
        },
        'DAI': {
            symbol: 'DAI',
            name: 'Dai Stablecoin (Optimism Sepolia)',
            address: '0x4EFBdC77B9587eED9d0bA7c720c08dF8c5CdF8f7', // Optimism Sepolia DAI
            decimals: 18,
            network: 'Optimism Sepolia'
        }
    },
    'Arbitrum Sepolia': {
        'ETH': {
            symbol: 'ETH',
            name: 'Arbitrum Sepolia Ether',
            address: null, // Native token
            decimals: 18,
            network: 'Arbitrum Sepolia'
        },
        'WETH': {
            symbol: 'WETH',
            name: 'Wrapped Arbitrum Sepolia Ether',
            address: '0x980B62Da83eFf3D4576C647993b0c1D7faf17c73', // Arbitrum Sepolia WETH
            decimals: 18,
            network: 'Arbitrum Sepolia'
        },
        'USDC': {
            symbol: 'USDC',
            name: 'USD Coin (Arbitrum Sepolia)',
            address: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // Arbitrum Sepolia USDC
            decimals: 6,
            network: 'Arbitrum Sepolia'
        },
        'DAI': {
            symbol: 'DAI',
            name: 'Dai Stablecoin (Arbitrum Sepolia)',
            address: '0x108662dC7d1C4C4C4C4C4C4C4C4C4C4C4C4C4C4C4', // Arbitrum Sepolia DAI (placeholder)
            decimals: 18,
            network: 'Arbitrum Sepolia'
        }
    }
};
function getTokenInfo(symbol, network) {
    // First check testnet tokens
    if (TESTNET_TOKENS[network] && TESTNET_TOKENS[network][symbol.toUpperCase()]) {
        return TESTNET_TOKENS[network][symbol.toUpperCase()];
    }
    // Fallback to mainnet tokens (for reference)
    const net = network;
    if (MAINNET_TOKENS[net] && MAINNET_TOKENS[net][symbol.toUpperCase()]) {
        return MAINNET_TOKENS[net][symbol.toUpperCase()];
    }
    return null;
}
