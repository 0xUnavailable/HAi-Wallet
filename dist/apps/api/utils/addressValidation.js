"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidAddress = isValidAddress;
exports.resolveENS = resolveENS;
exports.getAddressType = getAddressType;
const ethers_1 = require("ethers");
const NETWORK_RPC = {
    Ethereum: (infuraKey) => `https://mainnet.infura.io/v3/${infuraKey}`,
    Optimism: (infuraKey) => `https://optimism-mainnet.infura.io/v3/${infuraKey}`,
    Arbitrum: (infuraKey) => `https://arbitrum-mainnet.infura.io/v3/${infuraKey}`,
};
function isValidAddress(address) {
    try {
        return ethers_1.ethers.isAddress(address);
    }
    catch {
        return false;
    }
}
async function resolveENS({ ensName, network = 'Ethereum', infuraKey }) {
    const rpcUrl = NETWORK_RPC[network]?.(infuraKey);
    if (!rpcUrl)
        throw new Error(`Unsupported network: ${network}`);
    const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
    try {
        const address = await provider.resolveName(ensName);
        return address || null;
    }
    catch {
        return null;
    }
}
async function getAddressType({ address, network = 'Ethereum', infuraKey }) {
    if (!isValidAddress(address))
        return 'INVALID';
    const rpcUrl = NETWORK_RPC[network]?.(infuraKey);
    if (!rpcUrl)
        throw new Error(`Unsupported network: ${network}`);
    const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
    try {
        const code = await provider.getCode(address);
        if (code && code !== '0x')
            return 'CONTRACT';
        return 'EOA';
    }
    catch {
        return 'INVALID';
    }
}
