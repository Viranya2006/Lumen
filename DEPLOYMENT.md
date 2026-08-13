# Deployment — Lumen

## Deployment Model
Single deployment. The Next.js app (pages + API routes together) deploys
as one unit to Vercel. There is no separate backend deployment. The smart
contract is deployed separately, once, directly to the Sepolia testnet
(not via Vercel) — see @SMART_CONTRACT.md for contract details.

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_ALCHEMY_API_KEY` | RPC provider key, used to read/write to Sepolia | `abc123...` |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Required by RainbowKit for the wallet connect modal | `xyz789...` |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Address of the deployed LumenMarketplace contract on Sepolia | `0x1234...` |
| `NEXT_PUBLIC_CHAIN_ID` | Fixed Sepolia chain ID | `11155111` |

All variables are prefixed `NEXT_PUBLIC_` since they are needed client-side
for wagmi/viem/RainbowKit to function in the browser. None of these are
secret keys requiring server-only privacy (Alchemy read keys and a
WalletConnect project ID are safe to expose client-side), so no
server-only environment variables are needed for this project.

## Required Files

### `.env.example`
Must exist in the repo root, listing all four variables above with blank
or placeholder values, committed to git. The real `.env` file must be
git-ignored.

### `.gitignore`
Must include `.env`, `.env.local`, `node_modules/`, `.next/`.

### `vercel.json`
Standard Next.js configuration. Framework auto-detection usually makes
this minimal or unnecessary, but include one explicitly for clarity:
```json
{
  "framework": "nextjs",
  "buildCommand": "bun run build",
  "installCommand": "bun install"
}
```

### `README.md`
Must include:
- Project overview (short version of @PROJECT.md)
- Local setup instructions (`bun install`, copy `.env.example` to `.env`,
  fill in values, `bun run dev`)
- How to deploy: push to GitHub, import into Vercel, add the four
  environment variables in Vercel's project settings, deploy
- Where to find the deployed Sepolia contract address and how to get
  Sepolia test ETH from a faucet before testing

## Deployment Steps (for reference)
1. Deploy `LumenMarketplace.sol` to Sepolia, obtain the contract address
2. Update local `.env` with the real contract address and RPC/WalletConnect
   keys
3. Confirm `bun install && bun run dev` runs cleanly with no errors
4. Push the repository to GitHub
5. Import the repository into Vercel
6. Add all four environment variables in Vercel project settings
   (Production environment)
7. Trigger deployment, confirm the live URL loads and wallet connection
   works against Sepolia