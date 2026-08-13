"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { LumenMarketplaceABI, CONTRACT_ADDRESS } from "@/lib/contract";
import { parseEthToWei, formatWeb3ErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AssetPlaceholder } from "@/components/marketplace/AssetPlaceholder";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  PlusCircle,
  Sparkles,
  Wallet,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const CATEGORIES = [
  "Art",
  "Collectible",
  "Domain",
  "Music",
  "Photography",
  "Virtual World",
  "Utility",
];

export default function RegisterAssetPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Art");
  const [priceEth, setPriceEth] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const {
    writeContract,
    data: txHash,
    isPending: isSignPending,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const isSubmitting = isSignPending || isConfirming;

  // Handle successful registration & immediate redirect
  useEffect(() => {
    if (isConfirmed && receipt) {
      toast.success("Asset minted and registered on Sepolia testnet!");
      // Redirect to My Assets collection immediately
      window.location.href = "/my-assets";
    }
  }, [isConfirmed, receipt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error("Please connect your MetaMask wallet first.");
      return;
    }

    if (!name.trim()) {
      toast.error("Asset name is required.");
      return;
    }

    try {
      const priceWei = priceEth && parseFloat(priceEth) > 0 ? parseEthToWei(priceEth) : 0n;

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: LumenMarketplaceABI,
        functionName: "registerAsset",
        args: [
          name.trim(),
          description.trim(),
          category,
          priceWei,
          imageUrl.trim(),
        ],
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit transaction");
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-surface-border pb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> ERC-721 Token Minting
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight font-heading">
          Register a Digital Asset
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Define your asset metadata and mint an authentic ERC-721 token
          directly to your wallet on Ethereum Sepolia.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-xl border border-surface-border bg-surface p-6 sm:p-8 space-y-6">
          {!isConnected ? (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 bg-surface-subtle border border-surface-border rounded-lg">
              <div className="p-3 rounded-full bg-accent/10 text-accent">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground font-heading">
                Wallet Connection Required
              </h3>
              <p className="text-xs text-muted-foreground max-w-md">
                Connect your MetaMask wallet on Ethereum Sepolia to register and
                mint digital assets.
              </p>
              <ConnectButton />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Asset Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center justify-between">
                  <span>Asset Name <span className="text-danger">*</span></span>
                  <span className="text-[11px] text-muted-foreground">Unique Title</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Genesis Artifact #001"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground block">
                  Description
                </label>
                <Textarea
                  placeholder="Provide background, significance, and properties of this digital asset..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground block">
                  Category <span className="text-danger">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-10 px-3 rounded-md border border-surface-border bg-surface text-sm text-foreground focus:outline-none focus:border-accent transition-colors cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-[#15181C] text-foreground">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Initial Listing Price (ETH) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center justify-between">
                  <span>Initial Sale Price (ETH)</span>
                  <span className="text-[11px] text-muted-foreground">Optional (leave blank or 0 for unlisted)</span>
                </label>
                <Input
                  type="number"
                  step="0.0001"
                  min="0"
                  placeholder="0.1"
                  value={priceEth}
                  onChange={(e) => setPriceEth(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Image URL / Metadata URI */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center justify-between">
                  <span>Image URL / Metadata URI</span>
                  <span className="text-[11px] text-muted-foreground">Optional (defaults to algorithmic SVG pattern)</span>
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com/asset-image.png"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Transaction Progress Status Feedback */}
              {isSignPending && (
                <div className="p-3.5 rounded-lg bg-accent/10 border border-accent/30 text-accent text-xs flex items-center gap-2.5">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Waiting for signature confirmation in your wallet...</span>
                </div>
              )}

              {isConfirming && (
                <div className="p-3.5 rounded-lg bg-teal/10 border border-teal/30 text-teal text-xs flex items-center gap-2.5">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>
                    Transaction submitted! Confirming block on Sepolia testnet (~12s)...
                  </span>
                </div>
              )}

              {isConfirmed && (
                <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    Asset minted successfully! Opening collection...
                  </span>
                </div>
              )}

              {writeError && (
                <div className="p-3.5 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    {formatWeb3ErrorMessage(writeError)}
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-semibold gap-2"
                  disabled={isSubmitting || !name.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Minting on Sepolia...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      Mint & Register Asset
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Live Preview
            </span>
            <span className="text-[11px] text-muted-foreground">What buyers will see</span>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface overflow-hidden shadow-xl">
            <div className="relative aspect-square w-full bg-surface-subtle overflow-hidden">
              {imageUrl && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://") || imageUrl.startsWith("data:")) ? (
                <img
                  src={imageUrl}
                  alt={name || "Preview"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <AssetPlaceholder
                  category={category}
                  name={name || "New Asset"}
                  assetId="NEW"
                />
              )}

              <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                <Badge variant="secondary">{category}</Badge>
                {priceEth && parseFloat(priceEth) > 0 ? (
                  <Badge variant="default">For Sale</Badge>
                ) : (
                  <Badge variant="muted">Not Listed</Badge>
                )}
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <h3 className="font-heading font-bold text-lg text-foreground">
                  {name || "Untitled Asset"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                  {description || "No description specified yet. Fill out the form on the left to customize."}
                </p>
              </div>

              <div className="pt-3 border-t border-surface-border flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Creator</span>
                  <span className="text-xs font-mono text-foreground">
                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "0xYou...Connected"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-muted-foreground block">Price</span>
                  <span className="text-sm font-semibold font-mono text-accent">
                    {priceEth && parseFloat(priceEth) > 0 ? `${priceEth} ETH` : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
