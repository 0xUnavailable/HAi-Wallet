# HAi Wallet Interactive Demo

## 🎯 Overview

The HAi Wallet Interactive Demo is a production-like command-line interface that showcases the complete AI-powered wallet pipeline. It demonstrates real wallet integration with testnet networks, providing an interactive experience for testing all wallet features.

## 🚀 Features Showcased

### Core Pipeline Steps
1. **Intent Recognition** - Natural language understanding
2. **Parameter Extraction** - Structured data extraction from prompts
3. **Risk Assessment** - Multi-factor security analysis
4. **Route Optimization** - DEX aggregator integration
5. **Transaction Execution** - Real blockchain transaction signing

### Transaction Types
- **Transfers** - Send tokens to contacts or addresses
- **Swaps** - Token-to-token exchanges with gas quotes
- **Gasless Swaps** - Meta-transactions with 0x Gasless API
- **Simulation** - Quote-only mode for testing

### Networks Supported
- **Sepolia** - Ethereum testnet
- **Optimism Sepolia** - Layer 2 testnet
- **Arbitrum Sepolia** - Alternative L2 testnet

## 🛠️ Setup

### Prerequisites
1. **Node.js** (v16 or higher)
2. **Testnet Wallet** with private key
3. **Infura API Key** for RPC access

### Environment Variables
```bash
# Required
export DEMO_PRIVATE_KEY="your_testnet_wallet_private_key"
export INFURA_API_KEY="your_infura_key"

# Optional (defaults to 10 ETH for testnets)
export DAILY_SPENDING_LIMIT="10000000000000000000"
```

### Installation
```bash
# Install dependencies
npm install

# Run the interactive demo
npm run demo
```

## 📋 Available Commands

### Transfer Commands
```bash
# Basic transfer
transfer 0.001 ETH to Bob on Sepolia

# Transfer to address
transfer 1 USDC to 0x1234...5678 on Optimism Sepolia

# Cross-network transfer
transfer 0.002 ETH to Charlie on Arbitrum Sepolia
```

### Swap Commands
```bash
# Basic swap
swap 1 USDC to ETH on Sepolia

# Large amount swap
swap 100 USDC to WETH on Optimism Sepolia

# Cross-token swap
swap 10 DAI to LINK on Sepolia
```

### Quote Commands
```bash
# Get swap quote
get quote for 10 USDC to ETH on Sepolia

# Simulate swap (no execution)
simulate swap 5 USDC to ETH on Sepolia

# Gasless swap quote
gasless swap 2 USDC to ETH on Sepolia
```

### Utility Commands
```bash
# Check balance
get balance on Sepolia

# Show help
help

# Exit demo
exit
```

## 🎮 Interactive Features

### Real-Time Pipeline Display
Each command shows the complete pipeline execution:
```
🎯 Processing: "transfer 0.001 ETH to Bob on Sepolia"
🔧 Step 1: Intent Recognition
✅ Intent: transfer (confidence: 0.98)
📊 Description: Transfer 0.001 ETH to Bob on Sepolia network

🔧 Step 2: Parameter Extraction
✅ Parameters extracted successfully
📊 {
  "amount": "0.001",
  "token": "ETH",
  "recipient": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "network": "Sepolia"
}

🔧 Step 3: Risk Assessment
✅ No risks detected

🔧 Step 5: Transaction Execution
⚠️  Execute this transaction? (y/N): y
✅ Transaction executed successfully!
📊 Transaction Hash: 0x1234...5678
📊 Network: Sepolia
📊 Block Explorer: https://sepolia.etherscan.io/tx/0x1234...5678
```

### Color-Coded Output
- 🔵 **Blue** - Information and status
- 🟢 **Green** - Success messages
- 🟡 **Yellow** - Warnings and confirmations
- 🔴 **Red** - Errors and blocking issues
- 🟣 **Purple** - Pipeline steps
- ⚪ **White** - Results and data

### Safety Features
- **5-Second Safety Delay** - Prevents accidental execution
- **Daily Spending Limits** - Configurable transaction limits
- **Balance Validation** - Prevents insufficient balance transactions
- **Risk Assessment** - Blocks high-risk transactions
- **User Confirmation** - Requires explicit approval for transactions

## 🔧 Technical Details

### Pipeline Components
1. **Intent Recognition** - Uses OpenAI GPT-4 for natural language understanding
2. **Parameter Extraction** - LLM-based extraction with validation
3. **Risk Assessment** - Multi-factor analysis including balance and recipient validation
4. **Route Optimization** - DEX aggregator integration for swaps
5. **Transaction Execution** - Real blockchain transaction signing

### Error Handling
- **Network Errors** - Graceful handling of RPC failures
- **Balance Errors** - Clear insufficient balance messages
- **Parameter Errors** - Validation and correction suggestions
- **Transaction Errors** - Detailed error messages with recovery options

### Wallet Integration
- **Multi-Network Support** - Seamless switching between testnets
- **Real Balance Checking** - Live balance validation across networks
- **Transaction Signing** - Actual blockchain transaction execution
- **Block Explorer Links** - Direct links to view transactions

## 🎯 Demo Scenarios

### Scenario 1: Basic Transfer
```bash
HAi Wallet > transfer 0.001 ETH to Bob on Sepolia
```
**Shows**: Intent recognition, parameter extraction, risk assessment, transaction execution

### Scenario 2: Token Swap
```bash
HAi Wallet > swap 1 USDC to ETH on Sepolia
```
**Shows**: Route optimization, gas estimation, swap execution

### Scenario 3: Cross-Network Transfer
```bash
HAi Wallet > transfer 0.002 ETH to Charlie on Optimism Sepolia
```
**Shows**: Network switching, cross-chain transaction execution

### Scenario 4: Risk Assessment
```bash
HAi Wallet > transfer 1000 ETH to unknown.eth on Sepolia
```
**Shows**: Risk detection, ENS resolution, transaction blocking

## 🚨 Safety Warnings

⚠️ **This demo executes real transactions on testnets!**
- Use only testnet wallets with limited funds
- Get free testnet tokens from faucets
- Never use mainnet private keys
- Test with small amounts first

### Testnet Faucets
- **Sepolia**: https://sepoliafaucet.com/
- **Optimism Sepolia**: https://app.optimism.io/faucet
- **Arbitrum Sepolia**: https://faucet.quicknode.com/arbitrum/sepolia

## 🔮 Next Steps

After experiencing the interactive demo, explore:
1. **Bridge Integration** - Cross-chain transactions
2. **UI Development** - Web interface for HAi Wallet
3. **Advanced Features** - Portfolio management, DeFi integration
4. **Production Deployment** - Mainnet-ready implementation

## 📞 Support

For issues or questions:
1. Check the main project documentation
2. Review error messages in the demo
3. Verify environment variables are set correctly
4. Ensure testnet tokens are available

---

**HAi Wallet Interactive Demo** - Experience the future of AI-powered blockchain transactions! 🚀 