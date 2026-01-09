import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Get all-time auction metrics (historical data)
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
      `
    );

    // Get all-time bid metrics from auction_bids table (where bids are actually saved)
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
      `
    );

    // Get counts directly from source tables (more accurate than materialized view)
    const dashboardStats = await query<{
      active_publishers: number;
      total_publishers: number;
      active_advertisers: number;
      total_advertisers: number;
      active_campaigns: number;
      total_campaigns: number;
      active_ad_slots: number;
      total_ad_slots: number;
      active_creatives: number;
      total_creatives: number;
    }>(
      `
      SELECT
        (SELECT COUNT(*) FROM publishers WHERE status = 'active') as active_publishers,
        (SELECT COUNT(*) FROM publishers) as total_publishers,
        (SELECT COUNT(*) FROM advertisers WHERE status = 'active') as active_advertisers,
        (SELECT COUNT(*) FROM advertisers) as total_advertisers,
        (SELECT COUNT(*) FROM campaigns WHERE status = 'active') as active_campaigns,
        (SELECT COUNT(*) FROM campaigns) as total_campaigns,
        (SELECT COUNT(*) FROM ad_slots WHERE status = 'active') as active_ad_slots,
        (SELECT COUNT(*) FROM ad_slots) as total_ad_slots,
        (SELECT COUNT(*) FROM ad_creatives WHERE status = 'active') as active_creatives,
        (SELECT COUNT(*) FROM ad_creatives) as total_creatives
      `
    );

    // Get ad slots breakdown by type
    const adSlotsByType = await query<{
      slot_type: string;
      count: number;
      total_impressions: number;
      total_clicks: number;
      total_revenue: number;
    }>(
      `
      SELECT
        slot_type,
        COUNT(*) as count,
        COALESCE(SUM(impressions_served), 0) as total_impressions,
        COALESCE(SUM(clicks), 0) as total_clicks,
        COALESCE(SUM(total_revenue), 0) as total_revenue
      FROM ad_slots
      GROUP BY slot_type
      ORDER BY count DESC
      `
    );

    // Get creatives breakdown by format
    const creativesByFormat = await query<{
      format: string;
      count: number;
      total_impressions: number;
      total_clicks: number;
      avg_ctr: number;
    }>(
      `
      SELECT
        format,
        COUNT(*) as count,
        COALESCE(SUM(impressions), 0) as total_impressions,
        COALESCE(SUM(clicks), 0) as total_clicks,
        CASE 
          WHEN SUM(impressions) > 0 THEN (SUM(clicks)::DECIMAL / SUM(impressions)) * 100
          ELSE 0
        END as avg_ctr
      FROM ad_creatives
      GROUP BY format
      ORDER BY count DESC
      `
    );

    // Get creatives breakdown by review status
    const creativesByReviewStatus = await query<{
      review_status: string;
      count: number;
    }>(
      `
      SELECT
        review_status,
        COUNT(*) as count
      FROM ad_creatives
      GROUP BY review_status
      ORDER BY count DESC
      `
    );

    // Get all-time revenue metrics
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
      `
    );

    // Calculate derived metrics
    const stats = {
      // Auction metrics
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

      // Publisher & Advertiser metrics
      activePublishers: dashboardStats[0]?.active_publishers || 0,
      totalPublishers: dashboardStats[0]?.total_publishers || 0,
      activeAdvertisers: dashboardStats[0]?.active_advertisers || 0,
      totalAdvertisers: dashboardStats[0]?.total_advertisers || 0,
      activeCampaigns: dashboardStats[0]?.active_campaigns || 0,
      totalCampaigns: dashboardStats[0]?.total_campaigns || 0,

      // Ad Slots metrics
      activeAdSlots: dashboardStats[0]?.active_ad_slots || 0,
      totalAdSlots: dashboardStats[0]?.total_ad_slots || 0,
      adSlotsByType: adSlotsByType.map((slot) => ({
        type: slot.slot_type,
        count: Number(slot.count),
        impressions: Number(slot.total_impressions),
        clicks: Number(slot.total_clicks),
        revenue: Number(slot.total_revenue),
      })),

      // Creatives metrics
      activeCreatives: dashboardStats[0]?.active_creatives || 0,
      totalCreatives: dashboardStats[0]?.total_creatives || 0,
      creativesByFormat: creativesByFormat.map((creative) => ({
        format: creative.format,
        count: Number(creative.count),
        impressions: Number(creative.total_impressions),
        clicks: Number(creative.total_clicks),
        avgCtr: Number(creative.avg_ctr),
      })),
      creativesByReviewStatus: creativesByReviewStatus.map((status) => ({
        status: status.review_status,
        count: Number(status.count),
      })),

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
    console.error("Error fetching all-time admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
