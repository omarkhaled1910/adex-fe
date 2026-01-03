/**
 * Bot types and interfaces
 */

export interface Campaign {
  id: string;
  advertiser_id: string;
  name: string;
  total_budget: number;
  daily_budget: number | null;
  spent_amount: number;
  max_bid: number;
  bid_strategy: "highest" | "dynamic" | "target_cpm" | "second_price";
  target_publishers: string[] | null;
  target_ad_slots: string[] | null;
  target_geos: string[] | null;
  target_devices: string[] | null;
  target_os: string[] | null;
  target_browsers: string[] | null;
  status: string;
  creatives: Creative[];
  avg_ctr?: number | null;
}

export interface Creative {
  id: string;
  campaign_id: string;
  name: string;
  format: string;
  assets: Record<string, any>;
  headline: string | null;
  description: string | null;
  cta_text: string | null;
  landing_url: string;
  width: number | null;
  height: number | null;
  duration: number | null;
  review_status: string;
  status: string;
  impressions: number;
  clicks: number;
  ctr: number | null;
}

export interface BidRequest {
  auctionId: string;
  publisherId: string;
  adSlotId: string;
  floorPrice: number;
  adSlotType: string;
  userContext: {
    countryCode?: string;
    device?: string;
    os?: string;
    browser?: string;
    userAgent?: string;
    ipAddress?: string;
    fingerprint?: string;
  };
  timestamp: number;
}

export interface BidResponse {
  auctionId: string;
  campaignId: string;
  advertiserId: string;
  amount: number;
  creative: Creative;
  timestamp: number;
}

export interface BotConfig {
  rabbitmqUrl: string;
  databaseUrl: string;
  advertiserIds: string[];
  participationRate: number;
  bidVariance: number;
  prefetch: number;
}

export interface AdvertiserConfig {
  advertiserId: string;
  apiKey: string;
  campaigns: string[];
  bidStrategy: "highest" | "dynamic" | "target_cpm" | "second_price";
  bidVariance: number;
  participationRate: number;
}
