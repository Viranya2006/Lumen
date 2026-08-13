import { NextResponse } from "next/server";
import { publicClient, CONTRACT_ADDRESS, LumenMarketplaceABI } from "@/lib/contract";
import { formatEth } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/assets:
 *   get:
 *     summary: Retrieve all registered digital assets
 *     description: Fetches all assets registered on the Lumen smart contract on Ethereum Sepolia.
 *     responses:
 *       200:
 *         description: A list of all digital assets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Asset'
 *       500:
 *         description: Error querying blockchain data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET() {
  try {
    const rawAssets = (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: LumenMarketplaceABI,
      functionName: "getAllAssets",
    })) as any[];

    const formattedAssets = rawAssets.map((asset) => ({
      assetId: Number(asset.assetId),
      name: asset.name,
      description: asset.description,
      category: asset.category,
      creator: asset.creator,
      currentOwner: asset.currentOwner,
      price: asset.price.toString(),
      priceEth: formatEth(asset.price),
      forSale: Boolean(asset.forSale),
      createdAt: Number(asset.createdAt),
      metadataURI: asset.metadataURI || "",
    }));

    return NextResponse.json(formattedAssets);
  } catch (error: any) {
    console.error("Error in GET /api/assets:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch assets from blockchain" },
      { status: 500 }
    );
  }
}
