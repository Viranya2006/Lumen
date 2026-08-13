"use client";

import React, { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { shortenAddress } from "@/lib/utils";

interface AddressBadgeProps {
  address: string;
  chars?: number;
  showExplorer?: boolean;
  showCopy?: boolean;
  className?: string;
}

export function AddressBadge({
  address,
  chars = 4,
  showExplorer = true,
  showCopy = true,
  className = "",
}: AddressBadgeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const explorerUrl = `https://sepolia.etherscan.io/address/${address}`;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-subtle border border-surface-border text-xs font-mono text-muted-foreground hover:text-foreground transition-colors ${className}`}
    >
      <span>{shortenAddress(address, chars)}</span>

      {showCopy && (
        <button
          onClick={handleCopy}
          type="button"
          title="Copy full address"
          className="p-0.5 hover:text-accent transition-colors cursor-pointer"
        >
          {copied ? (
            <Check className="w-3 h-3 text-teal" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
      )}

      {showExplorer && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="View on Sepolia Etherscan"
          className="p-0.5 hover:text-accent transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
