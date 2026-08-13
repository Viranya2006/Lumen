"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { LumenMarketplaceABI, CONTRACT_ADDRESS, type Asset, type OwnershipRecord } from "@/lib/contract";
import dynamic from "next/dynamic";

const Asset3DViewer = dynamic(
  () => import("@/components/marketplace/Asset3DViewer").then((mod) => mod.Asset3DViewer),
  {
    ssr: false,
    loading: () => (
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-surface flex items-center justify-center border border-surface-border">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    ),
  }
);
import { ListAssetModal } from "@/components/modals/ListAssetModal";
import { TransferAssetModal } from "@/components/modals/TransferAssetModal";
import { AddressBadge } from "@/components/common/AddressBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatEth, formatDate, formatRelativeTime, getCategoryBadgeStyle } from "@/lib/utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  Tag,
  Send,
  ShoppingCart,
  History,
  ShieldCheck,
  Calendar,
  Layers,
  User,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assetIdParam = params?.id as string;
  const assetId = parseInt(assetIdParam, 10);

  const { address, isConnected } = useAccount();

  const [listModalOpen, setListModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  // Read asset details live from smart contract
  const {
    data: rawAsset,
    isLoading: isAssetLoading,
    error: assetError,
    refetch: refetchAsset,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LumenMarketplaceABI,
    functionName: "getAssetDetails",
    args: [BigInt(assetId || 0)],
  });

  // Read ownership history live from smart contract
  const {
    data: rawHistory,
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LumenMarketplaceABI,
    functionName: "getOwnershipHistory",
    args: [BigInt(assetId || 0)],
  });

  const {
    writeContract,
    data: txHash,
    isPending: isSignPending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Transaction confirmed on Ethereum Sepolia!");
      refetchAsset();
      refetchHistory();
      resetWrite();
    }
  }, [isConfirmed, refetchAsset, refetchHistory, resetWrite]);

  if (isNaN(assetId) || assetId <= 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <AlertCircle className="w-12 h-12 text-danger mb-3" />
        <h2 className="text-xl font-bold font-heading">Invalid Asset ID</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-4">The requested asset does not exist.</p>
        <Link href="/">
          <Button variant="outline">Return to Marketplace</Button>
        </Link>
      </div>
    );
  }

  if (isAssetLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-muted-foreground gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-sm font-medium">Fetching on-chain asset details from Sepolia...</p>
      </div>
    );
  }

  if (!rawAsset || rawAsset.creator === "0x0000000000000000000000000000000000000000") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <XCircle className="w-12 h-12 text-muted-foreground mb-3" />
        <h2 className="text-xl font-bold font-heading">Asset Not Found</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Asset #{assetId} is not registered on the smart contract.
        </p>
        <Link href="/">
          <Button variant="outline">Return to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const asset: Asset = {
    assetId: Number(rawAsset.assetId),
    name: rawAsset.name,
    description: rawAsset.description,
    category: rawAsset.category,
    creator: rawAsset.creator,
    currentOwner: rawAsset.currentOwner,
    price: BigInt(rawAsset.price || 0),
    forSale: Boolean(rawAsset.forSale),
    createdAt: Number(rawAsset.createdAt),
    metadataURI: rawAsset.metadataURI || "",
  };

  const history: OwnershipRecord[] = (rawHistory as any[] || []).map((rec: any) => ({
    owner: rec.owner,
    timestamp: Number(rec.timestamp),
    price: BigInt(rec.price || 0),
  }));

  const isOwner =
    isConnected &&
    address &&
    asset.currentOwner.toLowerCase() === address.toLowerCase();

  const isCreator =
    isConnected &&
    address &&
    asset.creator.toLowerCase() === address.toLowerCase();

  // Buy Asset Action
  const handleBuy = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: LumenMarketplaceABI,
        functionName: "buyAsset",
        args: [BigInt(asset.assetId)],
        value: asset.price,
      });
    } catch (err: any) {
      toast.error(err?.message || "Purchase initiation failed");
    }
  };

  // Unlist Asset Action
  const handleUnlist = async () => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: LumenMarketplaceABI,
        functionName: "unlistFromSale",
        args: [BigInt(asset.assetId)],
      });
    } catch (err: any) {
      toast.error(err?.message || "Unlist initiation failed");
    }
  };

  // List Asset Submit
  const handleListSubmit = async (assetId: number, priceWei: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: LumenMarketplaceABI,
      functionName: "listForSale",
      args: [BigInt(assetId), priceWei],
    });
  };

  // Transfer Asset Submit
  const handleTransferSubmit = async (assetId: number, to: `0x${string}`) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: LumenMarketplaceABI,
      functionName: "transferAsset",
      args: [BigInt(assetId), to],
    });
  };

  const catStyle = getCategoryBadgeStyle(asset.category);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Back Link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
        </Link>
      </div>

      {/* Main Asset View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: 3D Asset Preview Component */}
        <div className="lg:col-span-6 space-y-3">
          <Asset3DViewer
            assetId={asset.assetId}
            name={asset.name}
            category={asset.category}
            imageUrl={asset.metadataURI}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal" />
              ERC-721 Token #{asset.assetId}
            </span>
            <span>Minted {formatRelativeTime(asset.createdAt)}</span>
          </div>
        </div>

        {/* Right: Metadata, Pricing & Conditional Actions */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header Badges & Title */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className={`${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                {asset.category}
              </Badge>
              {asset.forSale ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  Listed for Sale
                </Badge>
              ) : (
                <Badge variant="muted">Not Listed</Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading text-foreground">
              {asset.name}
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {asset.description || "No description provided for this digital asset."}
            </p>
          </div>

          {/* Creators & Owners Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-surface-border bg-surface">
            <div>
              <span className="text-xs text-muted-foreground block mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Current Owner
              </span>
              <AddressBadge address={asset.currentOwner} chars={4} />
              {isOwner && (
                <span className="ml-2 text-[11px] font-semibold text-teal font-mono">
                  (You)
                </span>
              )}
            </div>

            <div>
              <span className="text-xs text-muted-foreground block mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Original Creator
              </span>
              <AddressBadge address={asset.creator} chars={4} />
              {isCreator && (
                <span className="ml-2 text-[11px] font-semibold text-accent font-mono">
                  (Creator)
                </span>
              )}
            </div>
          </div>

          {/* Pricing & Action Box */}
          <div className="p-6 rounded-xl border border-surface-border bg-gradient-to-b from-surface to-[#101316] space-y-5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Current Price
              </span>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-accent">
                  {asset.forSale ? `${formatEth(asset.price)} ETH` : "Not for sale"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {!isConnected ? (
                <div className="p-4 rounded-lg bg-surface-subtle border border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">
                    Connect wallet to buy or manage this asset
                  </span>
                  <ConnectButton />
                </div>
              ) : isOwner ? (
                /* Owner Actions */
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    {asset.forSale ? (
                      <Button
                        variant="outline"
                        onClick={handleUnlist}
                        disabled={isSignPending || isConfirming}
                        className="w-full"
                      >
                        {isSignPending || isConfirming ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Tag className="w-4 h-4 mr-2" />
                        )}
                        Unlist from Sale
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        onClick={() => setListModalOpen(true)}
                        disabled={isSignPending || isConfirming}
                        className="w-full"
                      >
                        <Tag className="w-4 h-4 mr-2" />
                        List for Sale
                      </Button>
                    )}

                    <Button
                      variant="secondary"
                      onClick={() => setTransferModalOpen(true)}
                      disabled={isSignPending || isConfirming}
                      className="w-full"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Transfer Asset
                    </Button>
                  </div>
                  {asset.forSale && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setListModalOpen(true)}
                      className="w-full text-xs text-muted-foreground hover:text-foreground"
                    >
                      Update Listing Price
                    </Button>
                  )}
                </div>
              ) : asset.forSale ? (
                /* Visitor Buy Action */
                <Button
                  size="lg"
                  onClick={handleBuy}
                  disabled={isSignPending || isConfirming}
                  className="w-full font-semibold gap-2 shadow-lg shadow-accent/20"
                >
                  {isSignPending || isConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing Purchase on Sepolia...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Buy Now for {formatEth(asset.price)} ETH
                    </>
                  )}
                </Button>
              ) : (
                /* Not for sale & not owner */
                <div className="p-3 text-center rounded-lg bg-surface-subtle border border-surface-border text-xs text-muted-foreground">
                  This asset is currently in the owner&apos;s private collection and not listed for sale.
                </div>
              )}

              {/* Status feedback */}
              {isSignPending && (
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/30 text-accent text-xs flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Waiting for signature confirmation in your wallet...</span>
                </div>
              )}

              {isConfirming && (
                <div className="p-3 rounded-lg bg-teal/10 border border-teal/30 text-teal text-xs flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Transaction broadcasted! Confirming block on Sepolia...</span>
                </div>
              )}

              {writeError && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="break-all">{writeError.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ownership History Section */}
      <section className="space-y-4 pt-6 border-t border-surface-border">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-teal" />
          <h2 className="text-xl font-bold font-heading text-foreground">
            On-Chain Ownership History
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Permanent verifiable provenance recorded directly on the Ethereum Sepolia smart contract.
        </p>

        {isHistoryLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal" />
          </div>
        ) : history.length > 0 ? (
          <div className="rounded-xl border border-surface-border bg-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-surface-border bg-surface-subtle text-muted-foreground font-medium uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">Owner Address</th>
                    <th className="py-3 px-4">Price Paid</th>
                    <th className="py-3 px-4">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border font-mono">
                  {history.map((record, index) => {
                    const isMint = index === 0;
                    const isTransfer = !isMint && record.price === 0n;
                    const isSale = !isMint && record.price > 0n;

                    return (
                      <tr key={index} className="hover:bg-surface-hover transition-colors">
                        <td className="py-3 px-4 font-sans">
                          {isMint ? (
                            <Badge variant="secondary" className="text-[10px]">
                              Minted
                            </Badge>
                          ) : isSale ? (
                            <Badge variant="default" className="text-[10px]">
                              Purchased
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">
                              Transferred
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <AddressBadge address={record.owner} chars={4} />
                        </td>
                        <td className="py-3 px-4 font-semibold text-accent font-mono">
                          {record.price > 0n ? `${formatEth(record.price)} ETH` : "—"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground font-sans">
                          {formatDate(record.timestamp)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-lg bg-surface border border-surface-border text-center text-xs text-muted-foreground">
            No history recorded yet for this asset.
          </div>
        )}
      </section>

      {/* Modals */}
      <ListAssetModal
        asset={asset}
        open={listModalOpen}
        onOpenChange={setListModalOpen}
        onSubmit={handleListSubmit}
        isLoading={isSignPending || isConfirming}
      />

      <TransferAssetModal
        asset={asset}
        open={transferModalOpen}
        onOpenChange={setTransferModalOpen}
        onSubmit={handleTransferSubmit}
        isLoading={isSignPending || isConfirming}
      />
    </div>
  );
}
