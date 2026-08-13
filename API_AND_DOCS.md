# API Layer and Documentation — Lumen

## Purpose
The Next.js API layer exists solely to aggregate on-chain event data into
a convenient format for the Dashboard and Activity pages, so the frontend
doesn't need to re-scan the whole chain's event history on every render.
It is a read-only convenience layer, not a data store — see TECH_STACK.md,
no database is used; results are computed live from contract event logs
on each request (or held in a short-lived in-memory cache if needed for
performance, not persisted).

## Required API Routes (`/app/api/*`)

### `GET /api/assets`
Returns all registered assets with current state.
Response: array of `Asset` objects (matching the contract struct).

### `GET /api/assets/[id]`
Returns a single asset's full details plus ownership history.
Response: `Asset` object + `ownershipHistory` array.

### `GET /api/dashboard`
Returns aggregated platform stats.
Response:
```json
{
  "totalAssets": 0,
  "totalTransactions": 0,
  "totalUniqueHolders": 0,
  "totalVolumeEth": "0.0",
  "topHolders": [
    { "address": "0x...", "assetCount": 0 }
  ],
  "recentActivity": [
    {
      "type": "AssetSold",
      "assetId": 0,
      "assetName": "string",
      "from": "0x...",
      "to": "0x...",
      "priceEth": "0.0",
      "timestamp": 0
    }
  ]
}
```

### `GET /api/activity`
Returns the full, unfiltered chronological event log for the Activity
page, same shape as `recentActivity` above but complete, with basic
pagination support via query params (`?page=1&limit=20`).

## Swagger / OpenAPI Documentation

- Generate an OpenAPI 3.0 spec (`openapi.json`) covering all four routes
  above: methods, query parameters, and full response schemas
- Use a standard library for this (e.g. `next-swagger-doc` to generate the
  spec from JSDoc-style comments on each route, paired with
  `swagger-ui-react` to render it)
- Serve interactive Swagger UI documentation at `/api/docs`
- Do not hand-roll the OpenAPI spec or the UI from scratch — use the
  standard libraries above

## Error Handling
All routes must return consistent error shapes on failure, e.g.:
```json
{ "error": "Description of what went wrong" }
```
with an appropriate HTTP status code (400 for bad input, 500 for RPC/
contract read failures), not raw stack traces.