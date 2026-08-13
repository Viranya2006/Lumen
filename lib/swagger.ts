import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: "app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Lumen Marketplace API",
        version: "1.0.0",
        description:
          "Read-only API layer for querying Lumen smart contract data and on-chain event statistics on Ethereum Sepolia.",
      },
      servers: [
        {
          url: "/",
          description: "Lumen Server",
        },
      ],
      components: {
        schemas: {
          Asset: {
            type: "object",
            properties: {
              assetId: { type: "integer", example: 1 },
              name: { type: "string", example: "Cosmic Genesis #001" },
              description: { type: "string", example: "Digital genesis artifact" },
              category: { type: "string", example: "Art" },
              creator: { type: "string", example: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" },
              currentOwner: { type: "string", example: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" },
              price: { type: "string", example: "250000000000000000" },
              priceEth: { type: "string", example: "0.25" },
              forSale: { type: "boolean", example: true },
              createdAt: { type: "integer", example: 1723550000 },
              metadataURI: { type: "string", example: "https://example.com/asset.jpg" },
            },
          },
          OwnershipRecord: {
            type: "object",
            properties: {
              owner: { type: "string", example: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" },
              timestamp: { type: "integer", example: 1723550000 },
              price: { type: "string", example: "250000000000000000" },
              priceEth: { type: "string", example: "0.25" },
            },
          },
          DashboardResponse: {
            type: "object",
            properties: {
              totalAssets: { type: "integer", example: 24 },
              totalTransactions: { type: "integer", example: 18 },
              totalUniqueHolders: { type: "integer", example: 12 },
              totalVolumeEth: { type: "string", example: "4.85" },
              topHolders: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    address: { type: "string", example: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" },
                    assetCount: { type: "integer", example: 6 },
                  },
                },
              },
              recentActivity: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", example: "AssetSold" },
                    assetId: { type: "integer", example: 1 },
                    assetName: { type: "string", example: "Cosmic Genesis #001" },
                    from: { type: "string", example: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" },
                    to: { type: "string", example: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" },
                    priceEth: { type: "string", example: "0.25" },
                    timestamp: { type: "integer", example: 1723550000 },
                  },
                },
              },
            },
          },
          ActivityResponse: {
            type: "object",
            properties: {
              events: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", example: "AssetRegistered" },
                    assetId: { type: "integer", example: 1 },
                    assetName: { type: "string", example: "Cosmic Genesis #001" },
                    from: { type: "string", example: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" },
                    to: { type: "string", example: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" },
                    priceEth: { type: "string", example: "0.25" },
                    timestamp: { type: "integer", example: 1723550000 },
                  },
                },
              },
              total: { type: "integer", example: 42 },
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 20 },
              totalPages: { type: "integer", example: 3 },
            },
          },
          ErrorResponse: {
            type: "object",
            properties: {
              error: { type: "string", example: "Asset not found" },
            },
          },
        },
      },
    },
  });
  return spec;
};
