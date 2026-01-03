import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hours = parseInt(searchParams.get("hours") || "24");

    // Eligibility rate calculation using bid_ratio as proxy
    const eligibilityMetrics = await query<{
      total_auctions: number;
      avg_bid_ratio: number;
      no_eligible_auctions: number;
      high_eligibility_auctions: number;
      medium_eligibility_auctions: number;
      low_eligibility_auctions: number;
    }>(
      `
      WITH auction_eligibility AS (
        SELECT
          a.id,
          a.total_bids,
          a.expected_bids,
          CASE WHEN a.expected_bids > 0
               THEN a.total_bids::float / NULLIF(a.expected_bids, 0)
               ELSE 0 END as bid_ratio
        FROM auctions a
        WHERE a.created_at > NOW() - INTERVAL '1 hour' * $1
      )
      SELECT
        COUNT(*) as total_auctions,
        AVG(bid_ratio) as avg_bid_ratio,
        COUNT(*) FILTER (WHERE bid_ratio = 0) as no_eligible_auctions,
        COUNT(*) FILTER (WHERE bid_ratio >= 0.8) as high_eligibility_auctions,
        COUNT(*) FILTER (WHERE bid_ratio > 0.3 AND bid_ratio < 0.8) as medium_eligibility_auctions,
        COUNT(*) FILTER (WHERE bid_ratio > 0 AND bid_ratio <= 0.3) as low_eligibility_auctions
      FROM auction_eligibility
      `,
      [hours]
    );

    // Campaigns with eligibility issues
    const problematicCampaigns = await query<{
      campaign_id: string;
      campaign_name: string;
      advertiser_name: string;
      status: string;
      remaining_budget: number;
      is_budget_exhausted: boolean;
      is_past_end_date: boolean;
      is_not_started: boolean;
      total_bids_received: number;
      auctions_participated: number;
    }>(
      `
      SELECT
        c.id as campaign_id,
        c.name as campaign_name,
        adv.company_name as advertiser_name,
        c.status,
        (c.total_budget - c.spent_amount) as remaining_budget,
        (c.total_budget - c.spent_amount) <= 0 as is_budget_exhausted,
        c.end_date < NOW() as is_past_end_date,
        c.start_date > NOW() as is_not_started,
        COUNT(b.id) as total_bids_received,
        COUNT(DISTINCT b.auction_id) as auctions_participated
      FROM campaigns c
      JOIN advertisers adv ON c.advertiser_id = adv.id
      LEFT JOIN bids b ON c.id = b.campaign_id
        AND b.created_at > NOW() - INTERVAL '1 hour' * $1
      WHERE c.status = 'active'
        AND (
          (c.total_budget - c.spent_amount) <= 0
          OR c.end_date < NOW()
          OR c.start_date > NOW()
        )
      GROUP BY c.id, c.name, adv.company_name, c.status, c.total_budget, c.spent_amount, c.end_date, c.start_date
      ORDER BY (c.total_budget - c.spent_amount) ASC
      LIMIT 20
      `,
      [hours]
    );

    // Eligibility by reason (why campaigns aren't bidding)
    const eligibilityBreakdown = await query<{
      reason: string;
      count: number;
      percent: number;
    }>(
      `
      WITH campaign_issues AS (
        SELECT
          c.id,
          (c.total_budget - c.spent_amount) <= 0 as budget_exhausted,
          c.end_date < NOW() as ended,
          c.start_date > NOW() as not_started,
          c.status != 'active' as not_active
        FROM campaigns c
        WHERE c.created_at > NOW() - INTERVAL '1 hour' * $1
      )
      SELECT
        'Budget Exhausted' as reason,
        COUNT(*) FILTER (WHERE budget_exhausted) as count,
        0 as percent
      FROM campaign_issues
      UNION ALL
      SELECT
        'Campaign Ended' as reason,
        COUNT(*) FILTER (WHERE ended AND NOT budget_exhausted) as count,
        0 as percent
      FROM campaign_issues
      UNION ALL
      SELECT
        'Not Started' as reason,
        COUNT(*) FILTER (WHERE not_started AND NOT budget_exhausted AND NOT ended) as count,
        0 as percent
      FROM campaign_issues
      UNION ALL
      SELECT
        'Not Active' as reason,
        COUNT(*) FILTER (WHERE not_active AND NOT budget_exhausted AND NOT ended AND NOT not_started) as count,
        0 as percent
      FROM campaign_issues
      UNION ALL
      SELECT
        'Healthy' as reason,
        COUNT(*) FILTER (WHERE NOT budget_exhausted AND NOT ended AND NOT not_started AND NOT not_active) as count,
        0 as percent
      FROM campaign_issues
      `,
      [hours]
    );

    // Calculate percentages for breakdown
    const totalIssues = eligibilityBreakdown.reduce(
      (sum, item) => sum + parseInt(item.count as unknown as string),
      0
    );
    const breakdownWithPercents = eligibilityBreakdown.map((item) => ({
      reason: item.reason,
      count: parseInt(item.count as unknown as string),
      percent: totalIssues > 0 ? (parseInt(item.count as unknown as string) / totalIssues) * 100 : 0,
    }));

    // Hourly eligibility rate trend
    const hourlyTrend = await query<{
      hour: string;
      avg_bid_ratio: number;
      auction_count: number;
      no_bid_count: number;
    }>(
      `
      SELECT
        TO_CHAR(DATE_TRUNC('hour', created_at), 'HH24:00') as hour,
        AVG(bid_ratio) as avg_bid_ratio,
        COUNT(*) as auction_count,
        COUNT(*) FILTER (WHERE total_bids = 0) as no_bid_count
      FROM auctions
      WHERE created_at > NOW() - INTERVAL '1 hour' * $1
      GROUP BY DATE_TRUNC('hour', created_at)
      ORDER BY hour DESC
      LIMIT 24
      `,
      [hours]
    );

    return NextResponse.json({
      overall: {
        totalAuctions: parseInt(eligibilityMetrics[0]?.total_auctions || "0"),
        avgEligibilityRate: parseFloat(eligibilityMetrics[0]?.avg_bid_ratio || "0") * 100,
        noEligibleAuctions: parseInt(eligibilityMetrics[0]?.no_eligible_auctions || "0"),
        highEligibilityAuctions: parseInt(eligibilityMetrics[0]?.high_eligibility_auctions || "0"),
        mediumEligibilityAuctions: parseInt(eligibilityMetrics[0]?.medium_eligibility_auctions || "0"),
        lowEligibilityAuctions: parseInt(eligibilityMetrics[0]?.low_eligibility_auctions || "0"),
      },
      breakdown: breakdownWithPercents,
      problematicCampaigns: problematicCampaigns.map((c) => ({
        campaignId: c.campaign_id,
        campaignName: c.campaign_name,
        advertiserName: c.advertiser_name,
        status: c.status,
        remainingBudget: parseFloat(c.remaining_budget as unknown as string),
        isBudgetExhausted: c.is_budget_exhausted,
        isPastEndDate: c.is_past_end_date,
        isNotStarted: c.is_not_started,
        totalBidsReceived: parseInt(c.total_bids_received as unknown as string),
        auctionsParticipated: parseInt(c.auctions_participated as unknown as string),
      })),
      hourlyTrend: hourlyTrend.map((h) => ({
        hour: h.hour,
        avgBidRatio: parseFloat(h.avg_bid_ratio as unknown as string) * 100,
        auctionCount: parseInt(h.auction_count as unknown as string),
        noBidCount: parseInt(h.no_bid_count as unknown as string),
      })),
    });
  } catch (error) {
    console.error("Error fetching eligibility stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch eligibility stats" },
      { status: 500 }
    );
  }
}
