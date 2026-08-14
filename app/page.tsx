"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useReadContract } from "wagmi";
import { LumenMarketplaceABI, CONTRACT_ADDRESS, type Asset } from "@/lib/contract";
import { AssetCard } from "@/components/marketplace/AssetCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatEth } from "@/lib/utils";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  Layers,
  ArrowUpDown,
  PlusCircle,
  ShieldCheck,
  TrendingUp,
  Tag,
  Loader2,
} from "lucide-react";

const CATEGORIES = [
  "All",
  "Art",
  "Collectible",
  "Domain",
  "Music",
  "Photography",
  "Virtual World",
  "Utility",
];

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"oldest" | "recent" | "price-asc" | "price-desc">("oldest");
  const [forSaleOnly, setForSaleOnly] = useState(false);

  // Read all assets live from smart contract
  const { data: rawAssets, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LumenMarketplaceABI,
    functionName: "getAllAssets",
    query: {
      refetchOnMount: true,
      staleTime: 0,
    },
  });

  const assets: Asset[] = useMemo(() => {
    if (!rawAssets || !Array.isArray(rawAssets)) return [];
    return rawAssets.map((a: any) => ({
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
  }, [rawAssets]);

  // Compute summary stats
  const stats = useMemo(() => {
    const total = assets.length;
    const forSaleCount = assets.filter((a) => a.forSale).length;
    const forSalePrices = assets
      .filter((a) => a.forSale && a.price > 0n)
      .map((a) => a.price);
    const floorPrice =
      forSalePrices.length > 0
        ? forSalePrices.reduce((min, p) => (p < min ? p : min), forSalePrices[0])
        : 0n;

    return {
      total,
      forSaleCount,
      floorPriceEth: floorPrice > 0n ? formatEth(floorPrice) : "0",
    };
  }, [assets]);

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    let result = [...assets];

    if (selectedCategory !== "All") {
      result = result.filter(
        (a) => a.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (forSaleOnly) {
      result = result.filter((a) => a.forSale);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.creator.toLowerCase().includes(q) ||
          a.currentOwner.toLowerCase().includes(q)
      );
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => (a.price < b.price ? -1 : a.price > b.price ? 1 : 0));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => (a.price > b.price ? -1 : a.price < b.price ? 1 : 0));
    } else if (sortBy === "recent") {
      result.sort((a, b) => b.createdAt - a.createdAt || b.assetId - a.assetId);
    } else {
      // "oldest" (First Created) - Default
      result.sort((a, b) => a.createdAt - b.createdAt || a.assetId - b.assetId);
    }

    return result;
  }, [assets, selectedCategory, searchQuery, sortBy, forSaleOnly]);

  return (
    <div className="min-h-screen pb-16 pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Hero Section */}
      <section className="relative rounded-2xl border border-surface-border bg-gradient-to-b from-surface/80 to-surface/30 p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 rounded-full bg-teal/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            DECENTRALIZED DIGITAL ASSET PLATFORM
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight font-heading">
            Provable ownership and trading on Ethereum Sepolia.
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Lumen eliminates the central intermediary. Mint authentic digital
            assets as ERC-721 tokens, buy and sell with smart contract escrow,
            and inspect permanent on-chain ownership records.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                <PlusCircle className="w-4 h-4" /> Register New Asset
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="gap-2">
                <TrendingUp className="w-4 h-4 text-teal" /> Platform Analytics
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Platform Metrics Banner */}
        <div className="mt-8 pt-6 border-t border-surface-border/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-muted-foreground block">Total Assets</span>
            <span className="text-xl font-bold font-mono text-foreground">
              {stats.total}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Listed for Sale</span>
            <span className="text-xl font-bold font-mono text-accent">
              {stats.forSaleCount}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Floor Price</span>
            <span className="text-xl font-bold font-mono text-teal">
              {stats.floorPriceEth} ETH
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Network</span>
            <span className="text-xl font-bold font-mono text-foreground">
              Sepolia
            </span>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by asset name, description, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-surface"
            />
          </div>

          {/* Controls: For Sale & Sorting */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <button
              type="button"
              onClick={() => setForSaleOnly(!forSaleOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                forSaleOnly
                  ? "bg-accent/15 border-accent/40 text-accent"
                  : "bg-surface border-surface-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              For Sale Only
            </button>

            <div className="flex items-center gap-1.5 bg-surface border border-surface-border rounded-md px-3 py-2 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-foreground focus:outline-none cursor-pointer"
              >
                <option value="oldest" className="bg-[#15181C] text-foreground">
                  First Created
                </option>
                <option value="recent" className="bg-[#15181C] text-foreground">
                  Recently Created
                </option>
                <option value="price-asc" className="bg-[#15181C] text-foreground">
                  Price: Low to High
                </option>
                <option value="price-desc" className="bg-[#15181C] text-foreground">
                  Price: High to Low
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-accent text-[#0B0D10] font-semibold shadow-sm shadow-accent/20"
                    : "bg-surface border border-surface-border text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Asset Grid / State Handling */}
      <section>
        {isLoading ? (
          <div className="min-h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-sm font-medium">Scanning Ethereum Sepolia ledger for assets...</p>
          </div>
        ) : filteredAssets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAssets.map((asset) => (
              <AssetCard key={asset.assetId} asset={asset} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={assets.length === 0 ? "No digital assets registered yet" : "No matching assets found"}
            description={
              assets.length === 0
                ? "Be the first to mint and list a digital asset on the Lumen Sepolia smart contract."
                : "Try adjusting your filters, category selection, or search keywords."
            }
            actionLabel="Register an Asset"
            actionHref="/register"
          />
        )}
      </section>
    </div>
  );
}
