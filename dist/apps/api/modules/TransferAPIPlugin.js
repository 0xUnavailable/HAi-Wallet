"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferAPIPlugin = void 0;
const tokenRegistry_1 = require("./tokenRegistry");
const walletManager_1 = require("../utils/walletManager");
const ethers_1 = require("ethers");
const onchainBalance_1 = require("../utils/onchainBalance");
// ERC20 ABI for transfer function
const erc20Abi = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function balanceOf(address) view returns (uint256)',
    'function decimals() view returns (uint8)'
];
// Helper function to convert amount to smallest unit
function toSmallestUnit(amount, tokenSymbol, network) {
    const tokenInfo = (0, tokenRegistry_1.getTokenInfo)(tokenSymbol, network);
    const decimals = tokenInfo?.decimals || 18;
    return ethers_1.ethers.parseUnits(amount, decimals).toString();
}
// Helper function to check balance
async function checkBalance(walletAddress, tokenSymbol, amount, network) {
    try {
        const tokenInfo = (0, tokenRegistry_1.getTokenInfo)(tokenSymbol, network);
        const requiredAmount = toSmallestUnit(amount, tokenSymbol, network);
        if (!tokenInfo) {
            return {
                hasSufficientBalance: false,
                currentBalance: '0',
                requiredAmount,
                error: `Token ${tokenSymbol} not found on ${network}`
            };
        }
        let currentBalance;
        if (tokenInfo.address) {
            // ERC20 token
            const infuraKey = process.env.INFURA_API_KEY || '';
            currentBalance = await (0, onchainBalance_1.getERC20Balance)({
                walletAddress,
                tokenAddress: tokenInfo.address,
                network,
                infuraKey
            });
        }
        else {
            // Native token (ETH)
            await walletManager_1.walletManager.switchNetwork(network);
            const balance = await walletManager_1.walletManager.getBalance();
            currentBalance = balance.toString();
        }
        const hasSufficientBalance = BigInt(currentBalance) >= BigInt(requiredAmount);
        return {
            hasSufficientBalance,
            currentBalance,
            requiredAmount
        };
    }
    catch (error) {
        return {
            hasSufficientBalance: false,
            currentBalance: '0',
            requiredAmount: '0',
            error: error.message
        };
    }
}
// Execute transfer transaction
async function executeTransfer(params) {
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
        const tokenInfo = (0, tokenRegistry_1.getTokenInfo)(tokenSymbol, network);
        if (!tokenInfo) {
            return {
                status: 'error',
                error: `Token ${tokenSymbol} not found on ${network}`
            };
        }
        // Build transaction data
        let txData;
        if (tokenInfo.address) {
            // ERC20 transfer
            const iface = new ethers_1.ethers.Interface(erc20Abi);
            const data = iface.encodeFunctionData('transfer', [
                toAddress,
                toSmallestUnit(amount, tokenSymbol, network)
            ]);
            txData = {
                to: tokenInfo.address,
                data: data,
                gasLimit: '65000'
            };
        }
        else {
            // Native token transfer (ETH)
            txData = {
                to: toAddress,
                value: toSmallestUnit(amount, tokenSymbol, network),
                gasLimit: '21000'
            };
        }
        // Create transaction preview
        const preview = {
            type: 'transfer',
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
        const receipt = await walletManager_1.walletManager.executeTransaction(txData, preview);
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
    }
    catch (error) {
        return {
            status: 'error',
            error: error.message
        };
    }
}
// Process transfer request with AI pipeline parameters
async function processTransferRequest(params, context) {
    try {
        // Extract parameters from AI pipeline
        const amount = params.amount;
        const tokenSymbol = params.token || params.fromToken;
        const recipient = params.recipient || params.toAddress;
        const network = params.network || 'Ethereum';
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
            const contact = context.contacts.find((c) => c.name.toLowerCase() === recipient.toLowerCase() && c.network === network);
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
    }
    catch (error) {
        return {
            status: 'error',
            error: error.message
        };
    }
}
exports.TransferAPIPlugin = {
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
    async execute(params, context) {
        return await processTransferRequest(params, context);
    }
};
