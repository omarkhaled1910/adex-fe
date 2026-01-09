import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hours = parseInt(searchParams.get("hours") || "24");

    // Get dashboard stats from materialized view
    const dashboardStats = await query<{
      total_auctions: number;
      total_bids: number;
      total_impressions: number;
      total_clicks: number;
      total_spent: number;
      total_earned: number;
      active_publishers: number;
      active_advertisers: number;
      active_campaigns: number;
      auctions_24h: number;
      impressions_24h: number;
    }>(
      `
      SELECT * FROM dashboard_stats
      `
    );

    // Get real-time auction counts for specified time period
    const auctionMetrics = await query<{
      total_auctions: number;
      completed_auctions: number;
      active_auctions: number;
      avg_duration_ms: number;
      timeout_count: number;
      with_bids_count: number;
      no_bids_count: number;
    }>(
      `
      SELECT
        COUNT(*) as total_auctions,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_auctions,
        COUNT(*) FILTER (WHERE status = 'active') as active_auctions,
        AVG(duration_ms) FILTER (WHERE status = 'completed') as avg_duration_ms,
        COUNT(*) FILTER (WHERE completion_reason = 'timeout') as timeout_count,
        COUNT(*) FILTER (WHERE status = 'completed' AND total_bids > 0) as with_bids_count,
        COUNT(*) FILTER (WHERE status = 'completed' AND total_bids = 0) as no_bids_count
      FROM auctions
      WHERE created_at > NOW() - INTERVAL '1 hour' * $1
      `,
      [hours]
    );

    // Get bid metrics from auction_bids table (where bids are actually saved)
    const bidMetrics = await query<{
      total_bids: number;
      avg_bid_amount: number;
      avg_response_time_ms: number;
    }>(
      `
      SELECT
        COUNT(*) as total_bids,
        AVG(bid_amount) as avg_bid_amount,
        AVG(response_time_ms) as avg_response_time_ms
      FROM auction_bids
      WHERE created_at > NOW() - INTERVAL '1 hour' * $1
      `,
      [hours]
    );

    // Get revenue metrics
    const revenueMetrics = await query<{
      total_revenue: number;
      total_winning_amount: number;
    }>(
      `
      SELECT
        COALESCE(SUM(winning_price), 0) as total_revenue,
        COALESCE(SUM(winning_amount), 0) as total_winning_amount
      FROM auctions
      WHERE status = 'completed'
        AND settled = true
        AND created_at > NOW() - INTERVAL '1 hour' * $1
      `,
      [hours]
    );

    // Calculate derived metrics
    const stats = {
      totalAuctions: auctionMetrics[0]?.total_auctions || 0,
      completedAuctions: auctionMetrics[0]?.completed_auctions || 0,
      activeAuctions: auctionMetrics[0]?.active_auctions || 0,
      totalBids: bidMetrics[0]?.total_bids || 0,
      avgBidAmount: Number(bidMetrics[0]?.avg_bid_amount || 0),
      avgResponseTime: Number(bidMetrics[0]?.avg_response_time_ms || 0),
      avgDuration: Number(auctionMetrics[0]?.avg_duration_ms || 0),
      timeoutCount: auctionMetrics[0]?.timeout_count || 0,
      withBidsCount: auctionMetrics[0]?.with_bids_count || 0,
      noBidsCount: auctionMetrics[0]?.no_bids_count || 0,
      totalRevenue: Number(revenueMetrics[0]?.total_revenue || 0),
      activePublishers: dashboardStats[0]?.active_publishers || 0,
      activeAdvertisers: dashboardStats[0]?.active_advertisers || 0,
      activeCampaigns: dashboardStats[0]?.active_campaigns || 0,
      // Calculate derived stats
      completionRate:
        auctionMetrics[0]?.total_auctions > 0
          ? (auctionMetrics[0].completed_auctions /
              auctionMetrics[0].total_auctions) *
            100
          : 0,
      bidRate:
        auctionMetrics[0]?.completed_auctions > 0
          ? (auctionMetrics[0].with_bids_count /
              auctionMetrics[0].completed_auctions) *
            100
          : 0,
      timeoutRate:
        auctionMetrics[0]?.completed_auctions > 0
          ? (auctionMetrics[0].timeout_count /
              auctionMetrics[0].completed_auctions) *
            100
          : 0,
      avgBidsPerAuction:
        auctionMetrics[0]?.completed_auctions > 0
          ? bidMetrics[0]?.total_bids / auctionMetrics[0].completed_auctions
          : 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
