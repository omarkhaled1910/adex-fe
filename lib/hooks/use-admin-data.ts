"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
export interface Publisher {
  id: string;
  domain: string;
  company_name: string;
  email: string;
  status: string;
  tier: string;
  total_earnings: number;
  pending_earnings: number;
  withdrawn_earnings: number;
  domain_verified: boolean;
  website_category: string | null;
  monthly_pageviews: number | null;
  auction_count: number;
  total_revenue_generated: number;
  avg_auction_duration: number | null;
  created_at: Date;
}

export interface PublisherStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  verified: number;
  totalEarnings: number;
}

export interface PublishersResponse {
  publishers: Publisher[];
  total: number;
  limit: number;
  offset: number;
  stats: PublisherStats;
}

export interface Auction {
  id: string;
  publisher_id: string;
  domain: string | null;
  publisher_name: string | null;
  ad_slot_id: string;
  status: string;
  floor_price: number;
  total_bids: number;
  expected_bids: number;
  bid_ratio: number;
  duration_ms: number | null;
  winning_amount: number | null;
  winning_price: number | null;
  completion_reason: string | null;
  bid_count: number;
  highest_bid: number | null;
  avg_response_time_ms: number | null;
  created_at: Date;
}

export interface AuctionsResponse {
  auctions: Auction[];
  total: number;
  limit: number;
  offset: number;
}

export interface Advertiser {
  id: string;
  wallet_address: string;
  company_name: string;
  email: string;
  status: string;
  on_chain_balance: number;
  reserved_balance: number;
  total_spent: number;
  kyc_status: string;
  campaign_count: number;
  active_campaigns_count: number;
  campaign_spend: number;
  total_impressions: number;
  avg_cpm: number;
  avg_cpc: number;
  created_at: Date;
}

export interface AdvertiserStats {
  total: number;
  active: number;
  pending: number;
  kycApproved: number;
  kycPending: number;
  totalSpend: number;
  totalBalances: number;
}

export interface AdvertisersResponse {
  advertisers: Advertiser[];
  total: number;
  limit: number;
  offset: number;
  stats: AdvertiserStats;
}

export interface PerformanceMetrics {
  duration: {
    avg: number;
    median: number;
    p95: number;
    p99: number;
    min?: number;
  };
  bidResponse: {
    avg: number;
    median: number;
    p95: number;
    p99: number;
  };
  completion: {
    totalAuctions: number;
    completionRate: number;
    bidSuccessRate: number;
    timeoutRate: number;
  };
}

// Fetch functions
async function fetchPublishers(params: {
  status?: string;
  limit: number;
  offset: number;
}): Promise<PublishersResponse> {
  const searchParams = new URLSearchParams();
  if (params.status && params.status !== "all") {
    searchParams.append("status", params.status);
  }
  searchParams.append("limit", params.limit.toString());
  searchParams.append("offset", params.offset.toString());

  const res = await fetch(`/api/admin/publishers?${searchParams.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch publishers");
  return res.json();
}

async function fetchAuctions(params: {
  status?: string;
  limit: number;
  offset: number;
  hours?: number;
}): Promise<AuctionsResponse> {
  const searchParams = new URLSearchParams();
  if (params.status && params.status !== "all") {
    searchParams.append("status", params.status);
  }
  searchParams.append("limit", params.limit.toString());
  searchParams.append("offset", params.offset.toString());
  if (params.hours) {
    searchParams.append("hours", params.hours.toString());
  }

  const res = await fetch(`/api/admin/auctions?${searchParams.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch auctions");
  return res.json();
}

async function fetchAdvertisers(params: {
  status?: string;
  limit: number;
  offset: number;
}): Promise<AdvertisersResponse> {
  const searchParams = new URLSearchParams();
  if (params.status && params.status !== "all") {
    searchParams.append("status", params.status);
  }
  searchParams.append("limit", params.limit.toString());
  searchParams.append("offset", params.offset.toString());

  const res = await fetch(`/api/admin/advertisers?${searchParams.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch advertisers");
  return res.json();
}

async function fetchPerformanceMetrics(hours: number = 24): Promise<PerformanceMetrics> {
  const res = await fetch(`/api/admin/performance?hours=${hours}`);
  if (!res.ok) throw new Error("Failed to fetch performance metrics");
  return res.json();
}

// Hooks
export function usePublishers(
  status: string,
  page: number,
  limit: number = 10,
  refetchInterval?: number | false
) {
  const offset = (page - 1) * limit;

  return useQuery({
    queryKey: ["admin", "publishers", status, page, limit],
    queryFn: () => fetchPublishers({ status, limit, offset }),
    refetchInterval: refetchInterval ?? false,
  });
}

export function useAuctions(
  status: string,
  page: number,
  limit: number = 10,
  hours: number = 24,
  refetchInterval?: number | false
) {
  const offset = (page - 1) * limit;

  return useQuery({
    queryKey: ["admin", "auctions", status, page, limit, hours],
    queryFn: () => fetchAuctions({ status, limit, offset, hours }),
    refetchInterval: refetchInterval ?? false,
  });
}

export function useAdvertisers(
  status: string,
  page: number,
  limit: number = 10,
  refetchInterval?: number | false
) {
  const offset = (page - 1) * limit;

  return useQuery({
    queryKey: ["admin", "advertisers", status, page, limit],
    queryFn: () => fetchAdvertisers({ status, limit, offset }),
    refetchInterval: refetchInterval ?? false,
  });
}

export function usePerformanceMetrics(
  hours: number = 24,
  refetchInterval?: number | false
) {
  return useQuery({
    queryKey: ["admin", "performance", hours],
    queryFn: () => fetchPerformanceMetrics(hours),
    refetchInterval: refetchInterval ?? false,
  });
}

// Mutation hooks for manual refresh
export function useRefreshPublishers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "publishers"] });
    },
  });
}

export function useRefreshAuctions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "auctions"] });
    },
  });
}

export function useRefreshAdvertisers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "advertisers"] });
    },
  });
}
