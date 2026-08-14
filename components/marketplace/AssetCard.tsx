"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AddressBadge } from "@/components/common/AddressBadge";
import { AssetPlaceholder } from "./AssetPlaceholder";
import { formatEth, getCategoryBadgeStyle } from "@/lib/utils";
import { parseMetadataURI } from "@/lib/music";
import type { Asset } from "@/lib/contract";
import { Tag, Sparkles, Music, Play, Pause, Disc3 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const { imageUrl, audioUrl } = parseMetadataURI(asset.metadataURI);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const hasValidImage = Boolean(
    imageUrl &&
      (imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://") ||
        imageUrl.startsWith("data:"))
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, []);

  const toggleCardAudio = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Stop all other playing audio on the page
      document.querySelectorAll("audio").forEach((el) => {
        if (el !== audioRef.current) {
          (el as HTMLAudioElement).pause();
        }
      });

      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Audio playback error:", err));
    }
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-lg border border-surface-border bg-surface hover:border-accent/40 transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-black/40",
        isPlaying && "border-accent shadow-xl shadow-accent/10"
      )}
    >
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="none" />}

      <Link
        href={`/asset/${asset.assetId}`}
        className="block relative aspect-square w-full bg-surface-subtle overflow-hidden"
      >
        {hasValidImage ? (
          <img
            src={imageUrl}
            alt={asset.name}
            className={cn(
              "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",
              isPlaying && "scale-105 brightness-110"
            )}
            onError={(e) => {
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

        {/* Quick Play/Pause Floating Button (For Music & Audio Assets) */}
        {audioUrl && (
          <div className="absolute bottom-3 right-3 z-20">
            <button
              type="button"
              onClick={toggleCardAudio}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-2xl backdrop-blur-md transition-all duration-200 cursor-pointer border",
                isPlaying
                  ? "bg-accent text-[#0B0D10] border-accent scale-105 shadow-accent/40 animate-pulse"
                  : "bg-[#15181C]/90 text-accent border-accent/40 hover:bg-accent hover:text-[#0B0D10]"
              )}
              title={isPlaying ? "Pause Preview" : "Play 30s Audio Preview"}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Listen Preview</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Playing Equalizer Overlay Indicator */}
        {isPlaying && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none flex items-center justify-center z-10">
            <div className="flex items-center gap-1">
              <Disc3 className="w-8 h-8 text-accent animate-spin" />
              <div className="flex items-end gap-1 h-6">
                {[50, 90, 60, 100, 70].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-accent rounded-full animate-bounce"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${i * 0.12}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </Link>

      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link href={`/asset/${asset.assetId}`} className="group-hover:text-accent transition-colors">
            <h3 className="font-heading font-semibold text-base text-foreground line-clamp-1 flex items-center gap-1.5">
              {audioUrl && <Music className="w-3.5 h-3.5 text-accent shrink-0" />}
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
