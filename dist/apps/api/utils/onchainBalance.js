"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getERC20Balance = getERC20Balance;
const ethers_1 = require("ethers");
async function getERC20Balance({ walletAddress, tokenAddress, network = 'Ethereum', infuraKey }) {
    let rpcUrl = '';
    if (network === 'Ethereum') {
        rpcUrl = `https://mainnet.infura.io/v3/${infuraKey}`;
    }
    // TODO: Add support for Optimism, Arbitrum, etc.
    if (!rpcUrl)
        throw new Error(`Unsupported network: ${network}`);
    const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
    const erc20Abi = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"];
    const contract = new ethers_1.ethers.Contract(tokenAddress, erc20Abi, provider);
    const balance = await contract.balanceOf(walletAddress);
    return balance.toString();
}
