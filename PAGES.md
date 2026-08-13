# Pages Specification — Lumen

Each page below must be fully functional and connected to the deployed
smart contract via wagmi/viem. No mock or placeholder data in the final
build — every number and list must reflect real on-chain state.

---

## 1. Landing / Marketplace (`/`)

**Purpose:** Browse all registered assets, the main entry point.

**Contents:**
- Top navigation bar (logo, nav links, Connect Wallet button)
- Page heading and short one-line description of Lumen
- Filter bar: filter by category, sort by price (low-high, high-low) or
  most recent
- Grid of asset cards, each showing: image/placeholder, name, category
  badge, current price, for-sale status badge, current owner (shortened
  address)
- Clicking a card navigates to that Asset Detail page
- Empty state if no assets are registered yet (first-run scenario)

**Data source:** `getAllAssets()` from the contract.

---

## 2. Connect Wallet (modal, not a route)

**Purpose:** Let the user connect MetaMask.

**Contents:**
- RainbowKit connect button in the nav bar
- On connect, verify the active network is Sepolia (`chainId 11155111`);
  if not, prompt the user to switch networks before allowing any
  write actions
- Once connected, show a shortened wallet address and avatar in the nav,
  with a dropdown to disconnect or view "My Assets"

---

## 3. Register Asset (`/register`)

**Purpose:** Create a new digital asset.

**Contents:**
- Form fields: Name, Description, Category (select/dropdown), Price (in
  ETH), Image URL (optional — falls back to a generated placeholder if
  left blank)
- Requires wallet connection; if not connected, show a prompt instead of
  the form
- Submit button triggers `registerAsset()`; show pending/confirming/
  success/failed transaction states clearly, not raw error text
- On success, redirect to the new asset's Detail page

---

## 4. Asset Detail Page (`/asset/[id]`)

**Purpose:** Full information and actions for a single asset.

**Contents:**
- Large image/preview panel with the single 3D tilt/rotation effect (per
  DESIGN.md)
- Asset info panel: name, description, category, current owner, creator,
  price, for-sale status
- "Ownership History" section — a clean timeline/table of past owners with
  timestamps, pulled from `getOwnershipHistory()`
- Conditional action buttons based on connection state:
  - If connected wallet is the owner: "List for Sale" / "Unlist" /
    "Transfer to Address" (with recipient input)
  - If connected wallet is not the owner and asset is for sale: "Buy Now"
    button showing price, triggers `buyAsset()` with correct payable value
  - If wallet not connected: prompt to connect first
- Transaction state feedback (pending in wallet, confirming on-chain,
  confirmed, failed) shown clearly, not just a spinner with no context

**Data source:** `getAssetDetails(assetId)`, `getOwnershipHistory(assetId)`

---

## 5. My Assets (`/my-assets`)

**Purpose:** Personal collection view for the connected wallet.

**Contents:**
- Requires wallet connection; prompt to connect if not
- Grid of assets owned by the connected address, same card style as the
  marketplace grid
- Quick actions directly on each card: List/Unlist, Transfer
- Empty state with a link to "Register your first asset" if the wallet
  owns nothing yet

**Data source:** `getAssetsByOwner(address)`

---

## 6. Dashboard (`/dashboard`)

**Purpose:** Platform-wide stats required by the assignment brief.

**Contents:**
- Four stat cards at the top: Total Assets, Total Transactions, Total
  Unique Holders, Total Volume (sum of sale prices)
- "Top 10 Holders" ranked table: wallet address (shortened), number of
  assets owned
- A simple chart (e.g. assets registered over time, or transaction volume
  over time) using data derived from event timestamps
- Recent activity feed: last ~10 events (registrations, sales, transfers)
  with timestamps, linking to the relevant asset

**Data source:** Aggregated from contract events
(`AssetRegistered`, `AssetSold`, `AssetTransferred`) via the
`/api/dashboard` route described in API_AND_DOCS.md.

---

## 7. Activity / Transactions Log (`/activity`)

**Purpose:** Full transparent log of every platform event (bonus page,
low risk since it reuses Dashboard's data source).

**Contents:**
- Chronological table/feed of every `AssetRegistered`, `AssetListed`,
  `AssetSold`, and `AssetTransferred` event platform-wide
- Each row: event type, asset name (linked), from/to address where
  relevant, price where relevant, timestamp
- Simple pagination or "load more" if the list grows long

**Data source:** Same event source as Dashboard, unfiltered and in full.

---

## Shared Components
- Navigation bar (persistent across all pages)
- Asset card (used on Landing, My Assets)
- Transaction status toast/banner (pending/success/failed)
- Address display component (shortens `0x1234...abcd` with copy-to-
  clipboard)
- Empty state component (reused across My Assets, Landing if no assets
  exist)