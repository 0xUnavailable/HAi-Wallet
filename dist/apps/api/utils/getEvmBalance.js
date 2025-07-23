"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEvmBalance = getEvmBalance;
const viem_1 = require("viem");
async function getEvmBalance(address, networkConfig) {
    const client = (0, viem_1.createPublicClient)({
        chain: {
            id: networkConfig.id,
            name: networkConfig.name,
            network: networkConfig.network,
            nativeCurrency: networkConfig.nativeCurrency,
            rpcUrls: { default: { http: [networkConfig.rpcUrl] } },
            blockExplorers: {
                default: {
                    name: networkConfig.blockExplorer || 'Explorer',
                    url: networkConfig.blockExplorer || 'https://example.com'
                }
            },
            contracts: {}
        },
        transport: (0, viem_1.http)(networkConfig.rpcUrl),
    });
    const checksummed = address.toLowerCase();
    const balance = await client.getBalance({ address: checksummed });
    return (0, viem_1.formatEther)(balance);
}
