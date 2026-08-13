# Lumen — Decentralized Digital Asset Marketplace

Lumen is a production-grade Web3 decentralized marketplace (DApp) that enables users to register unique digital assets, mint them as ERC-721 tokens on the Ethereum Sepolia testnet, and buy, sell, or transfer them with permanent on-chain ownership provenance.

Built for the **Blockchain Fundamentals (DAS5003)** Practical Project to demonstrate decentralized trust, audited smart contracts, wallet-based identity, and zero off-chain database dependency.

---

## 🌟 Key Features

- **ERC-721 Token Minting**: Define asset metadata (name, description, category, price, visual URI) and mint tokens directly to your connected wallet.
- **Atomic Escrow Trading**: Buy listed digital assets using smart contract payment forwarding and reentrancy protection.
- **On-Chain Provenance**: Inspect full ownership timeline (creator, sales, transfers, prices paid, block timestamps) permanently stored on Ethereum.
- **3D Asset Visualization**: Interactive Three.js / React Three Fiber asset detail inspector.
- **Real-Time Analytics Dashboard**: Platform metrics including total assets created, total transactions, top 10 asset holders leaderboard, volume chart, and recent activity log.
- **RESTful API & Swagger UI**: Read-only API layer querying Sepolia contract state with OpenAPI 3.0 documentation served at `/api/docs`.
- **Zero Database Architecture**: All assets, ownership histories, and activity events live on the blockchain ledger.

---

## 🛠️ Technology Stack

- **Smart Contract**: Solidity `0.8.24`, OpenZeppelin ERC-721 + ReentrancyGuard, Hardhat test suite
- **Target Network**: Ethereum Sepolia Testnet (`chainId: 11155111`)
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript (Strict Mode)
- **Package Runner**: Bun
- **Styling**: Tailwind CSS with custom dark charcoal, warm amber, and sharp teal palette
- **Web3 Layer**: Wagmi, Viem, RainbowKit (MetaMask)
- **3D Engine**: Three.js, React Three Fiber, React Three Drei
- **Documentation**: Swagger UI (`swagger-ui-react`), `next-swagger-doc`

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- [Bun](https://bun.sh) (`v1.3+`)
- [MetaMask](https://metamask.io) browser extension connected to Sepolia testnet
- Sepolia testnet ETH from a public faucet (e.g. [Google Cloud Sepolia Faucet](https://cloud.google.com/application/faucets/ethereum/sepolia) or [Sepolia PoW Faucet](https://sepolia-faucet.pk910.de/))

### 2. Installation
```bash
# Clone repository
git clone <repo-url>
cd Lumen

# Install dependencies with Bun
bun install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local` and configure your keys:
```bash
cp .env.example .env.local
```

| Variable | Description | Default / Example |
|---|---|---|
| `NEXT_PUBLIC_ALCHEMY_API_KEY` | Alchemy Sepolia RPC Key (optional, defaults to public RPC) | `your_alchemy_key` |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | RainbowKit WalletConnect ID | `3a8170812b534d0ff9d794f19a901d64` |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed LumenMarketplace contract address on Sepolia | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| `NEXT_PUBLIC_CHAIN_ID` | Ethereum Sepolia chain ID | `11155111` |

### 4. Smart Contract Compilation & Testing
```bash
# Compile Solidity contracts
bun run compile:contract

# Run Hardhat automated test suite (18 test scenarios)
bun run test:contract
```

### 5. Start Development Server
```bash
bun run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 API Documentation

Interactive Swagger documentation is available locally at:
```
http://localhost:3000/api/docs
```
Raw OpenAPI 3.0 JSON specification is served at:
```
http://localhost:3000/api/doc
```

### Endpoints
- `GET /api/assets` — Retrieve all registered assets from the contract.
- `GET /api/assets/:id` — Retrieve full asset metadata and ownership history timeline.
- `GET /api/dashboard` — Platform statistics (total assets, transactions, top 10 holders, volume).
- `GET /api/activity?page=1&limit=20` — Paginated platform transaction event log.

---

## ☁️ Deployment (Vercel)

1. Push your repository to GitHub.
2. Import the repository into your [Vercel Dashboard](https://vercel.com).
3. Under **Project Settings > Environment Variables**, add:
   - `NEXT_PUBLIC_ALCHEMY_API_KEY`
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_CHAIN_ID` = `11155111`
4. Click **Deploy**. Vercel will run `bun install && bun run build` and deploy the unified app and API layer.
