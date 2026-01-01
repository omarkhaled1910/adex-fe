export interface BidRequest {
  auctionId: string;
  publisherId: string;
  adSlot: string;
  adSlotSize?: string;
  adSlotType?: string;
  pageUrl: string;
  floorPrice: number | string;
  timestamp: number;
  userAgent?: string;
  geo?: string;
  deviceType?: string;
  viewability?: number;
  sessionDepth?: number;
}

export interface Bid {
  bidderId: string;
  bidderName?: string;
  amount: number;
  timestamp: number;
}

export interface BidResponse {
  auctionId: string;
  bidderId: string;
  bidderName?: string;
  amount: number;
  adCreative?: {
    id: string;
    type: string;
    size: string;
    landingUrl: string;
  };
  timestamp: number;
  ttl?: number;
}

export interface Auction {
  auctionId: string;
  publisherId: string;
  adSlot: string;
  adSlotSize?: string;
  adSlotType?: string;
  pageUrl: string;
  floorPrice: number | string;
  timestamp: number;
  bids: Bid[];
  highestBid: number;
  status: "active" | "closed" | "won" | "expired";
  winner?: Bid;
  expiresAt: number;
  lastUpdate?: number;
  geo?: string;
  deviceType?: string;
}

export interface Settlement {
  auctionId: string;
  advertiser: string;
  publisher: string;
  amount: number;
  impressionId: string;
  timestamp: number;
  status: "pending" | "settled" | "failed";
  txHash?: string;
}

export interface DashboardStats {
  totalAuctions: number;
  activeAuctions: number;
  totalBids: number;
  avgBidAmount: number;
  totalVolume: number;
  settlements: number;
}
