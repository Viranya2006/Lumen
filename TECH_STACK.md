# Tech Stack — Lumen

## Confirmed Stack
- **Smart contract language:** Solidity, using OpenZeppelin's ERC-721 base
  contract
- **Target network:** Ethereum Sepolia testnet
- **Frontend framework:** Next.js (App Router), TypeScript strict mode
- **Package manager / runtime:** Bun
- **Styling:** Tailwind CSS
- **UI components:** shadcn/ui (per the shadcn skill in /SKILLS), composed
  to match the custom aesthetic in DESIGN.md — do not use shadcn's default
  look unmodified, restyle per DESIGN.md tokens
- **Blockchain connection:** wagmi + viem
- **Wallet connect UI:** RainbowKit
- **Wallet:** MetaMask (via RainbowKit)
- **3D elements:** Three.js / React Three Fiber, used sparingly per the 3D
  Web Experience skill in /SKILLS — see DESIGN.md for exactly where 3D is
  used (asset preview only, not decorative page-wide 3D)
- **Deployment:** Vercel (free hobby tier)

## Explicitly NOT Used
- **No database of any kind.** No Postgres, MongoDB, Supabase, Firebase, or
  any persistent off-chain data store. All asset, ownership, and
  transaction data lives on-chain in the smart contract. The Next.js API
  layer reads directly from the contract and its event logs on request; it
  does not cache to or read from a database.
- **No separate backend server.** Do not scaffold a FastAPI or Django
  backend even though a Python API skill may be present in /SKILLS — that
  skill is not applicable to this project. All API functionality lives in
  Next.js API routes (`/app/api/*`) only.
- **No authentication system.** Wallet connection via RainbowKit is the
  only identity mechanism. No email/password, no sessions, no JWT auth.
- **No image upload/hosting service.** Asset images are provided as URLs
  by the user at registration time, or use a generated placeholder if left
  blank. Do not integrate IPFS, Pinata, or similar unless explicitly asked.

## Required Environment Variables
Defined fully in DEPLOYMENT.md. Summary:
- `NEXT_PUBLIC_ALCHEMY_API_KEY`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_CHAIN_ID` (fixed at 11155111 for Sepolia)

## Code Quality Requirements
- TypeScript strict mode, no untyped `any` without justification
- ESLint + Prettier configured and passing before considering any task done
- Clear folder structure: `components/`, `hooks/`, `lib/`, `app/`
- No inline styles — Tailwind utility classes only, using DESIGN.md tokens
- App must run cleanly with `bun install && bun run dev` with no errors