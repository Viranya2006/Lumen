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
import { isAddress } from "viem";
import { formatWeb3ErrorMessage } from "@/lib/utils";
import type { Asset } from "@/lib/contract";
import { Loader2, Send } from "lucide-react";

interface TransferAssetModalProps {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (assetId: number, recipientAddress: `0x${string}`) => Promise<void>;
  isLoading?: boolean;
}

export function TransferAssetModal({
  asset,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: TransferAssetModalProps) {
  const [recipient, setRecipient] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;

    const trimmed = recipient.trim();
    if (!isAddress(trimmed)) {
      setError("Please enter a valid Ethereum address (0x...)");
      return;
    }

    if (trimmed.toLowerCase() === asset.currentOwner.toLowerCase()) {
      setError("Cannot transfer an asset to yourself");
      return;
    }

    try {
      setError(null);
      await onSubmit(asset.assetId, trimmed as `0x${string}`);
      onOpenChange(false);
      setRecipient("");
    } catch (err: any) {
      setError(formatWeb3ErrorMessage(err));
    }
  };

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-teal" />
          Transfer Digital Asset
        </DialogTitle>
        <DialogDescription>
          Directly transfer ownership of &quot;{asset.name}&quot; to another wallet address. This action is irreversible once confirmed on-chain.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">
            Recipient Wallet Address
          </label>
          <Input
            type="text"
            placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
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
          <Button
            type="submit"
            variant="secondary"
            disabled={isLoading || !recipient}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Confirming in Wallet...
              </>
            ) : (
              "Confirm Transfer"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
