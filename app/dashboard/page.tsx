"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AddressBadge } from "@/components/common/AddressBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatEth, formatDate, formatRelativeTime } from "@/lib/utils";
import type { DashboardStats, ActivityEvent } from "@/lib/contract";
import {
  BarChart3,
  Layers,
  Repeat,
  Users,
  Coins,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Sparkles,
  Trophy,
  PieChart as PieChartIcon,
  Tag,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
  art: "#D4A650",
  collectible: "#2DD4BF",
  domain: "#818CF8",
  music: "#E879F9",
  photography: "#FBBF24",
  "virtual world": "#34D399",
  utility: "#94A3B8",
  other: "#64748B",
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const catName = data.name || "Category";
    const count = data.value || 0;
    const percentage = data.payload?.percentage || "0";
    const color = data.payload?.color || "#D4A650";

    return (
      <div className="bg-[#15181C] border border-[#2B3037] px-3.5 py-2.5 rounded-lg shadow-2xl text-xs space-y-1.5 min-w-[130px] z-50">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: color }}
          />
          <span className="font-bold text-[#F2F3F4]">{catName}</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-[#9AA0A6] pt-1 border-t border-[#22262B]">
          <span>Count:</span>
          <span className="text-[#F2F3F4] font-semibold">{count} {count === 1 ? "token" : "tokens"}</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-[#9AA0A6]">
          <span>Share:</span>
          <span className="text-accent font-bold">{percentage}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/dashboard");
      if (!res.ok) {
        throw new Error(`Failed to fetch dashboard data (${res.status})`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute category distribution data for Donut Chart
  const categoryData = useMemo(() => {
    if (!data?.categoryDistribution || data.categoryDistribution.length === 0) {
      return [
        { name: "Art", count: 1, percentage: "100", color: "#D4A650" },
      ];
    }

    return data.categoryDistribution.map((item) => {
      const key = item.name.toLowerCase();
      const color = CATEGORY_COLORS[key] || "#D4A650";
      return {
        name: item.name,
        count: item.count,
        percentage: item.percentage,
        color,
      };
    });
  }, [data]);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-teal/10 border border-teal/20 text-teal">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight font-heading">
              Platform Analytics
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time on-chain statistics, category distributions, and holder rankings directly from Sepolia.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={loading}
            className="text-xs"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
            Refresh Stats
          </Button>
          <Link href="/activity">
            <Button size="sm" variant="secondary" className="text-xs gap-1.5">
              Full Activity Log <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {loading && !data ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-muted-foreground gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm font-medium">Aggregating platform metrics from Ethereum Sepolia...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl border border-danger/30 bg-danger/10 text-danger text-center max-w-md mx-auto space-y-3">
          <p className="text-sm font-medium">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Assets */}
            <div className="p-6 rounded-xl border border-surface-border bg-surface hover:border-accent/30 transition-colors space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Assets</span>
                <div className="p-2 rounded-lg bg-surface-subtle text-accent border border-surface-border">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold font-mono text-foreground">
                {data?.totalAssets ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Total ERC-721 tokens minted
              </p>
            </div>

            {/* Total Transactions */}
            <div className="p-6 rounded-xl border border-surface-border bg-surface hover:border-teal/30 transition-colors space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Transactions</span>
                <div className="p-2 rounded-lg bg-surface-subtle text-teal border border-surface-border">
                  <Repeat className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold font-mono text-foreground">
                {data?.totalTransactions ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Sales & direct transfers executed
              </p>
            </div>

            {/* Total Unique Holders */}
            <div className="p-6 rounded-xl border border-surface-border bg-surface hover:border-indigo-500/30 transition-colors space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">Unique Holders</span>
                <div className="p-2 rounded-lg bg-surface-subtle text-indigo-400 border border-surface-border">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold font-mono text-foreground">
                {data?.totalUniqueHolders ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Unique wallet addresses holding tokens
              </p>
            </div>

            {/* Total Volume */}
            <div className="p-6 rounded-xl border border-surface-border bg-surface hover:border-accent/30 transition-colors space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Volume</span>
                <div className="p-2 rounded-lg bg-surface-subtle text-accent border border-surface-border">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold font-mono text-accent">
                {data?.totalVolumeEth ?? "0.00"} ETH
              </div>
              <p className="text-[11px] text-muted-foreground">
                Sum of all settled marketplace sales
              </p>
            </div>
          </div>

          {/* Category Distribution Donut & Top Holders Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Category Distribution Donut Chart Column */}
            <div className="lg:col-span-7 rounded-xl border border-surface-border bg-surface p-6 flex flex-col justify-between space-y-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-accent" />
                    Asset Category Distribution
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Breakdown of minted digital assets by category
                  </p>
                </div>
                <Badge variant="default" className="text-[11px]">Live Sepolia State</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center flex-1">
                {/* Donut Chart with Center Token Count */}
                <div className="sm:col-span-5 h-64 min-h-[220px] w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Pie
                        data={categoryData}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius="62%"
                        outerRadius="86%"
                        paddingAngle={4}
                        cornerRadius={6}
                        stroke="#15181C"
                        strokeWidth={3}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Donut Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                    <span className="text-2xl font-black font-mono text-foreground">
                      {data?.totalAssets || 0}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                      Minted
                    </span>
                  </div>
                </div>

                {/* Category Breakdown Progress Bars & Legend */}
                <div className="sm:col-span-7 space-y-3.5 max-h-64 overflow-y-auto pr-1">
                  {categoryData.map((cat) => (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="font-semibold text-foreground">
                            {cat.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-muted-foreground text-[11px]">
                            {cat.count} {cat.count === 1 ? "asset" : "assets"}
                          </span>
                          <span className="font-bold text-foreground text-xs">
                            {cat.percentage}%
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 rounded-full bg-surface-subtle overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(6, parseFloat(cat.percentage))}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top 10 Holders Leaderboard */}
            <div className="lg:col-span-5 rounded-xl border border-surface-border bg-surface p-6 flex flex-col justify-between space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-accent" />
                    Top 10 Asset Holders
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Ranked by total quantity of digital assets held
                  </p>
                </div>
              </div>

              {data?.topHolders && data.topHolders.length > 0 ? (
                <div className="divide-y divide-surface-border">
                  {data.topHolders.map((holder, index) => {
                    const share = data.totalAssets > 0
                      ? ((holder.assetCount / data.totalAssets) * 100).toFixed(1)
                      : "0";

                    return (
                      <div
                        key={holder.address}
                        className="py-2.5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[11px] font-bold ${
                              index === 0
                                ? "bg-accent text-[#0B0D10]"
                                : index === 1
                                ? "bg-teal text-[#0B0D10]"
                                : index === 2
                                ? "bg-amber-700/50 text-amber-200"
                                : "bg-surface-subtle text-muted-foreground"
                            }`}
                          >
                            {index + 1}
                          </span>
                          <AddressBadge address={holder.address} chars={3} />
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-foreground font-mono">
                            {holder.assetCount} {holder.assetCount === 1 ? "asset" : "assets"}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            ({share}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No holder data available yet.
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="rounded-xl border border-surface-border bg-surface p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal" />
                  Recent Blockchain Activity
                </h3>
                <p className="text-xs text-muted-foreground">
                  Latest 10 on-chain events emitted by the LumenMarketplace contract
                </p>
              </div>

              <Link href="/activity" className="text-xs text-accent hover:underline flex items-center gap-1">
                View All Activity <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data?.recentActivity && data.recentActivity.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-surface-border bg-surface-subtle text-muted-foreground font-medium uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Asset</th>
                      <th className="py-3 px-4">From</th>
                      <th className="py-3 px-4">To</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border font-mono">
                    {data.recentActivity.map((act, index) => (
                      <tr key={index} className="hover:bg-surface-hover transition-colors">
                        <td className="py-3 px-4 font-sans">
                          {act.type === "AssetRegistered" ? (
                            <Badge variant="secondary" className="text-[10px]">
                              Registered
                            </Badge>
                          ) : act.type === "AssetSold" ? (
                            <Badge variant="default" className="text-[10px]">
                              Sold
                            </Badge>
                          ) : act.type === "AssetListed" ? (
                            <Badge variant="default" className="text-[10px]">
                              Listed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">
                              Transferred
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 font-sans font-medium text-foreground">
                          <Link
                            href={`/asset/${act.assetId}`}
                            className="hover:text-accent transition-colors"
                          >
                            {act.assetName || `Asset #${act.assetId}`}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          {act.from ? <AddressBadge address={act.from} chars={3} /> : "—"}
                        </td>
                        <td className="py-3 px-4">
                          {act.to ? <AddressBadge address={act.to} chars={3} /> : "—"}
                        </td>
                        <td className="py-3 px-4 font-semibold text-accent font-mono">
                          {act.priceEth ? `${act.priceEth} ETH` : "—"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground font-sans">
                          {formatRelativeTime(act.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No activity records found yet.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
