"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEvmERC20Balance = getEvmERC20Balance;
const viem_1 = require("viem");
const erc20Abi = [
    'function balanceOf(address) view returns (uint256)',
    'function decimals() view returns (uint8)'
];
async function getEvmERC20Balance(address, tokenAddress, networkConfig) {
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
    const token = tokenAddress.toLowerCase();
    const [balance, decimals] = await Promise.all([
        client.readContract({ address: token, abi: erc20Abi, functionName: 'balanceOf', args: [checksummed] }),
        client.readContract({ address: token, abi: erc20Abi, functionName: 'decimals' })
    ]);
    return (0, viem_1.formatUnits)(balance, decimals);
}
