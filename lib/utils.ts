import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatEther, parseEther } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats messy raw Web3/Viem error objects into clean, human-readable UI messages
 */
export function formatWeb3ErrorMessage(error: any): string {
  if (!error) return "An unexpected error occurred.";

  const msg =
    typeof error === "string"
      ? error
      : error?.shortMessage || error?.details || error?.message || "";

  // User rejected or denied signature in MetaMask
  if (
    msg.includes("User rejected") ||
    msg.includes("User denied") ||
    msg.includes("user rejected") ||
    msg.includes("user denied") ||
    msg.includes("rejected the request") ||
    msg.includes("ACTION_REJECTED")
  ) {
    return "Transaction cancelled: You denied the signature request in MetaMask.";
  }

  // Insufficient funds
  if (msg.includes("insufficient funds") || msg.includes("exceeds balance")) {
    return "Insufficient ETH balance in your wallet to cover gas and transaction amount.";
  }

  // Execution reverted by smart contract
  if (msg.includes("execution reverted") || msg.includes("revert")) {
    const match =
      msg.match(/execution reverted: ([^"\n]+)/i) ||
      msg.match(/revert ([^"\n]+)/i);
    if (match && match[1]) {
      return `Contract Reverted: ${match[1].trim()}`;
    }
    return "Transaction was reverted by the smart contract rules.";
  }

  // General fallback - clean out Viem URLs, hex arguments & technical traces
  let cleanMsg = msg
    .split("Request Arguments:")[0]
    .split("Contract Call:")[0]
    .split("Version:")[0]
    .split("Docs:")[0]
    .trim();

  if (cleanMsg.endsWith(".")) cleanMsg = cleanMsg.slice(0, -1);

  return cleanMsg || "Transaction request failed. Please try again.";
}

/**
 * Shortens an Ethereum address to 0x1234...abcd format
 */
export function shortenAddress(address?: string, chars = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Formats a BigInt or string wei amount into human-readable ETH
 */
export function formatEth(wei: bigint | string | number | undefined, decimals = 4): string {
  if (wei === undefined || wei === null) return "0";
  try {
    const weiBigInt = typeof wei === "bigint" ? wei : BigInt(wei.toString());
    const ethStr = formatEther(weiBigInt);
    const num = parseFloat(ethStr);
    if (num === 0) return "0";
    if (num < 0.0001) return "<0.0001";
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  } catch {
    return "0";
  }
}

/**
 * Parses user ETH string to Wei bigint
 */
export function parseEthToWei(eth: string): bigint {
  try {
    if (!eth || isNaN(Number(eth))) return 0n;
    return parseEther(eth);
  } catch {
    return 0n;
  }
}

/**
 * Formats a unix timestamp (seconds or milliseconds) into date string
 */
export function formatDate(timestamp: number | bigint | string): string {
  if (!timestamp) return "-";
  const num = typeof timestamp === "bigint" ? Number(timestamp) : Number(timestamp);
  const ms = num < 10000000000 ? num * 1000 : num;
  const d = new Date(ms);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formats a unix timestamp into relative time (e.g. 5m ago, 2h ago)
 */
export function formatRelativeTime(timestamp: number | bigint | string): string {
  if (!timestamp) return "-";
  const num = typeof timestamp === "bigint" ? Number(timestamp) : Number(timestamp);
  const ms = num < 10000000000 ? num * 1000 : num;
  const now = Date.now();
  const diffSec = Math.floor((now - ms) / 1000);

  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d ago`;
  return formatDate(timestamp);
}

/**
 * Returns categorical badge colors and gradients adhering to DESIGN.md
 */
export function getCategoryBadgeStyle(category: string): { bg: string; text: string; border: string } {
  switch (category?.toLowerCase()) {
    case "art":
      return { bg: "bg-accent/10", text: "text-accent", border: "border-accent/30" };
    case "collectible":
      return { bg: "bg-teal/10", text: "text-teal", border: "border-teal/30" };
    case "domain":
      return { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/30" };
    case "music":
      return { bg: "bg-fuchsia-500/10", text: "text-fuchsia-400", border: "border-fuchsia-500/30" };
    case "photography":
      return { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/30" };
    case "virtual world":
      return { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" };
    default:
      return { bg: "bg-muted", text: "text-foreground", border: "border-surface-border" };
  }
}
