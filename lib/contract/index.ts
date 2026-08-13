import { createPublicClient, http, fallback, type Address } from "viem";
import { sepolia } from "viem/chains";
import { LumenMarketplaceABI } from "./abi";

export interface OwnershipRecord {
  owner: string;
  timestamp: number;
  price: bigint;
}

export interface Asset {
  assetId: number;
  name: string;
  description: string;
  category: string;
  creator: string;
  currentOwner: string;
  price: bigint;
  forSale: boolean;
  createdAt: number;
  metadataURI: string;
}

export interface ActivityEvent {
  type: "AssetRegistered" | "AssetListed" | "AssetUnlisted" | "AssetSold" | "AssetTransferred";
  assetId: number;
  assetName?: string;
  from?: string;
  to?: string;
  priceEth?: string;
  timestamp: number;
  txHash?: string;
}

export interface DashboardStats {
  totalAssets: number;
  totalTransactions: number;
  totalUniqueHolders: number;
  totalVolumeEth: string;
  topHolders: Array<{ address: string; assetCount: number }>;
  recentActivity: ActivityEvent[];
}

export const CONTRACT_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address) ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const SEPOLIA_CHAIN_ID = 11155111;

export function getPublicTransport() {
  const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  const transports = [];

  if (alchemyKey) {
    transports.push(
      http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`, {
        timeout: 4000,
        retryCount: 2,
      })
    );
  }

  transports.push(
    http("https://ethereum-sepolia-rpc.publicnode.com", {
      timeout: 3500,
      retryCount: 1,
    })
  );
  transports.push(
    http("https://sepolia.drpc.org", {
      timeout: 3500,
      retryCount: 1,
    })
  );
  transports.push(
    http("https://1rpc.io/sepolia", {
      timeout: 3500,
      retryCount: 1,
    })
  );

  return fallback(transports, { rank: false });
}

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: getPublicTransport(),
  batch: {
    multicall: true,
  },
});

export { LumenMarketplaceABI };
