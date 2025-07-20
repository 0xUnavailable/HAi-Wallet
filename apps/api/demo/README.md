# HAi Wallet Demo

## Features

- **Universal EVM support:** Transfer and swap on Ethereum, Optimism, Arbitrum, Base (mainnet and testnet).
- **Prompt-driven:** Specify network and token by symbol in your prompt (e.g. "swap 100 ETH to USDC on Optimism").
- **Automatic address resolution:** All swap and transfer operations now resolve token symbols (ETH, WETH, USDC, USDT, etc.) to their canonical contract addresses for the selected network before making any DEX or transfer API call.
- **Token registry as source of truth:** The token registry is the single source of truth for all token addresses and network configs, and is used by both gas and gasless swap APIs as well as transfers.
- **No hardcoded logic:** Users can use symbols in prompts, but the system will always use addresses for on-chain operations, ensuring accuracy and compatibility.

## Usage

- Use prompts like:
  - "Transfer 0.01 ETH to 0x... on Arbitrum"
  - "Swap 100 USDC to ETH on Base Sepolia"

## Extensibility

- Add new tokens or networks to the registry to instantly enable them for all features. 