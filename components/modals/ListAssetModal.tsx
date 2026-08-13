"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseEthToWei, formatEth } from "@/lib/utils";
import type { Asset } from "@/lib/contract";
import { Loader2, Tag } from "lucide-react";

interface ListAssetModalProps {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (assetId: number, priceWei: bigint) => Promise<void>;
  isLoading?: boolean;
}

export function ListAssetModal({
  asset,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: ListAssetModalProps) {
  const [priceEth, setPriceEth] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;

    if (!priceEth || parseFloat(priceEth) <= 0) {
      setError("Price must be greater than 0 ETH");
      return;
    }

    try {
      setError(null);
      const priceWei = parseEthToWei(priceEth);
      await onSubmit(asset.assetId, priceWei);
      onOpenChange(false);
      setPriceEth("");
    } catch (err: any) {
      setError(err?.message || "Failed to list asset");
    }
  };

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-accent" />
          List Asset for Sale
        </DialogTitle>
        <DialogDescription>
          Set a price in Sepolia ETH to make &quot;{asset.name}&quot; available for purchase on the marketplace.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">
            Listing Price (ETH)
          </label>
          <Input
            type="number"
            step="0.0001"
            min="0.0001"
            placeholder="0.05"
            value={priceEth}
            onChange={(e) => setPriceEth(e.target.value)}
            required
            disabled={isLoading}
            autoFocus
          />
          {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !priceEth}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Confirming in Wallet...
              </>
            ) : (
              "List for Sale"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
