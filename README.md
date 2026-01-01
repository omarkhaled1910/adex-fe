# 🚀 AdExchange - Real-Time Programmatic Advertising Platform

A decentralized ad exchange platform built with Next.js 15, featuring real-time bidding via RabbitMQ, WebSocket-based live updates, and blockchain-powered settlement using EIP-712 signatures.

![AdExchange Dashboard](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?style=for-the-badge&logo=solidity)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         ADEXCHANGE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    RabbitMQ     ┌──────────────┐              │
│  │  Simulated   │ ──────────────► │     Bot      │              │
│  │    User      │   bid_requests  │  Advertiser  │              │
│  │  (Producer)  │                 │  (Consumer)  │              │
│  └──────────────┘                 └──────┬───────┘              │
│         │                                │                       │
│         │                                │ bid_responses         │
│         │                                ▼                       │
│         │                    ┌───────────────────┐              │
│         │                    │    Next.js +      │              │
│         └──────────────────► │    Socket.io      │              │
│              page views      │     Server        │              │
│                              └─────────┬─────────┘              │
│                                        │ WebSocket               │
│                                        ▼                         │
│                              ┌───────────────────┐              │
│                              │   React Dashboard │              │
│                              │   (Shadcn/UI)     │              │
│                              └─────────┬─────────┘              │
│                                        │                         │
│                                        │ EIP-712 Signature       │
│                                        ▼                         │
│                              ┌───────────────────┐              │
│                              │   AdExchange.sol  │              │
│                              │   Smart Contract  │              │
│                              └───────────────────┘              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## ✨ Features

- **Real-Time Bidding**: Sub-100ms auction cycles via RabbitMQ message queues
- **Live Dashboard**: WebSocket-powered UI with live bid updates
- **Blockchain Settlement**: EIP-712 typed signatures for off-chain settlement
- **Multi-Advertiser Simulation**: Bot advertisers with realistic bidding patterns
- **Dark Mode UI**: Cyberpunk-inspired design with neon accents
- **Shadcn/UI Components**: Modern, accessible component library

## 📋 Prerequisites

- Node.js 18+
- RabbitMQ Server
- MetaMask (for blockchain interaction)
- Hardhat (for local blockchain)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start RabbitMQ

Using Homebrew (macOS):

```bash
brew services start rabbitmq
```

Using Docker:

```bash
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:management
```

### 3. Start Local Blockchain

```bash
# Terminal 1: Start Hardhat node
npm run node
```

### 4. Deploy Smart Contract

```bash
# Terminal 2: Deploy contract
npm run deploy
```

### 5. Start the Application

```bash
# Terminal 2: Start Next.js + Socket.io server
npm run dev
```

### 6. Start Simulated User (Page Views)

```bash
# Terminal 3: Generate page view events
npm run simulate
```

### 7. Start Bot Advertiser

```bash
# Terminal 4: Automated bidding bot
npm run bot
```

### 8. Open Dashboard

Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
ADEXCH/
├── app/
│   ├── globals.css          # Global styles with CSS variables
│   ├── layout.tsx           # Root layout with dark mode
│   └── page.tsx             # Main dashboard component
├── components/
│   └── ui/                   # Shadcn/UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       └── ...
├── contracts/
│   └── AdExchange.sol        # EIP-712 settlement contract
├── hooks/
│   └── use-toast.ts          # Toast notification hook
├── lib/
│   ├── utils.ts              # Utility functions
│   ├── socket.ts             # Socket.io client
│   └── contract.ts           # Ethers.js contract interaction
├── scripts/
│   ├── deploy.js             # Contract deployment
│   ├── simulated-user.js     # Page view generator
│   └── bot.js                # Bot advertiser
├── server.js                 # Custom Next.js + Socket.io server
├── hardhat.config.js         # Hardhat configuration
└── package.json
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# Blockchain
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CONTRACT_ADDRESS=<deployed_contract_address>
RPC_URL=http://127.0.0.1:8545
CHAIN_ID=31337

# Next.js Public
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
NEXT_PUBLIC_CONTRACT_ADDRESS=<deployed_contract_address>
NEXT_PUBLIC_CHAIN_ID=31337
```

## 🎯 Auction Flow

1. **Page View**: Simulated user generates a page view event
2. **Bid Request**: Event published to RabbitMQ `bid_requests` queue
3. **Bidding**: Bot advertisers consume request, generate bids
4. **Bid Response**: Winning bid published to `bid_responses` queue
5. **Real-Time Update**: Server pushes update via Socket.io
6. **Settlement**: On click, EIP-712 signature triggers on-chain settlement

## 📜 Smart Contract

The `AdExchange.sol` contract implements:

- **Deposits**: Advertisers deposit ETH for bidding
- **EIP-712 Settlement**: Off-chain signatures for efficient settlement
- **Platform Fees**: 5% fee on successful settlements
- **Publisher Earnings**: Accumulated earnings for publishers

### Key Functions

```solidity
function deposit() external payable
function withdraw(uint256 amount) external
function settleAuction(Settlement calldata settlement, bytes calldata signature) external
function withdrawEarnings(uint256 amount) external
```

## 🎨 UI Components

Built with Shadcn/UI featuring:

- Neon accent variants for buttons and badges
- Custom glow animations
- Terminal-style typography (JetBrains Mono)
- Grid pattern background
- Responsive card layouts

## 🧪 Testing

```bash
# Run Hardhat tests
npx hardhat test

# Check contract compilation
npm run compile
```

## 📊 RabbitMQ Management

Access the RabbitMQ management UI at [http://localhost:15672](http://localhost:15672)

Default credentials:

- Username: `guest`
- Password: `guest`

## 🔒 Security Considerations

- Private keys in `.env` are for local development only
- EIP-712 signatures prevent replay attacks via nonces
- Contract uses ReentrancyGuard for all fund operations
- Input validation on all public functions

## 📄 License

MIT

---

Built with ⚡ by the AdExchange Team
