import { NextRequest, NextResponse } from "next/server";
import { publicClient, CONTRACT_ADDRESS, LumenMarketplaceABI } from "@/lib/contract";
import { formatEth } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/assets/{id}:
 *   get:
 *     summary: Retrieve single asset details and ownership history
 *     description: Returns the detailed information and complete ownership timeline for a specific asset ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the asset
 *     responses:
 *       200:
 *         description: Full asset metadata and ownership history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 assetId:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 category:
 *                   type: string
 *                 creator:
 *                   type: string
 *                 currentOwner:
 *                   type: string
 *                 price:
 *                   type: string
 *                 priceEth:
 *                   type: string
 *                 forSale:
 *                   type: boolean
 *                 createdAt:
 *                   type: integer
 *                 metadataURI:
 *                   type: string
 *                 ownershipHistory:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OwnershipRecord'
 *       400:
 *         description: Invalid asset ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Asset not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server / blockchain read error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assetIdNum = parseInt(params.id, 10);
    if (isNaN(assetIdNum) || assetIdNum <= 0) {
      return NextResponse.json(
        { error: "Invalid asset ID parameter" },
        { status: 400 }
      );
    }

    const assetIdBigInt = BigInt(assetIdNum);

    const [rawAsset, rawHistory] = await Promise.all([
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: LumenMarketplaceABI,
        functionName: "getAssetDetails",
        args: [assetIdBigInt],
      }) as Promise<any>,
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: LumenMarketplaceABI,
        functionName: "getOwnershipHistory",
        args: [assetIdBigInt],
      }) as Promise<any[]>,
    ]);

    if (!rawAsset || !rawAsset.creator || rawAsset.creator === "0x0000000000000000000000000000000000000000") {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const formattedHistory = (rawHistory || []).map((record) => ({
      owner: record.owner,
      timestamp: Number(record.timestamp),
      price: record.price.toString(),
      priceEth: formatEth(record.price),
    }));

    const response = {
      assetId: Number(rawAsset.assetId),
      name: rawAsset.name,
      description: rawAsset.description,
      category: rawAsset.category,
      creator: rawAsset.creator,
      currentOwner: rawAsset.currentOwner,
      price: rawAsset.price.toString(),
      priceEth: formatEth(rawAsset.price),
      forSale: Boolean(rawAsset.forSale),
      createdAt: Number(rawAsset.createdAt),
      metadataURI: rawAsset.metadataURI || "",
      ownershipHistory: formattedHistory,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error in GET /api/assets/[id]:", error);
    if (error?.message?.includes("Asset does not exist") || error?.message?.includes("revert")) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: error?.message || "Failed to fetch asset from blockchain" },
      { status: 500 }
    );
  }
}
