// Publisher Types
export type PublisherStatus = "pending" | "active" | "suspended";
export type PublisherTier = "standard" | "premium" | "enterprise";
export type SlotType = "banner" | "video" | "native" | "interstitial";
export type SlotStatus = "active" | "paused" | "archived";

export interface Publisher {
  id: string;
  domain: string;
  company_name: string;
  email: string;
  api_key: string;
  wallet_address: string;
  status: PublisherStatus;
  tier: PublisherTier;
  total_earnings: number;
  pending_earnings: number;
  withdrawn_earnings: number;
  domain_verified: boolean;
  verification_token: string | null;
  verified_at: string | null;
  website_category: string | null;
  monthly_pageviews: number | null;
  created_at: string;
  updated_at: string;
}

export interface AdSlot {
  id: string;
  publisher_id: string;
  slot_name: string;
  slot_type: SlotType;
  width: number | null;
  height: number | null;
  floor_price: number;
  impressions_served: number;
  clicks: number;
  total_revenue: number;
  status: SlotStatus;
  created_at: string;
  updated_at: string;
}

// Form types
export interface RegisterPublisherInput {
  company_name: string;
  domain: string;
  email: string;
  wallet_address: string;
  website_category: string;
  monthly_pageviews: number;
}

export interface CreateAdSlotInput {
  slot_name: string;
  slot_type: SlotType;
  width: number | null;
  height: number | null;
  floor_price: number;
}

export interface UpdateAdSlotInput {
  floor_price?: number;
  status?: SlotStatus;
}

// Analytics types
export interface PublisherAnalytics {
  total_impressions: number;
  total_clicks: number;
  total_revenue: number;
  avg_ctr: number;
  fill_rate: number;
  daily_stats: DailyStats[];
}

export interface DailyStats {
  date: string;
  impressions: number;
  clicks: number;
  revenue: number;
}

export interface SlotAnalytics {
  slot_id: string;
  slot_name: string;
  impressions: number;
  clicks: number;
  revenue: number;
  ctr: number;
  rpm: number;
}
