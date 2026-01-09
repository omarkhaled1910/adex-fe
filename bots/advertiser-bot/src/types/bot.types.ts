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
  category?: string;
  subcategory?: string;
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
  priorityBots?: string[];  // Categories that should bid first (e.g., ['video'])
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
  spawner: SpawnerConfig;
}

export interface AdvertiserConfig {
  advertiserId: string;
  apiKey: string;
  campaigns: string[];
  bidStrategy: "highest" | "dynamic" | "target_cpm" | "second_price";
  bidVariance: number;
  participationRate: number;
}

// ============================================================================
// Bot Spawner Types
// ============================================================================

export type BotPriority = 'video' | 'standard' | 'fallback';

export interface BotInstanceConfig {
  id: string;              // Unique bot instance ID
  category: string;        // Category this bot handles (e.g., 'video', 'gaming')
  priority: BotPriority;   // Bot priority level
  campaignIds: string[];   // Campaigns assigned to this bot
  participationRate: number;
  bidVariance: number;
}

export interface BotHealth {
  botId: string;
  category: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastHeartbeat: number;
  bidsProcessed: number;
  errors: number;
}

export interface SpawnerConfig {
  scanInterval: number;        // How often to rescan DB for new categories (ms)
  healthCheckInterval: number; // How often to check bot health (ms)
  maxBotsPerCategory: number;  // Max concurrent bots per category
  fallbackBidMultiplier: number; // Conservative bid factor for fallback
  priorityCategories: string[]; // Categories that always get priority (e.g., ['video'])
  unhealthyThreshold: number;  // Heartbeat timeout before bot marked unhealthy (ms)
}
