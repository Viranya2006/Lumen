"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { LumenMarketplaceABI, CONTRACT_ADDRESS } from "@/lib/contract";
import { parseEthToWei, formatWeb3ErrorMessage } from "@/lib/utils";
import { encodeMetadataURI, type MusicTrackResult } from "@/lib/music";
import { AudioPlayer } from "@/components/marketplace/AudioPlayer";
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
  Music,
  Search,
  Check,
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
  const [audioUrl, setAudioUrl] = useState("");

  // Music search state
  const [musicQuery, setMusicQuery] = useState("");
  const [musicResults, setMusicResults] = useState<MusicTrackResult[]>([]);
  const [isSearchingMusic, setIsSearchingMusic] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<MusicTrackResult | null>(null);

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

  // Handle iTunes Music search
  useEffect(() => {
    if (category !== "Music" || !musicQuery.trim()) {
      setMusicResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingMusic(true);
        const res = await fetch(
          `/api/music-search?q=${encodeURIComponent(musicQuery.trim())}`
        );
        if (res.ok) {
          const json = await res.json();
          setMusicResults(json.results || []);
        }
      } catch (err) {
        console.error("Music search error:", err);
      } finally {
        setIsSearchingMusic(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [musicQuery, category]);

  // Handle selecting a music track from search results
  const handleSelectTrack = (track: MusicTrackResult) => {
    setSelectedTrack(track);
    setName(track.trackName);
    setDescription(
      `Official Track by ${track.artistName}. Album: ${track.collectionName || "Single"}. Genre: ${track.genre}.`
    );
    if (track.artworkUrl) {
      setImageUrl(track.artworkUrl);
    }
    if (track.previewUrl) {
      setAudioUrl(track.previewUrl);
    }
    setMusicResults([]);
    toast.success(`Selected "${track.trackName}" by ${track.artistName}`);
  };

  // Handle successful registration & immediate redirect
  useEffect(() => {
    if (isConfirmed && receipt) {
      toast.success("Asset minted and registered on Sepolia testnet!");
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
      const priceWei =
        priceEth && parseFloat(priceEth) > 0 ? parseEthToWei(priceEth) : 0n;

      // Encode image URL + optional audio preview URL into metadataURI
      const finalMetadataURI = encodeMetadataURI(imageUrl, audioUrl);

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: LumenMarketplaceABI,
        functionName: "registerAsset",
        args: [
          name.trim(),
          description.trim(),
          category,
          priceWei,
          finalMetadataURI,
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
              {/* Category Selection */}
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

              {/* Music Search Autocomplete (Visible only when Category === "Music") */}
              {category === "Music" && (
                <div className="p-4 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-fuchsia-400">
                    <Music className="w-4 h-4" />
                    <span> Music Search by iTunes Public API</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Type a song or artist to auto-fill cover art & 30-second audio preview. No upload required!
                  </p>

                  <div className="relative">
                    <div className="relative flex items-center">
                      <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search e.g. Starboy, Blinding Lights, Cyberpunk..."
                        value={musicQuery}
                        onChange={(e) => setMusicQuery(e.target.value)}
                        className="pl-9 pr-8"
                        disabled={isSubmitting}
                      />
                      {isSearchingMusic && (
                        <Loader2 className="w-4 h-4 absolute right-3 animate-spin text-fuchsia-400" />
                      )}
                    </div>

                    {/* Results Dropdown */}
                    {musicResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-[#15181C] border border-surface-border rounded-lg shadow-2xl overflow-hidden divide-y divide-surface-border max-h-60 overflow-y-auto">
                        {musicResults.map((track) => (
                          <button
                            key={track.id}
                            type="button"
                            onClick={() => handleSelectTrack(track)}
                            className="w-full p-2.5 flex items-center gap-3 text-left hover:bg-surface-hover transition-colors cursor-pointer group"
                          >
                            <img
                              src={track.artworkUrl}
                              alt={track.trackName}
                              className="w-9 h-9 rounded object-cover border border-surface-border shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-foreground truncate group-hover:text-accent">
                                {track.trackName}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {track.artistName} • {track.collectionName || "Single"}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              30s Preview
                            </Badge>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedTrack && (
                    <div className="flex items-center gap-2 text-xs text-teal bg-teal/10 p-2 rounded-lg border border-teal/20">
                      <Check className="w-4 h-4" />
                      <span>Loaded track &quot;{selectedTrack.trackName}&quot; with 30s audio sample</span>
                    </div>
                  )}
                </div>
              )}

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
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Initial Listing Price (ETH) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center justify-between">
                  <span>Initial Sale Price (ETH)</span>
                  <span className="text-[11px] text-muted-foreground">Optional (leave blank for unlisted)</span>
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

              {/* Image / Cover Art URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center justify-between">
                  <span>Cover Art / Image URL</span>
                  <span className="text-[11px] text-muted-foreground">PNG, JPG, SVG, WebP</span>
                </label>
                <Input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Optional Audio Stream Preview URL (For Music Category) */}
              {(category === "Music" || audioUrl) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-accent">
                      <Music className="w-3.5 h-3.5" /> 30s Audio Stream Preview URL
                    </span>
                    <span className="text-[11px] text-muted-foreground">MP3, WAV, AAC stream</span>
                  </label>
                  <Input
                    type="url"
                    placeholder="https://audio-ssl.itunes.apple.com/..."
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    disabled={isSubmitting}
                  />
                  {audioUrl && (
                    <div className="pt-2">
                      <AudioPlayer
                        audioUrl={audioUrl}
                        trackName={name || "Selected Music Preview"}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Error Display */}
              {writeError && (
                <div className="p-3.5 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formatWeb3ErrorMessage(writeError)}</span>
                </div>
              )}

              {/* Submit Action Button */}
              <Button
                type="submit"
                className="w-full font-semibold py-6 text-sm gap-2"
                disabled={isSubmitting}
              >
                {isSignPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Please Confirm Transaction in Wallet...
                  </>
                ) : isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Minting & Registering on Sepolia...
                  </>
                ) : isConfirmed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    Asset Registered Successfully!
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    Mint ERC-721 Asset on Sepolia
                  </>
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Live Card Preview Column */}
        <div className="lg:col-span-5 space-y-4 sticky top-24">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Live Card Preview</span>
            <Badge variant="outline" className="text-[10px]">ERC-721</Badge>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface overflow-hidden shadow-2xl space-y-4 p-5">
            <div className="aspect-square w-full rounded-lg overflow-hidden bg-surface-subtle relative border border-surface-border flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={name || "Preview"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <AssetPlaceholder category={category} name={name || "Token Asset"} assetId={1} />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-[10px]">
                  {category}
                </Badge>
                <span className="text-xs font-mono font-bold text-accent">
                  {priceEth && parseFloat(priceEth) > 0 ? `${priceEth} ETH` : "Unlisted"}
                </span>
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground truncate">
                {name || "Untitled Asset"}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {description || "No description provided."}
              </p>
            </div>

            {audioUrl && (
              <AudioPlayer audioUrl={audioUrl} trackName={name || "Music Preview"} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
