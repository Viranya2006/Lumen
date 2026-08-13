import { NextRequest, NextResponse } from "next/server";
import { publicClient, CONTRACT_ADDRESS, LumenMarketplaceABI, type ActivityEvent } from "@/lib/contract";
import { formatEth } from "@/lib/utils";
import { formatEther } from "viem";

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/activity:
 *   get:
 *     summary: Retrieve full chronological platform activity log
 *     description: Returns paginated event history including asset registrations, listings, unlistings, sales, and transfers.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by event type (AssetRegistered, AssetListed, AssetSold, AssetTransferred)
 *     responses:
 *       200:
 *         description: Paginated list of activity events
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityResponse'
 *       500:
 *         description: Error querying activity logs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const filterType = searchParams.get("type");

    const rawAssets = (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: LumenMarketplaceABI,
      functionName: "getAllAssets",
    })) as any[];

    const allActivities: ActivityEvent[] = [];

    const historyPromises = rawAssets.map(async (asset) => {
      const assetId = Number(asset.assetId);
      const name = asset.name;

      // Registration event
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
        // Continue
      }
    });

    await Promise.all(historyPromises);

    // Apply type filter if provided
    let filtered = allActivities;
    if (filterType && filterType !== "all") {
      filtered = filtered.filter(
        (a) => a.type.toLowerCase() === filterType.toLowerCase()
      );
    }

    // Sort descending by timestamp
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedEvents = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      events: paginatedEvents,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error: any) {
    console.error("Error in GET /api/activity:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch activity logs from blockchain" },
      { status: 500 }
    );
  }
}
