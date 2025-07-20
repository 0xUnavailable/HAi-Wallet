import { ethers } from 'ethers';
import { getTokenInfo } from '../modules/tokenRegistry';

export interface TransactionPreview {
  type: 'transfer' | 'swap' | 'bridge';
  from: string;
  to: string;
  amount: string;
  token: string;
  network: string;
  estimatedGas: string;
  estimatedCost: string;
  description: string;
  risks: string[];
}

export interface TransactionData {
  to: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
}

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export class WalletManager {
  private wallet: ethers.Wallet;
  private providers: Map<string, ethers.JsonRpcProvider>;
  private currentNetwork: string;
  private dailySpendingLimit: bigint;
  private dailySpent: bigint = BigInt(0);
  private lastResetDate: string;

  // Mainnet configurations
  private readonly networks: Record<string, NetworkConfig> = {
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
    },
    'Sepolia': {
      name: 'Sepolia',
      chainId: 11155111,
      rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
      blockExplorer: 'https://sepolia.etherscan.io',
      nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 }
    },
    'Arbitrum Sepolia': {
      name: 'Arbitrum Sepolia',
      chainId: 421614,
      rpcUrl: process.env.ARBITRUM_SEPOLIA_RPC_URL || 'https://arbitrum-sepolia.publicnode.com',
      blockExplorer: 'https://sepolia.arbiscan.io',
      nativeCurrency: { name: 'Arbitrum Sepolia Ether', symbol: 'ETH', decimals: 18 }
    },
    'Base Sepolia': {
      name: 'Base Sepolia',
      chainId: 84532,
      rpcUrl: process.env.BASE_SEPOLIA_RPC_URL || 'https://base-sepolia.public.blastapi.io',
      blockExplorer: 'https://base-sepolia.blockscout.com',
      nativeCurrency: { name: 'Base Sepolia Ether', symbol: 'ETH', decimals: 18 }
    },
    'Base': {
      name: 'Base',
      chainId: 8453,
      rpcUrl: process.env.BASE_MAINNET_RPC_URL || 'https://mainnet.base.org',
      blockExplorer: 'https://basescan.org',
      nativeCurrency: { name: 'Base Ether', symbol: 'ETH', decimals: 18 }
    }
  };

  constructor() {
    const privateKey = process.env.DEMO_PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error('DEMO_PRIVATE_KEY environment variable is required');
    }

    // Initialize providers for all networks
    this.providers = new Map();
    for (const [networkName, config] of Object.entries(this.networks)) {
      this.providers.set(networkName, new ethers.JsonRpcProvider(config.rpcUrl));
    }

    // Create wallet with default network (Ethereum)
    this.currentNetwork = 'Ethereum';
    this.wallet = new ethers.Wallet(privateKey, this.providers.get(this.currentNetwork)!);
    
    // Mainnet daily limit (lower for safety)
    this.dailySpendingLimit = BigInt(process.env.DAILY_SPENDING_LIMIT || '1000000000000000000'); // 1 ETH default for mainnet
    this.lastResetDate = new Date().toDateString();
  }

  getCurrentNetwork(): string {
    return this.currentNetwork;
  }

  getSupportedNetworks(): string[] {
    return Object.keys(this.networks);
  }

  async switchNetwork(networkName: string): Promise<void> {
    if (!this.networks[networkName]) {
      throw new Error(`Unsupported network: ${networkName}`);
    }

    this.currentNetwork = networkName;
    this.wallet = this.wallet.connect(this.providers.get(networkName)!);
  }

  getWalletAddress(): string {
    return this.wallet.address;
  }

  async getBalance(): Promise<string> {
    const balance = await this.providers.get(this.currentNetwork)!.getBalance(this.wallet.address);
    return balance.toString();
  }

  async getTokenBalance(tokenAddress: string): Promise<string> {
    const erc20Abi = ["function balanceOf(address) view returns (uint256)"];
    const contract = new ethers.Contract(tokenAddress, erc20Abi, this.providers.get(this.currentNetwork)!);
    const balance = await contract.balanceOf(this.wallet.address);
    return balance.toString();
  }

  async buildTransactionPreview(
    intent: any,
    params: any,
    routes: any[]
  ): Promise<TransactionPreview> {
    const network = params.network || this.currentNetwork;
    const amount = params.amount;
    const token = params.fromToken || params.token;
    
    // Get current gas price for the network
    const gasPrice = await this.providers.get(network)!.getFeeData();
    const estimatedGas = '21000'; // Default for transfers, will be updated for swaps
    
    const preview: TransactionPreview = {
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

  async checkSpendingLimit(amount: bigint): Promise<boolean> {
    // Reset daily limit if it's a new day
    const today = new Date().toDateString();
    if (today !== this.lastResetDate) {
      this.dailySpent = BigInt(0);
      this.lastResetDate = today;
    }

    return this.dailySpent + amount <= this.dailySpendingLimit;
  }

  async executeTransaction(
    txData: TransactionData,
    preview: TransactionPreview
  ): Promise<ethers.TransactionReceipt> {
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
    const gasPrice = await this.providers.get(this.currentNetwork)!.getFeeData();
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

  async simulateTransaction(txData: TransactionData): Promise<any> {
    // Simulate transaction without sending
    const result = await this.providers.get(this.currentNetwork)!.call({
      from: this.wallet.address,
      ...txData
    });
    return result;
  }

  getNetworkConfig(networkName: string): NetworkConfig | undefined {
    return this.networks[networkName];
  }
}

// Singleton instance
export const walletManager = new WalletManager(); 