import React from "react";
import Link from "next/link";
import { AddressBadge } from "@/components/common/AddressBadge";
import { CONTRACT_ADDRESS } from "@/lib/contract";
import { ShieldCheck, ExternalLink, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-surface-border bg-[#0B0D10] text-muted-foreground text-xs py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-foreground">LUMEN</span>
            <span>— Decentralized Digital Asset Marketplace</span>
          </div>
          <span className="hidden sm:inline text-surface-border">|</span>
          <span className="flex items-center gap-1 text-teal">
            <ShieldCheck className="w-3.5 h-3.5" />
            Ethereum Sepolia Verified
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">Contract:</span>
            <AddressBadge address={CONTRACT_ADDRESS} chars={4} />
          </div>

          <Link
            href="/api/docs"
            className="hover:text-accent transition-colors flex items-center gap-1"
          >
            Swagger API
          </Link>

          <a
            href="https://sepolia.etherscan.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors flex items-center gap-1"
          >
            Sepolia Explorer <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
