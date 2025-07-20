#!/bin/bash

# HAi Wallet Live Demo Startup Script
# Enhanced for SWAP DEX API and Gasless DEX API

echo "🚀 HAi Wallet Live Demo"
echo "========================"
echo "Featuring SWAP DEX API (5-step) and Gasless DEX API (4-step)"
echo "Using MAINNET networks (Ethereum, Optimism, Arbitrum)"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check environment variables
MISSING_VARS=()

if [ -z "$DEMO_PRIVATE_KEY" ]; then
    MISSING_VARS+=("DEMO_PRIVATE_KEY")
fi

if [ -z "$INFURA_API_KEY" ]; then
    MISSING_VARS+=("INFURA_API_KEY")
fi

if [ -z "$OPENAI_API_KEY" ]; then
    MISSING_VARS+=("OPENAI_API_KEY")
fi

if [ -z "$ZEROX_API_KEY" ]; then
    MISSING_VARS+=("ZEROX_API_KEY")
fi

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "📋 Complete Setup Instructions:"
    echo "1. Create a testnet wallet (never use mainnet!)"
    echo "2. Get your private key from the wallet"
    echo "3. Get API keys from:"
    echo "   - Infura: https://infura.io"
    echo "   - OpenAI: https://platform.openai.com"
    echo "   - 0x Protocol: https://dashboard.0x.org"
    echo "4. Set the environment variables:"
    echo ""
    echo "   export DEMO_PRIVATE_KEY=\"your_testnet_wallet_private_key\"0x09ef70eff4b47092653498e211f4e3588fd47a172ff2502938e1798779cc899c"
    echo "   export INFURA_API_KEY=\"your_infura_key\"da332b558aa849e880272262ac6f50bf"
    echo "   export OPENAI_API_KEY=\"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""
    echo "   export ZEROX_API_KEY=\"your_0x_key\"e735d1a0-f1fd-4a6b-ac99-c90372dec3c1"
    echo ""
    echo "5. Ensure your wallet has mainnet tokens:"
    echo "   - Ethereum: Real ETH and tokens"
    echo "   - Optimism: Real ETH and tokens"
    echo "   - Arbitrum: Real ETH and tokens"
    echo ""
    echo "6. Run this script again"
    exit 1
fi

echo "✅ Environment variables configured"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

echo "✅ Dependencies installed"

# Display wallet address
WALLET_ADDRESS=$(node -e "
const { ethers } = require('ethers');
const privateKey = process.env.DEMO_PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey);
console.log(wallet.address);
" 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ Wallet Address: $WALLET_ADDRESS"
else
    echo "❌ Invalid private key format"
    exit 1
fi

echo ""
echo "🔌 Available APIs:"
echo "   - SWAP DEX API (5-step process with Permit2)"
echo "   - Gasless DEX API (4-step meta-transaction process)"
echo "   - Traditional Transfer API"
echo ""

echo "🎬 Demo Scenarios Available:"
echo "   1. Basic Transfer: transfer 0.001 ETH to Bob on Ethereum"
echo "   2. Token Swap (Gas): swap 1 USDC to ETH on Ethereum"
echo "   3. Gasless Swap: gasless swap 2 USDC to ETH on Ethereum"
echo "   4. Cross-Network Transfer: transfer 0.002 ETH to Charlie on Optimism"
echo "   5. Large Amount Swap: swap 10 USDC to WETH on Ethereum"
echo "   6. Quote Only: get quote for 5 USDC to ETH on Ethereum"
echo ""

echo "⚠️  IMPORTANT SAFETY WARNINGS:"
echo "   - This demo executes REAL transactions on MAINNET"
echo "   - Use only wallets with funds you can afford to lose"
echo "   - Start with small amounts first"
echo "   - SWAP DEX API requires Permit2 approval"
echo "   - Gasless DEX API uses meta-transactions"
echo "   - Double-check all transaction details before confirming"
echo ""

# Ask for confirmation
read -p "Do you want to proceed with the live demo? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Demo cancelled"
    exit 0
fi

echo ""
echo "🎯 Starting HAi Wallet Live Demo..."
echo "Type 'demo scenarios' to see example commands"
echo "Type 'help' for available commands or 'exit' to quit"
echo ""

# Run the interactive demo
npm run demo 