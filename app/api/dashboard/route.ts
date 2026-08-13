import { NextResponse } from "next/server";
import { publicClient, CONTRACT_ADDRESS, LumenMarketplaceABI, type ActivityEvent } from "@/lib/contract";
import { formatEth } from "@/lib/utils";
import { formatEther } from "viem";

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get aggregated marketplace platform analytics
 *     description: Computes live platform-wide metrics from on-chain state and event logs including total assets, volume, top 10 holders, and recent activity.
 *     responses:
 *       200:
 *         description: Aggregated analytics dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardResponse'
 *       500:
 *         description: Error querying platform stats
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET() {
  try {
    const [rawAssets, totalAssetsBN, totalTxsBN] = await Promise.all([
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: LumenMarketplaceABI,
        functionName: "getAllAssets",
      }) as Promise<any[]>,
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: LumenMarketplaceABI,
        functionName: "getTotalAssets",
      }) as Promise<bigint>,
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: LumenMarketplaceABI,
        functionName: "getTotalTransactions",
      }) as Promise<bigint>,
    ]);

    const totalAssets = Number(totalAssetsBN || 0n);
    const totalTransactions = Number(totalTxsBN || 0n);

    // Calculate holders map and total volume from ownership histories
    const holderMap: Record<string, number> = {};
    const assetMap: Record<number, string> = {};
    let totalVolumeWei = 0n;
    const allActivities: ActivityEvent[] = [];

    // Process all assets and fetch their ownership histories to calculate volume and activities
    const historyPromises = rawAssets.map(async (asset) => {
      const assetId = Number(asset.assetId);
      const name = asset.name;
      const owner = asset.currentOwner;
      assetMap[assetId] = name;

      if (owner && owner !== "0x0000000000000000000000000000000000000000") {
        holderMap[owner] = (holderMap[owner] || 0) + 1;
      }

      // Initial registration activity
      allActivities.push({
        type: "AssetRegistered",
        assetId,
        assetName: name,
        from: undefined,
        to: asset.creator,
        priceEth: asset.price > 0n ? formatEth(asset.price) : undefined,
        timestamp: Number(asset.createdAt),
      });

      if (asset.forSale && asset.price > 0n) {
        allActivities.push({
          type: "AssetListed",
          assetId,
          assetName: name,
          from: asset.currentOwner,
          to: undefined,
          priceEth: formatEth(asset.price),
          timestamp: Number(asset.createdAt),
        });
      }

      try {
        const history = (await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: LumenMarketplaceABI,
          functionName: "getOwnershipHistory",
          args: [BigInt(assetId)],
        })) as any[];

        if (history && history.length > 1) {
          for (let i = 1; i < history.length; i++) {
            const record = history[i];
            const prevRecord = history[i - 1];
            const price = BigInt(record.price || 0);

            if (price > 0n) {
              totalVolumeWei += price;
              allActivities.push({
                type: "AssetSold",
                assetId,
                assetName: name,
                from: prevRecord.owner,
                to: record.owner,
                priceEth: formatEther(price),
                timestamp: Number(record.timestamp),
              });
            } else {
              allActivities.push({
                type: "AssetTransferred",
                assetId,
                assetName: name,
                from: prevRecord.owner,
                to: record.owner,
                priceEth: undefined,
                timestamp: Number(record.timestamp),
              });
            }
          }
        }
      } catch (err) {
        // Individual history fetch fallback
      }
    });

    await Promise.all(historyPromises);

    // Compute top 10 holders
    const topHolders = Object.entries(holderMap)
      .map(([address, assetCount]) => ({ address, assetCount }))
      .sort((a, b) => b.assetCount - a.assetCount)
      .slice(0, 10);

    const totalUniqueHolders = Object.keys(holderMap).length;

    // Sort recent activities by timestamp descending
    allActivities.sort((a, b) => b.timestamp - a.timestamp);
    const recentActivity = allActivities.slice(0, 10);

    const totalVolumeEth = parseFloat(formatEther(totalVolumeWei)).toFixed(4);

    return NextResponse.json({
      totalAssets,
      totalTransactions,
      totalUniqueHolders,
      totalVolumeEth,
      topHolders,
      recentActivity,
    });
  } catch (error: any) {
    console.error("Error in GET /api/dashboard:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to aggregate dashboard analytics" },
      { status: 500 }
    );
  }
}
