"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AddressBadge } from "@/components/common/AddressBadge";
import { AssetPlaceholder } from "./AssetPlaceholder";
import { formatEth, getCategoryBadgeStyle } from "@/lib/utils";
import type { Asset } from "@/lib/contract";
import { Tag, Sparkles } from "lucide-react";

interface AssetCardProps {
  asset: Asset;
  showQuickActions?: boolean;
  onList?: (asset: Asset) => void;
  onTransfer?: (asset: Asset) => void;
  onUnlist?: (asset: Asset) => void;
}

export function AssetCard({
  asset,
  showQuickActions = false,
  onList,
  onTransfer,
  onUnlist,
}: AssetCardProps) {
  const catStyle = getCategoryBadgeStyle(asset.category);

  return (
    <div className="group relative flex flex-col rounded-lg border border-surface-border bg-surface hover:border-accent/40 transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-black/40">
      <Link href={`/asset/${asset.assetId}`} className="block relative aspect-square w-full bg-surface-subtle overflow-hidden">
        {asset.metadataURI && (asset.metadataURI.startsWith("http://") || asset.metadataURI.startsWith("https://") || asset.metadataURI.startsWith("data:")) ? (
          <img
            src={asset.metadataURI}
            alt={asset.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // If image fails, replace with placeholder
              (e.currentTarget as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <AssetPlaceholder category={asset.category} name={asset.name} assetId={asset.assetId} />
        )}

        {/* Status badges overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <Badge className={`${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
            {asset.category || "Asset"}
          </Badge>
          {asset.forSale ? (
            <Badge variant="default" className="flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              For Sale
            </Badge>
          ) : (
            <Badge variant="muted">Not Listed</Badge>
          )}
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link href={`/asset/${asset.assetId}`} className="group-hover:text-accent transition-colors">
            <h3 className="font-heading font-semibold text-base text-foreground line-clamp-1">
              {asset.name}
            </h3>
          </Link>
          <span className="text-xs font-mono text-muted-foreground shrink-0">
            #{asset.assetId}
          </span>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
          {asset.description || "No description provided."}
        </p>

        <div className="pt-3 border-t border-surface-border flex items-end justify-between gap-2">
          <div>
            <span className="text-[11px] text-muted-foreground block mb-0.5">Owner</span>
            <AddressBadge address={asset.currentOwner} chars={3} showExplorer={false} />
          </div>

          <div className="text-right">
            <span className="text-[11px] text-muted-foreground block mb-0.5">Price</span>
            <span className="text-sm font-semibold font-mono text-accent">
              {asset.forSale ? `${formatEth(asset.price)} ETH` : "—"}
            </span>
          </div>
        </div>

        {showQuickActions && (
          <div className="mt-3 pt-3 border-t border-surface-border grid grid-cols-2 gap-2">
            {asset.forSale ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onUnlist?.(asset);
                }}
                className="w-full py-1.5 px-2 text-xs font-medium rounded bg-surface-subtle hover:bg-surface-active border border-surface-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Unlist
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onList?.(asset);
                }}
                className="w-full py-1.5 px-2 text-xs font-medium rounded bg-accent/10 hover:bg-accent/20 border border-accent/30 text-accent transition-colors cursor-pointer"
              >
                List for Sale
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTransfer?.(asset);
              }}
              className="w-full py-1.5 px-2 text-xs font-medium rounded bg-surface-subtle hover:bg-surface-active border border-surface-border text-foreground transition-colors cursor-pointer"
            >
              Transfer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
