"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletManager = exports.WalletManager = void 0;
const ethers_1 = require("ethers");
class WalletManager {
    constructor() {
        this.dailySpent = BigInt(0);
        // Mainnet configurations
        this.networks = {
            'Ethereum': {
                name: 'Ethereum',
                chainId: 1,
                rpcUrl: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
                blockExplorer: 'https://etherscan.io',
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
            },
            'Optimism': {
                name: 'Optimism',
                chainId: 10,
                rpcUrl: `https://optimism-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
                blockExplorer: 'https://optimistic.etherscan.io',
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
            },
            'Arbitrum': {
                name: 'Arbitrum',
                chainId: 42161,
                rpcUrl: `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
                blockExplorer: 'https://arbiscan.io',
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
            }
        };
        const privateKey = process.env.DEMO_PRIVATE_KEY;
        if (!privateKey) {
            throw new Error('DEMO_PRIVATE_KEY environment variable is required');
        }
        // Initialize providers for all networks
        this.providers = new Map();
        for (const [networkName, config] of Object.entries(this.networks)) {
            this.providers.set(networkName, new ethers_1.ethers.JsonRpcProvider(config.rpcUrl));
        }
        // Create wallet with default network (Ethereum)
        this.currentNetwork = 'Ethereum';
        this.wallet = new ethers_1.ethers.Wallet(privateKey, this.providers.get(this.currentNetwork));
        // Mainnet daily limit (lower for safety)
        this.dailySpendingLimit = BigInt(process.env.DAILY_SPENDING_LIMIT || '1000000000000000000'); // 1 ETH default for mainnet
        this.lastResetDate = new Date().toDateString();
    }
    getCurrentNetwork() {
        return this.currentNetwork;
    }
    getSupportedNetworks() {
        return Object.keys(this.networks);
    }
    async switchNetwork(networkName) {
        if (!this.networks[networkName]) {
            throw new Error(`Unsupported network: ${networkName}`);
        }
        this.currentNetwork = networkName;
        this.wallet = this.wallet.connect(this.providers.get(networkName));
    }
    getWalletAddress() {
        return this.wallet.address;
    }
    async getBalance() {
        const balance = await this.providers.get(this.currentNetwork).getBalance(this.wallet.address);
        return balance.toString();
    }
    async getTokenBalance(tokenAddress) {
        const erc20Abi = ["function balanceOf(address) view returns (uint256)"];
        const contract = new ethers_1.ethers.Contract(tokenAddress, erc20Abi, this.providers.get(this.currentNetwork));
        const balance = await contract.balanceOf(this.wallet.address);
        return balance.toString();
    }
    async buildTransactionPreview(intent, params, routes) {
        const network = params.network || this.currentNetwork;
        const amount = params.amount;
        const token = params.fromToken || params.token;
        // Get current gas price for the network
        const gasPrice = await this.providers.get(network).getFeeData();
        const estimatedGas = '21000'; // Default for transfers, will be updated for swaps
        const preview = {
            type: intent.type,
            from: this.wallet.address,
            to: params.recipient || params.toAddress || '',
            amount: amount,
            token: token,
            network: network,
            estimatedGas: estimatedGas,
            estimatedCost: '0', // Will be calculated
            description: intent.description,
            risks: []
        };
        // Add risks based on parameters
        if (params.recipient && params.recipient.endsWith('.eth')) {
            preview.risks.push('ENS address - verify resolved address');
        }
        if (amount && parseFloat(amount) > 10) { // Higher threshold for testnets
            preview.risks.push('Large transaction amount');
        }
        return preview;
    }
    async checkSpendingLimit(amount) {
        // Reset daily limit if it's a new day
        const today = new Date().toDateString();
        if (today !== this.lastResetDate) {
            this.dailySpent = BigInt(0);
            this.lastResetDate = today;
        }
        return this.dailySpent + amount <= this.dailySpendingLimit;
    }
    async executeTransaction(txData, preview) {
        // Switch to the target network if different
        if (preview.network !== this.currentNetwork) {
            await this.switchNetwork(preview.network);
        }
        // Check spending limit
        const value = txData.value ? BigInt(txData.value) : BigInt(0);
        if (!(await this.checkSpendingLimit(value))) {
            throw new Error('Daily spending limit exceeded');
        }
        // Check wallet balance
        const balance = await this.getBalance();
        const gasPrice = await this.providers.get(this.currentNetwork).getFeeData();
        const estimatedGasCost = BigInt(txData.gasLimit || '21000') * (gasPrice.gasPrice || BigInt(0));
        const totalCost = value + estimatedGasCost;
        if (BigInt(balance) < totalCost) {
            throw new Error('Insufficient balance for transaction');
        }
        // Sign and send transaction
        const tx = await this.wallet.sendTransaction(txData);
        const receipt = await tx.wait();
        // Update daily spent amount
        this.dailySpent += value;
        if (!receipt) {
            throw new Error('Transaction receipt is null');
        }
        return receipt;
    }
    async simulateTransaction(txData) {
        // Simulate transaction without sending
        const result = await this.providers.get(this.currentNetwork).call({
            from: this.wallet.address,
            ...txData
        });
        return result;
    }
    getNetworkConfig(networkName) {
        return this.networks[networkName];
    }
}
exports.WalletManager = WalletManager;
// Singleton instance
exports.walletManager = new WalletManager();
