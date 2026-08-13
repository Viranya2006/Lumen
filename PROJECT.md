# Lumen — Decentralized Digital Asset Marketplace

## What This Is
Lumen is a blockchain-based decentralized application (DApp) that lets users
register unique digital assets, mint them as ownership tokens, and buy, sell,
or transfer them, with full ownership history permanently recorded on-chain.
This is an academic project for a Blockchain Fundamentals module, built to
demonstrate correct, professional implementation of core Web3 concepts:
smart contracts, decentralized trust, digital ownership, and wallet-based
identity.

## Core Concept
Every asset registered on Lumen becomes a token on the Ethereum Sepolia
testnet. Ownership, sale history, and transfers are all handled by a smart
contract, not by any central server or database. The app is a transparent
window into that on-chain data.

## Problem It Solves
Traditional digital marketplaces rely on a central authority to guarantee
who owns what. Lumen removes that middleman: ownership is provable and
verifiable directly on the blockchain, and anyone can independently confirm
an asset's full ownership history.

## Target Network
Ethereum Sepolia testnet (test ETH only, no real funds involved).

## Core User Flows
1. **Connect Wallet** — user connects MetaMask, app confirms they are on Sepolia
2. **Register an Asset** — user fills a form (name, description, category,
   price, image URL) and submits; this mints a new token via the smart
   contract
3. **Browse the Marketplace** — anyone can browse all registered assets,
   filter by category, see price and sale status
4. **View an Asset** — see full detail, current owner, and complete
   ownership history timeline
5. **Buy an Asset** — connected wallet purchases a listed asset; payment and
   ownership transfer happen atomically via the smart contract
6. **List / Unlist for Sale** — owner sets or removes a sale price
7. **Transfer an Asset** — owner sends an asset directly to another wallet
   address, no payment involved
8. **View Dashboard** — see platform-wide stats: total assets, total
   transactions, top 10 holders, recent activity

## Pages (see PAGES.md for full detail)
1. Landing / Marketplace
2. Connect Wallet (modal, not a separate page)
3. Register Asset
4. Asset Detail Page
5. My Assets
6. Dashboard
7. Activity / Transactions Log

## Non-Goals (explicitly out of scope)
- No database or off-chain storage of any kind (see TECH_STACK.md)
- No user accounts, email, or password auth — wallet address is identity
- No real payment processing — Sepolia test ETH only
- No mainnet deployment
- No admin panel or moderation tooling

## Reference Materials
- `Writ1_Practical_Project.pdf` in the project root is the official
  assignment brief this application is built to satisfy. Read it fully
  before building. All required features listed in Task 3.1(a) of that
  document are mandatory and must work correctly; do not omit any of them.
- `DESIGN.md` governs all visual and UX decisions.
- `SMART_CONTRACT.md` governs all contract logic.
- `PAGES.md` governs what each screen must contain.
- `API_AND_DOCS.md` governs the API layer and Swagger documentation.
- `DEPLOYMENT.md` governs environment variables and Vercel setup.
- Skills in the `/SKILLS` folder must be installed and actively followed
  during development, per their individual instructions.