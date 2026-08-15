"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import { Coins } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { LumenMarketplaceABI, CONTRACT_ADDRESS, type Asset } from "@/lib/contract";
import { AssetCard } from "@/components/marketplace/AssetCard";
import { ListAssetModal } from "@/components/modals/ListAssetModal";
import { TransferAssetModal } from "@/components/modals/TransferAssetModal";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FolderLock,
  PlusCircle,
  Sparkles,
  Wallet,
  Tag,
  Send,
  Loader2,
} from "lucide-react";

export default function MyAssetsPage() {
  const { address, isConnected } = useAccount();

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  const { data: balanceData } = useBalance({
    address,
    query: {
      enabled: Boolean(isConnected && address),
    },
  });

  // Query assets owned by the connected address
  const {
    data: rawOwnedAssets,
    isLoading,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LumenMarketplaceABI,
    functionName: "getAssetsByOwner",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(isConnected && address),
      refetchOnMount: true,
      staleTime: 0,
    },
  });

  const {
    writeContract,
    data: txHash,
    isPending: isSignPending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Action confirmed on Sepolia!");
      refetch();
      resetWrite();
    }
  }, [isConfirmed, refetch, resetWrite]);

  const ownedAssets: Asset[] = useMemo(() => {
    if (!rawOwnedAssets || !Array.isArray(rawOwnedAssets)) return [];
    return rawOwnedAssets.map((a: any) => ({
      assetId: Number(a.assetId),
      name: a.name,
      description: a.description,
      category: a.category,
      creator: a.creator,
      currentOwner: a.currentOwner,
      price: BigInt(a.price || 0),
      forSale: Boolean(a.forSale),
      createdAt: Number(a.createdAt),
      metadataURI: a.metadataURI || "",
    }));
  }, [rawOwnedAssets]);

  // Card Quick Actions
  const handleOpenList = (asset: Asset) => {
    setSelectedAsset(asset);
    setListModalOpen(true);
  };

  const handleOpenTransfer = (asset: Asset) => {
    setSelectedAsset(asset);
    setTransferModalOpen(true);
  };

  const handleUnlist = (asset: Asset) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: LumenMarketplaceABI,
        functionName: "unlistFromSale",
        args: [BigInt(asset.assetId)],
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to unlist asset");
    }
  };

  const handleListSubmit = async (assetId: number, priceWei: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: LumenMarketplaceABI,
      functionName: "listForSale",
      args: [BigInt(assetId), priceWei],
    });
  };

  const handleTransferSubmit = async (assetId: number, to: `0x${string}`) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: LumenMarketplaceABI,
      functionName: "transferAsset",
      args: [BigInt(assetId), to],
    });
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 text-accent">
              <FolderLock className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight font-heading">
              My Digital Assets
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your personal token collection on Ethereum Sepolia, update sale
            listings, and transfer ownership.
          </p>
        </div>

        {isConnected && (
          <Link href="/register">
            <Button className="gap-2">
              <PlusCircle className="w-4 h-4" /> Register New Asset
            </Button>
          </Link>
        )}
      </div>

      {/* Connected Wallet Stats Summary */}
      {isConnected && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-surface-border bg-surface flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground block">Wallet Balance</span>
              <span className="text-lg font-bold font-mono text-accent">
                {balanceData ? `${parseFloat(balanceData.formatted).toFixed(4)} ETH` : "Loading..."}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-accent/10 text-accent border border-accent/20">
              <Coins className="w-4 h-4" />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-surface-border bg-surface flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground block">Owned Assets</span>
              <span className="text-lg font-bold font-mono text-foreground">
                {ownedAssets.length} {ownedAssets.length === 1 ? "Token" : "Tokens"}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-teal/10 text-teal border border-teal/20">
              <FolderLock className="w-4 h-4" />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-surface-border bg-surface flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground block">Listed for Sale</span>
              <span className="text-lg font-bold font-mono text-teal">
                {ownedAssets.filter((a) => a.forSale).length} Assets
              </span>
            </div>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Tag className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isConnected ? (
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 bg-surface border border-surface-border rounded-xl max-w-lg mx-auto my-12 shadow-xl">
          <div className="p-4 rounded-full bg-accent/10 text-accent border border-accent/20">
            <Wallet className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-foreground font-heading">
            Connect Wallet to View Collection
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Connect your MetaMask wallet on Sepolia testnet to view and manage
            the assets you own.
          </p>
          <div className="pt-2">
            <ConnectButton />
          </div>
        </div>
      ) : isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm font-medium">Scanning blockchain for your owned tokens...</p>
        </div>
      ) : ownedAssets.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing {ownedAssets.length} digital {ownedAssets.length === 1 ? "asset" : "assets"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {ownedAssets.map((asset) => (
              <AssetCard
                key={asset.assetId}
                asset={asset}
                showQuickActions={true}
                onList={handleOpenList}
                onUnlist={handleUnlist}
                onTransfer={handleOpenTransfer}
              />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No assets in your collection yet"
          description="You haven't minted or purchased any digital assets on Lumen yet."
          actionLabel="Mint Your First Asset"
          actionHref="/register"
        />
      )}

      {/* Modals */}
      <ListAssetModal
        asset={selectedAsset}
        open={listModalOpen}
        onOpenChange={setListModalOpen}
        onSubmit={handleListSubmit}
        isLoading={isSignPending || isConfirming}
      />

      <TransferAssetModal
        asset={selectedAsset}
        open={transferModalOpen}
        onOpenChange={setTransferModalOpen}
        onSubmit={handleTransferSubmit}
        isLoading={isSignPending || isConfirming}
      />
    </div>
  );
}
