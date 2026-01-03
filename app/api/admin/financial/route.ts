import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30");

    // Daily revenue trends
    const dailyRevenue = await query<{
      date: string;
      daily_revenue: number;
      auction_count: number;
      avg_winning_price: number;
      timeout_count: number;
    }>(
      `
      SELECT
        DATE(created_at) as date,
        COALESCE(SUM(winning_price), 0) as daily_revenue,
        COUNT(*) as auction_count,
        AVG(winning_price) as avg_winning_price,
        COUNT(*) FILTER (WHERE completion_reason = 'timeout') as timeout_count
      FROM auctions
      WHERE status = 'completed'
        AND settled = true
        AND created_at > NOW() - INTERVAL '1 day' * $1
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      `,
      [days]
    );

    // Platform fees (5% of revenue)
    const dailyFees = dailyRevenue.map((d) => ({
      date: d.date,
      fees: d.daily_revenue * 0.05,
    }));

    // CPM/CPC trends
    const cpmCpcTrends = await query<{
      date: string;
      impressions: number;
      clicks: number;
      avg_cpm: number;
      avg_cpc: number;
      ctr: number;
    }>(
      `
      SELECT
        DATE(i.created_at) as date,
        COUNT(*) as impressions,
        SUM(CASE WHEN i.clicked THEN 1 ELSE 0 END) as clicks,
        AVG(CASE WHEN a.winning_price IS NOT NULL
             THEN a.winning_price * 1000 END) as avg_cpm,
        AVG(CASE WHEN i.clicked AND a.winning_price IS NOT NULL
             THEN a.winning_price END) * 1000 as avg_cpc,
        AVG(CASE WHEN i.clicked THEN 100.0 ELSE 0 END) as ctr
      FROM impressions i
      LEFT JOIN auctions a ON i.auction_id = a.id
      WHERE i.created_at > NOW() - INTERVAL '1 day' * $1
      GROUP BY DATE(i.created_at)
      ORDER BY date DESC
      `,
      [days]
    );

    // Budget utilization by campaign
    const budgetUtilization = await query<{
      campaign_id: string;
      campaign_name: string;
      advertiser_name: string;
      total_budget: number;
      spent_amount: number;
      remaining_budget: number;
      utilization_percent: number;
      status: string;
      end_date: Date;
    }>(
      `
      SELECT
        c.id as campaign_id,
        c.name as campaign_name,
        adv.company_name as advertiser_name,
        c.total_budget,
        c.spent_amount,
        (c.total_budget - c.spent_amount) as remaining_budget,
        CASE
          WHEN c.total_budget > 0 THEN (c.spent_amount / c.total_budget) * 100
          ELSE 0
        END as utilization_percent,
        c.status,
        c.end_date
      FROM campaigns c
      JOIN advertisers adv ON c.advertiser_id = adv.id
      WHERE c.status IN ('active', 'paused')
        AND c.start_date < NOW()
        AND (c.end_date IS NULL OR c.end_date > NOW())
      ORDER BY (c.spent_amount / NULLIF(c.total_budget, 0)) DESC
      LIMIT 20
      `
    );

    // Top campaigns by spend
    const topCampaigns = await query<{
      campaign_id: string;
      campaign_name: string;
      advertiser_name: string;
      spent_amount: number;
      impressions_won: number;
      clicks: number;
      avg_cpm: number;
      avg_ctr: number;
    }>(
      `
      SELECT
        c.id as campaign_id,
        c.name as campaign_name,
        adv.company_name as advertiser_name,
        c.spent_amount,
        c.impressions_won,
        c.clicks,
        c.avg_cpm,
        c.avg_ctr
      FROM campaigns c
      JOIN advertisers adv ON c.advertiser_id = adv.id
      WHERE c.created_at > NOW() - INTERVAL '1 day' * $1
      ORDER BY c.spent_amount DESC
      LIMIT 10
      `,
      [days]
    );

    // Publisher earnings
    const publisherEarnings = await query<{
      publisher_id: string;
      domain: string;
      company_name: string;
      total_earnings: number;
      pending_earnings: number;
      auction_count: number;
    }>(
      `
      SELECT
        p.id as publisher_id,
        p.domain,
        p.company_name,
        p.total_earnings,
        p.pending_earnings,
        COUNT(DISTINCT a.id) as auction_count
      FROM publishers p
      LEFT JOIN auctions a ON p.id = a.publisher_id
        AND a.created_at > NOW() - INTERVAL '1 day' * $1
      GROUP BY p.id, p.domain, p.company_name, p.total_earnings, p.pending_earnings
      ORDER BY p.total_earnings DESC
      LIMIT 20
      `,
      [days]
    );

    // Summary metrics
    const summary = await query<{
      total_revenue: number;
      total_fees: number;
      total_impressions: number;
      total_clicks: number;
      avg_cpm: number;
      avg_cpc: number;
      overall_ctr: number;
    }>(
      `
      SELECT
        COALESCE(SUM(winning_price), 0) as total_revenue,
        COALESCE(SUM(winning_price), 0) * 0.05 as total_fees,
        COALESCE(COUNT(DISTINCT i.id), 0) as total_impressions,
        COALESCE(SUM(CASE WHEN i.clicked THEN 1 ELSE 0 END), 0) as total_clicks,
        AVG(a.winning_price * 1000) as avg_cpm,
        AVG(CASE WHEN i.clicked THEN a.winning_price ELSE NULL END * 1000) as avg_cpc,
        AVG(CASE WHEN i.clicked THEN 100.0 ELSE 0 END) as overall_ctr
      FROM auctions a
      LEFT JOIN impressions i ON a.id = i.auction_id
      WHERE a.status = 'completed'
        AND a.settled = true
        AND a.created_at > NOW() - INTERVAL '1 day' * $1
      `,
      [days]
    );

    return NextResponse.json({
      dailyRevenue: dailyRevenue.map((d) => ({
        date: d.date,
        revenue: parseFloat(d.daily_revenue as unknown as string),
        auctionCount: parseInt(d.auction_count as unknown as string),
        avgWinningPrice: parseFloat(d.avg_winning_price as unknown as string),
        timeoutCount: parseInt(d.timeout_count as unknown as string),
      })),
      dailyFees: dailyFees.map((d) => ({
        date: d.date,
        fees: parseFloat(d.fees as unknown as string),
      })),
      cpmCpcTrends: cpmCpcTrends.map((t) => ({
        date: t.date,
        impressions: parseInt(t.impressions as unknown as string),
        clicks: parseInt(t.clicks as unknown as string),
        avgCpm: parseFloat(t.avg_cpm as unknown as string),
        avgCpc: parseFloat(t.avg_cpc as unknown as string),
        ctr: parseFloat(t.ctr as unknown as string),
      })),
      budgetUtilization: budgetUtilization.map((b) => ({
        campaignId: b.campaign_id,
        campaignName: b.campaign_name,
        advertiserName: b.advertiser_name,
        totalBudget: parseFloat(b.total_budget as unknown as string),
        spentAmount: parseFloat(b.spent_amount as unknown as string),
        remainingBudget: parseFloat(b.remaining_budget as unknown as string),
        utilizationPercent: parseFloat(b.utilization_percent as unknown as string),
        status: b.status,
        endDate: b.end_date,
      })),
      topCampaigns: topCampaigns.map((t) => ({
        campaignId: t.campaign_id,
        campaignName: t.campaign_name,
        advertiserName: t.advertiser_name,
        spentAmount: parseFloat(t.spent_amount as unknown as string),
        impressionsWon: parseInt(t.impressions_won as unknown as string),
        clicks: parseInt(t.clicks as unknown as string),
        avgCpm: parseFloat(t.avg_cpm as unknown as string),
        avgCtr: parseFloat(t.avg_ctr as unknown as string),
      })),
      publisherEarnings: publisherEarnings.map((p) => ({
        publisherId: p.publisher_id,
        domain: p.domain,
        companyName: p.company_name,
        totalEarnings: parseFloat(p.total_earnings as unknown as string),
        pendingEarnings: parseFloat(p.pending_earnings as unknown as string),
        auctionCount: parseInt(p.auction_count as unknown as string),
      })),
      summary: {
        totalRevenue: parseFloat(summary[0]?.total_revenue || "0"),
        totalFees: parseFloat(summary[0]?.total_fees || "0"),
        totalImpressions: parseInt(summary[0]?.total_impressions || "0"),
        totalClicks: parseInt(summary[0]?.total_clicks || "0"),
        avgCpm: parseFloat(summary[0]?.avg_cpm || "0"),
        avgCpc: parseFloat(summary[0]?.avg_cpc || "0"),
        overallCtr: parseFloat(summary[0]?.overall_ctr || "0"),
      },
    });
  } catch (error) {
    console.error("Error fetching financial data:", error);
    return NextResponse.json(
      { error: "Failed to fetch financial data" },
      { status: 500 }
    );
  }
}
