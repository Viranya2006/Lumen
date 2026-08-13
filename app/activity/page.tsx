"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AddressBadge } from "@/components/common/AddressBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import type { ActivityEvent } from "@/lib/contract";
import {
  Activity,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Sparkles,
} from "lucide-react";

const EVENT_TABS = [
  { label: "All Events", value: "all" },
  { label: "Minted", value: "AssetRegistered" },
  { label: "Listed", value: "AssetListed" },
  { label: "Purchased", value: "AssetSold" },
  { label: "Transferred", value: "AssetTransferred" },
];

export default function ActivityLogPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchActivity = async (pageNum = 1, tab = activeTab) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/activity?page=${pageNum}&limit=15&type=${tab}`);
      if (!res.ok) {
        throw new Error("Failed to fetch activity");
      }
      const data = await res.json();
      setEvents(data.events || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching activity:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity(page, activeTab);
  }, [page, activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal/10 border border-teal/20 text-teal">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight font-heading">
              Activity & Transactions Log
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Complete, immutable chronological log of every action executed on the Lumen smart contract.
          </p>
        </div>

        <div className="text-xs font-mono text-muted-foreground">
          Total Events: <span className="text-foreground font-bold">{total}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {EVENT_TABS.map((tab) => {
          const isSelected = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleTabChange(tab.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isSelected
                  ? "bg-teal text-[#0B0D10] font-semibold shadow-sm shadow-teal/20"
                  : "bg-surface border border-surface-border text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Activity Table */}
      <div className="rounded-xl border border-surface-border bg-surface overflow-hidden shadow-xl">
        {loading ? (
          <div className="min-h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal" />
            <p className="text-sm font-medium">Scanning blockchain event logs...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-surface-border bg-surface-subtle text-muted-foreground font-medium uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-4">Asset</th>
                  <th className="py-3.5 px-4">From</th>
                  <th className="py-3.5 px-4">To</th>
                  <th className="py-3.5 px-4">Value</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border font-mono">
                {events.map((act, index) => (
                  <tr key={index} className="hover:bg-surface-hover transition-colors">
                    <td className="py-3.5 px-4 font-sans">
                      {act.type === "AssetRegistered" ? (
                        <Badge variant="secondary" className="text-[10px]">
                          Minted
                        </Badge>
                      ) : act.type === "AssetSold" ? (
                        <Badge variant="default" className="text-[10px]">
                          Purchased
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
                    <td className="py-3.5 px-4 font-sans font-medium text-foreground">
                      <Link
                        href={`/asset/${act.assetId}`}
                        className="hover:text-accent transition-colors flex items-center gap-1.5"
                      >
                        {act.assetName || `Asset #${act.assetId}`}
                        <span className="text-[11px] text-muted-foreground font-mono">
                          (#{act.assetId})
                        </span>
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      {act.from ? <AddressBadge address={act.from} chars={3} /> : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      {act.to ? <AddressBadge address={act.to} chars={3} /> : "—"}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-accent font-mono">
                      {act.priceEth ? `${act.priceEth} ETH` : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground font-sans">
                      {formatDate(act.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-muted-foreground">
            No events found for this filter.
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-border bg-surface-subtle">
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
