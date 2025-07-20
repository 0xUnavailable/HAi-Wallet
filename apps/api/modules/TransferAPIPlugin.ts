import { IPlugin } from '../../../packages/core/plugin/IPlugin';
import { getTokenInfo } from './tokenRegistry';
import { walletManager } from '../utils/walletManager';
import { ethers } from 'ethers';
import { getEvmERC20Balance } from '../utils/getEvmERC20Balance';
import { getNetworkChainConfig } from './tokenRegistry';

// ERC20 ABI for transfer function
const erc20Abi = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)'
] as const;

// Helper function to convert amount to smallest unit
function toSmallestUnit(amount: string, tokenSymbol: string, network: string): string {
  const tokenInfo = getTokenInfo(tokenSymbol, network);
  const decimals = tokenInfo?.decimals || 18;
  return ethers.parseUnits(amount, decimals).toString();
}

// Helper to normalize network parameter
function normalizeNetwork(network: any): string {
  if (typeof network === 'string') return network;
  if (network && typeof network.value === 'string') return network.value;
  return String(network);
}

// Helper function to check balance
async function checkBalance(
  walletAddress: string,
  tokenSymbol: string,
  amount: string,
  network: string
): Promise<{ hasSufficientBalance: boolean; currentBalance: string; requiredAmount: string; error?: string }> {
  let currentBalance: string = '0';
  try {
    const tokenInfo = getTokenInfo(tokenSymbol, network);
    const requiredAmount = toSmallestUnit(amount, tokenSymbol, network);
    
    if (!tokenInfo) {
      return {
        hasSufficientBalance: false,
        currentBalance: '0',
        requiredAmount,
        error: `Token ${tokenSymbol} not found on ${network}`
      };
    }

    if (tokenInfo.address) {
      // ERC20 token
      const networkConfig = getNetworkChainConfig(network);
      if (!networkConfig) throw new Error(`Unsupported network: ${network}`);
      currentBalance = await getEvmERC20Balance(walletAddress, tokenInfo.address, networkConfig);
    } else {
      // Native token (ETH)
      await walletManager.switchNetwork(network);
      const balance = await walletManager.getBalance();
      currentBalance = balance.toString();
    }

    const hasSufficientBalance = BigInt(currentBalance) >= BigInt(requiredAmount);
    
    return {
      hasSufficientBalance,
      currentBalance,
      requiredAmount
    };
  } catch (error: any) {
    return {
      hasSufficientBalance: false,
      currentBalance: '0',
      requiredAmount: '0',
      error: error.message
    };
  }
}

// Execute transfer transaction
async function executeTransfer(
  params: {
    fromAddress: string;
    toAddress: string;
    tokenSymbol: string;
    amount: string;
    network: string;
    privateKey: string;
  }
): Promise<any> {
  const { fromAddress, toAddress, tokenSymbol, amount, network, privateKey } = params;
  
  try {
    // Check balance first
    const balanceCheck = await checkBalance(fromAddress, tokenSymbol, amount, network);
    
    if (!balanceCheck.hasSufficientBalance) {
      return {
        status: 'insufficient_balance',
        error: balanceCheck.error || 'Insufficient balance',
        currentBalance: balanceCheck.currentBalance,
        requiredAmount: balanceCheck.requiredAmount
      };
    }

    const tokenInfo = getTokenInfo(tokenSymbol, network);
    if (!tokenInfo) {
      return {
        status: 'error',
        error: `Token ${tokenSymbol} not found on ${network}`
      };
    }

    // Build transaction data
    let txData: any;
    
    if (tokenInfo.address) {
      // ERC20 transfer
      const iface = new ethers.Interface(erc20Abi);
      const data = iface.encodeFunctionData('transfer', [
        toAddress,
        toSmallestUnit(amount, tokenSymbol, network)
      ]);
      
      txData = {
        to: tokenInfo.address,
        data: data,
        gasLimit: '65000'
      };
    } else {
      // Native token transfer (ETH)
      txData = {
        to: toAddress,
        value: toSmallestUnit(amount, tokenSymbol, network),
        gasLimit: '21000'
      };
    }

    // Create transaction preview
    const preview = {
      type: 'transfer' as const,
      from: fromAddress,
      to: toAddress,
      token: tokenSymbol,
      amount: amount,
      network: network,
      estimatedGas: txData.gasLimit || '21000',
      estimatedCost: '0', // Will be calculated by walletManager
      description: `Transfer ${amount} ${tokenSymbol} to ${toAddress}`,
      risks: []
    };

    // Execute transaction
    const receipt = await walletManager.executeTransaction(txData, preview);

    return {
      status: 'success',
      transactionHash: receipt.hash,
      receipt,
      details: {
        from: fromAddress,
        to: toAddress,
        token: tokenSymbol,
        amount: amount,
        network: network,
        gasUsed: receipt.gasUsed?.toString(),
        gasPrice: receipt.gasPrice?.toString()
      }
    };

  } catch (error: any) {
    return {
      status: 'error',
      error: error.message
    };
  }
}

// Process transfer request with AI pipeline parameters
async function processTransferRequest(params: any, context: any): Promise<any> {
  try {
    // Extract parameters from AI pipeline
    const amount = params.amount;
    const tokenSymbol = params.token || params.fromToken;
    const recipient = params.recipient || params.toAddress;
    const network = normalizeNetwork(params.network || 'Ethereum');
    
    if (!amount || !tokenSymbol || !recipient) {
      return {
        status: 'error',
        error: 'Missing required parameters: amount, token, or recipient'
      };
    }

    // Resolve recipient address from context or use as-is if it's already an address
    let toAddress = recipient;
    
    // Check if it's a known contact name
    if (context.contacts) {
      const contact = context.contacts.find((c: any) => 
        c.name.toLowerCase() === recipient.toLowerCase() && c.network === network
      );
      if (contact) {
        toAddress = contact.address;
      }
    }
    
    // If it's not a known contact and doesn't look like an address, return error
    if (!toAddress.startsWith('0x') && toAddress.length !== 42) {
      return {
        status: 'error',
        error: `Unknown recipient: ${recipient}. Please use a valid address or known contact name.`
      };
    }

    const fromAddress = context.wallets?.[0]?.address;
    if (!fromAddress) {
      return {
        status: 'error',
        error: 'No wallet address found in context'
      };
    }

    const privateKey = process.env.DEMO_PRIVATE_KEY;
    if (!privateKey) {
      return {
        status: 'error',
        error: 'DEMO_PRIVATE_KEY environment variable not set'
      };
    }

    // Execute the transfer
    return await executeTransfer({
      fromAddress,
      toAddress,
      tokenSymbol: tokenSymbol.toUpperCase(),
      amount,
      network,
      privateKey
    });

  } catch (error: any) {
    return {
      status: 'error',
      error: error.message
    };
  }
}

export const TransferAPIPlugin = {
  id: 'transfer-api',
  name: 'Transfer API Plugin',
  version: '1.0.0',
  type: 'transfer',
  
  async init() {
    console.log('TransferAPIPlugin initialized');
  },
  
  async dispose() {
    console.log('TransferAPIPlugin disposed');
  },
  
  async execute(params: any, context: any): Promise<any> {
    return await processTransferRequest(params, context);
  }
}; 