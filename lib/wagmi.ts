import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";
import { http, fallback } from "viem";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64";

const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

const transportsList = [];
if (alchemyKey) {
  transportsList.push(http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`));
}
transportsList.push(http("https://ethereum-sepolia-rpc.publicnode.com"));
transportsList.push(http("https://sepolia.drpc.org"));
transportsList.push(http("https://1rpc.io/sepolia"));

export const wagmiConfig = getDefaultConfig({
  appName: "Lumen Marketplace",
  projectId: projectId,
  chains: [sepolia],
  transports: {
    [sepolia.id]: fallback(transportsList),
  },
  ssr: true,
});
