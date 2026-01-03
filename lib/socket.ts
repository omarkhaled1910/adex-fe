import { io, Socket } from "socket.io-client";

export interface Creative {
  id: string;
  campaign_id: string;
  name: string;
  format: string;
  headline?: string;
  description?: string;
  cta_text?: string;
  landing_url: string;
  assets?: Record<string, unknown>;
  width?: number;
  height?: number;
  ctr?: number;
}

export interface Bid {
  advertiserId: string;
  campaignId?: string;
  amount: number;
  timestamp: number;
  responseTime?: number;
  creative?:
    | Creative
    | {
        headline: string;
        cta: string;
        image: string;
        landingUrl: string;
      };
}

export interface AuctionMetadata {
  reason?:
    | "timeout"
    | "early_threshold"
    | "all_bids_received"
    | "shutdown"
    | "force";
  completionTime?: number;
  bidCount?: number;
  expectedCount?: number;
  winningPrice?: number;
  bidRatio?: number;
}

export interface Auction {
  id: string;
  publisherId: string;
  adSlotId: string;
  adSlotType?: string;
  floorPrice: number;
  bids: Bid[];
  status: "active" | "completed" | "expired" | "grace_period" | "completing";
  winner?: Bid;
  createdAt: number;
  completedAt?: number;
  metadata?: AuctionMetadata;
  userContext?: {
    countryCode?: string;
    device?: string;
    os?: string;
    browser?: string;
  };
}

export interface BidResponse {
  auctionId: string;
  bid: Bid;
  campaignId?: string;
  amount?: number;
  responseTime?: number;
}

export interface AuctionCompletedEvent {
  auctionId: string;
  winner: Bid | null;
  allBids: Bid[];
  auctionRequest: {
    id: string;
    publisherId: string;
    adSlotId: string;
    adSlotType?: string;
    floorPrice: number;
    userContext?: Auction["userContext"];
    timestamp: number;
  };
  completedAt: number;
  metadata: AuctionMetadata;
}

export interface SettlementEvent {
  auctionId: string;
  winner: Bid;
  amount: number;
  timestamp: number;
  publisherId?: string;
  advertiserId?: string;
}

const SOCKET_URL = "http://localhost:3003";

function createSocket(): Socket {
  const socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    transports: ["polling", "websocket"],
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  return socket;
}

// Only create socket on client side
let socket: Socket;

if (typeof window !== "undefined") {
  socket = createSocket();
} else {
  // Create a dummy socket for SSR that won't do anything
  socket = {
    on: () => socket,
    off: () => socket,
    emit: () => socket,
    connect: () => socket,
    disconnect: () => socket,
    connected: false,
  } as unknown as Socket;
}

export { socket };
