import { createPublicClient, http, formatUnits } from 'viem';

export interface EvmNetworkConfig {
  id: number;
  name: string;
  network: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrl: string;
  blockExplorer?: string;
}

const erc20Abi = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

export async function getEvmERC20Balance(address: string, tokenAddress: string, networkConfig: EvmNetworkConfig): Promise<string> {
  const client = createPublicClient({
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
    transport: http(networkConfig.rpcUrl),
  });
  const checksummed = address.toLowerCase() as `0x${string}`;
  const token = tokenAddress.toLowerCase() as `0x${string}`;
  const [balance, decimals] = await Promise.all([
    client.readContract({ address: token, abi: erc20Abi, functionName: 'balanceOf', args: [checksummed] }) as Promise<bigint>,
    client.readContract({ address: token, abi: erc20Abi, functionName: 'decimals' }) as Promise<number>
  ]);
  return formatUnits(balance, decimals);
} 