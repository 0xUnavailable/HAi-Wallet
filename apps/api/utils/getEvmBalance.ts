import { createPublicClient, http, formatEther } from 'viem';

export interface EvmNetworkConfig {
  id: number;
  name: string;
  network: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrl: string;
  blockExplorer?: string;
}

export async function getEvmBalance(address: string, networkConfig: EvmNetworkConfig): Promise<string> {
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
  const balance = await client.getBalance({ address: checksummed });
  return formatEther(balance);
} 