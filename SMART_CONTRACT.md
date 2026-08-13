# Smart Contract Specification — Lumen

## Standard
ERC-721 (via OpenZeppelin's audited base contracts), since each digital
asset is unique and non-fungible. Do not use ERC-20 or ERC-1155 for this.

## Contract Name
`LumenMarketplace.sol`

## Data Structure

```solidity
struct Asset {
    uint256 assetId;
    string name;
    string description;
    string category;
    address creator;
    address currentOwner;
    uint256 price;
    bool forSale;
    uint256 createdAt;
    string metadataURI; // image URL or placeholder reference
}
```

Ownership history must be tracked per asset, either as a stored array of
past owner addresses with timestamps, or reconstructed from emitted events
(prefer storing it directly on-chain for reliability and simpler frontend
reads).

## Required Functions

| Function | Behaviour |
|---|---|
| `registerAsset(name, description, category, price, metadataURI)` | Mints a new ERC-721 token, sets `creator` and `currentOwner` to `msg.sender`, records `createdAt` |
| `listForSale(assetId, price)` | Only callable by `currentOwner`; sets `forSale = true` and updates `price` |
| `unlistFromSale(assetId)` | Only callable by `currentOwner`; sets `forSale = false` |
| `buyAsset(assetId)` (payable) | Requires `forSale == true` and `msg.value >= price`; transfers ownership, forwards payment to previous owner, appends to ownership history, sets `forSale = false` |
| `transferAsset(assetId, to)` | Only callable by `currentOwner`; direct transfer with no payment, appends to ownership history |
| `getOwnershipHistory(assetId)` | Returns full list of past owners with timestamps |
| `getAssetDetails(assetId)` | Returns the full `Asset` struct |
| `getAllAssets()` | Returns all registered assets (for marketplace listing) |
| `getAssetsByOwner(address)` | Returns all assets currently owned by a given address (for "My Assets") |
| `getTotalAssets()` | Returns total count of registered assets |
| `getTotalTransactions()` | Returns total count of buy/transfer events |

## Required Events

```solidity
event AssetRegistered(uint256 indexed assetId, address indexed creator, string name, uint256 timestamp);
event AssetListed(uint256 indexed assetId, uint256 price);
event AssetUnlisted(uint256 indexed assetId);
event AssetSold(uint256 indexed assetId, address indexed from, address indexed to, uint256 price, uint256 timestamp);
event AssetTransferred(uint256 indexed assetId, address indexed from, address indexed to, uint256 timestamp);
```

These events power the Dashboard and Activity Log pages — the frontend
reads event logs directly, no database involved.

## Security Requirements
- Use OpenZeppelin's `ReentrancyGuard` on `buyAsset`, since it handles
  payment transfer and state changes together
- Ownership checks (`require(msg.sender == currentOwner)`) on
  `listForSale`, `unlistFromSale`, `transferAsset`
- Input validation: non-empty name, price > 0 where relevant, valid
  recipient address (not zero address) on transfers
- Use OpenZeppelin's audited ERC-721 base rather than a custom
  implementation, to minimize attack surface
- Follow checks-effects-interactions ordering in `buyAsset` to prevent
  reentrancy even with the guard present, as defense in depth

## Testing Requirements
Write unit tests covering:
- Successful asset registration
- Listing and unlisting for sale
- Successful purchase, including correct fund transfer and ownership
  history update
- Rejected purchase when not listed or insufficient payment
- Successful direct transfer
- Rejected actions from non-owner addresses (listing, unlisting,
  transferring someone else's asset)
- Correct totals returned by `getTotalAssets()` and
  `getTotalTransactions()`

## Deployment
Deploy to Sepolia testnet. After deployment, output the contract address
and full ABI to a shared location (e.g. `/lib/contract/` or
`/contracts/artifacts/`) that the Next.js frontend imports directly, so
there is a single source of truth for contract details across the app.

## Documentation
Every function must have NatSpec comments (`@notice`, `@param`, `@return`)
so the contract is self-documenting for the report's 3.1.2 and 3.1.3
sections.