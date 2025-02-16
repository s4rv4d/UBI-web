import { http } from "wagmi";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia } from "wagmi/chains";
// import { coinbaseWallet } from "wagmi/connectors";

export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID;
if (!projectId) throw new Error("Project ID is not defined");

export const config = getDefaultConfig({
  appName: "UBI",
  projectId: projectId,
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
  ssr: true,
});

export const fetchConfig = getDefaultConfig({
  appName: "UBI",
  projectId: projectId,
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(
      `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
    ),
  },
  ssr: true,
});
