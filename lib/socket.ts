import { io, Socket } from "socket.io-client";

export interface Bid {
  advertiserId: string;
  amount: number;
  timestamp: number;
  creative: {
    headline: string;
    cta: string;
    image: string;
    landingUrl: string;
  };
}

export interface Auction {
  id: string;
  publisherId: string;
  adSlotId: string;
  floorPrice: number;
  bids: Bid[];
  status: "active" | "completed" | "expired";
  winner?: Bid;
  createdAt: number;
}

export interface BidResponse {
  auctionId: string;
  bid: Bid;
}

export interface SettlementEvent {
  auctionId: string;
  winner: Bid;
  amount: number;
  timestamp: number;
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
