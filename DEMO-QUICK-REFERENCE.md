# HAi Wallet Live Demo - Quick Reference

## 🚀 Quick Start

```bash
# Set up environment variables
export DEMO_PRIVATE_KEY="your_mainnet_wallet_private_key"
export INFURA_API_KEY="your_infura_key"
export OPENAI_API_KEY="your_openai_key"
export ZEROX_API_KEY="your_0x_key"

# Run the demo
cd apps/api/demo
./start-demo.sh
```

## 📋 Essential Commands

### Basic Operations
```bash
help                    # Show all commands
demo scenarios          # Show example scenarios
show wallet info        # Display wallet details
show contacts           # List available contacts
exit                    # Quit demo
```

### Transfer Commands
```bash
transfer 0.001 ETH to Bob on Ethereum
transfer 1 USDC to 0x1234...5678 on Optimism
transfer 0.002 ETH to Charlie on Arbitrum
```

### SWAP DEX API (5-Step Process)
```bash
swap 1 USDC to ETH on Ethereum
swap 100 USDC to WETH on Optimism
swap 10 DAI to LINK on Ethereum
```

### Gasless DEX API (4-Step Process)
```bash
gasless swap 2 USDC to ETH on Ethereum
gasless swap 50 USDC to WETH on Optimism
```

### Quote Commands
```bash
get quote for 10 USDC to ETH on Ethereum
get balance on Ethereum
```

## 🎬 Demo Scenarios

### 1. Basic Transfer
```bash
transfer 0.001 ETH to Bob on Ethereum
```
**Demonstrates**: Intent recognition, parameter extraction, risk assessment, transaction execution

### 2. SWAP DEX API (5-Step)
```bash
swap 1 USDC to ETH on Ethereum
```
**Demonstrates**: 
- Step 1: Get indicative price
- Step 2: Set token allowance (Permit2)
- Step 3: Fetch firm quote
- Step 4: Sign Permit2 EIP-712
- Step 5: Execute transaction

### 3. Gasless DEX API (4-Step)
```bash
gasless swap 2 USDC to ETH on Ethereum
```
**Demonstrates**:
- Step 1: Get indicative price
- Step 2: Get firm quote with EIP-712 data
- Step 3: Submit transaction with signatures
- Step 4: Check trade status

### 4. Cross-Network Transfer
```bash
transfer 0.002 ETH to Charlie on Optimism
```
**Demonstrates**: Network switching, cross-chain transaction execution

### 5. Large Amount Swap
```bash
swap 10 USDC to WETH on Ethereum
```
**Demonstrates**: High-value swap with route optimization and risk assessment

### 6. Quote Only
```bash
get quote for 5 USDC to ETH on Ethereum
```
**Demonstrates**: Price quote without execution, gas estimation

## 🔌 API Features

### SWAP DEX API
- **5-Step Process**: Complete swap execution with Permit2
- **Balance Validation**: Real-time on-chain balance checking
- **Route Optimization**: Automatic route selection via 0x
- **Gas Estimation**: Accurate gas cost calculation
- **Price Impact**: Slippage protection and analysis

### Gasless DEX API
- **4-Step Process**: Meta-transaction execution
- **No Gas Fees**: User doesn't pay gas (relayer pays)
- **EIP-712 Signing**: Secure transaction signing
- **Status Tracking**: Real-time trade status monitoring

### Traditional Transfer API
- **Multi-Network**: Support for Ethereum, Optimism, Arbitrum
- **Contact Resolution**: Name-to-address mapping
- **Risk Assessment**: Multi-factor security analysis
- **Transaction Execution**: Real blockchain transactions

## 🛡️ Safety Features

### Balance Validation
- Real-time on-chain balance checking
- Prevents insufficient balance transactions
- Clear error messages with available vs required amounts

### Risk Assessment
- Address validation and ENS resolution
- Contract vs EOA detection
- Large amount warnings
- Multi-factor security analysis

### User Confirmation
- 5-second safety delay for transactions
- Explicit user approval required
- Clear transaction previews
- Detailed error messages

## 🎨 Output Format

### Color Coding
- 🔵 **Blue**: Information and status
- 🟢 **Green**: Success messages
- 🟡 **Yellow**: Warnings and confirmations
- 🔴 **Red**: Errors and blocking issues
- 🟣 **Purple**: Pipeline steps
- ⚪ **White**: Results and data
- 🌟 **Cyan**: Highlights and important info
- 🔌 **Green**: API operations

### Pipeline Display
```
🎯 Processing: "swap 1 USDC to ETH on Sepolia"
🔧 Step 1: Intent Recognition
✅ Intent: swap (confidence: 0.98)
📊 Description: Swap 1 USDC to ETH on Sepolia network

🔧 Step 2: Parameter Extraction
✅ Parameters extracted successfully
📊 { "amount": "1", "fromToken": "USDC", "toToken": "ETH", "network": "Sepolia" }

🔧 Step 3: Risk Assessment
✅ No risks detected

🔧 Step 4: SWAP DEX API (5-Step Process)
🔌 Using 0x SWAP DEX API with Permit2
✅ SWAP quote retrieved successfully!
📊 Output: 0.0005 ETH
📊 Gas: 150000
📊 Price Impact: 0.12%
```

## 🔧 Technical Details

### Required API Keys
- **Infura**: Blockchain RPC access
- **OpenAI**: AI-powered intent recognition
- **0x Protocol**: DEX aggregation and liquidity
- **Private Key**: Testnet wallet for transactions

### Supported Networks
- **Ethereum**: Mainnet (Chain ID: 1)
- **Optimism**: Layer 2 mainnet (Chain ID: 10)
- **Arbitrum**: Alternative L2 mainnet (Chain ID: 42161)

### Supported Tokens
- **ETH**: Native token on all networks
- **USDC**: Stablecoin with 6 decimals
- **WETH**: Wrapped ETH
- **DAI**: Stablecoin with 18 decimals
- **LINK**: Chainlink token
- **UNI**: Uniswap token

## 🚨 Important Notes

### Mainnet Usage
- Use only wallets with funds you can afford to lose
- Start with small amounts first
- Real funds will be spent on gas fees and transactions

### API Limitations
- SWAP DEX API requires Permit2 approval
- Gasless DEX API has relayer limitations
- Quote availability depends on liquidity

### Demo Features
- Real blockchain transactions on mainnet
- Live balance and gas price checking
- Actual transaction signing and execution
- Block explorer links for verification

---

**HAi Wallet Live Demo** - Experience the future of AI-powered blockchain transactions! 🚀 