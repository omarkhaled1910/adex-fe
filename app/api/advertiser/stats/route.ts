import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// Demo advertiser ID (in production, this would come from auth)
const DEMO_ADVERTISER_ID = "a0000000-0000-0000-0000-000000000001";

export async function GET(request: NextRequest) {
  try {
    // Get campaign stats
    const campaignStats = await query(
      `
      SELECT 
        COALESCE(SUM(spent_amount), 0) as total_spent,
        COALESCE(SUM(impressions_served), 0) as impressions,
        COALESCE(SUM(clicks), 0) as clicks,
        COUNT(*) FILTER (WHERE status = 'active') as active_campaigns
      FROM campaigns
      WHERE advertiser_id = $1
    `,
      [DEMO_ADVERTISER_ID]
    );

    // Get creative count
    const creativeStats = await query(
      `
      SELECT COUNT(*) as active_creatives
      FROM ad_creatives ac
      JOIN campaigns c ON ac.campaign_id = c.id
      WHERE c.advertiser_id = $1 AND ac.status = 'active'
    `,
      [DEMO_ADVERTISER_ID]
    );

    const stats = campaignStats[0] || {
      total_spent: 0,
      impressions: 0,
      clicks: 0,
      active_campaigns: 0,
    };

    const totalSpent = parseFloat(stats.total_spent) || 0;
    const impressions = parseInt(stats.impressions) || 0;
    const clicks = parseInt(stats.clicks) || 0;
    const ctr = impressions > 0 ? clicks / impressions : 0;

    return NextResponse.json({
      totalSpent,
      impressions,
      clicks,
      ctr,
      activeCampaigns: parseInt(stats.active_campaigns) || 0,
      activeCreatives: parseInt(creativeStats[0]?.active_creatives) || 0,
    });
  } catch (error: any) {
    console.error("Error fetching advertiser stats:", error);
    return NextResponse.json(
      { message: "Failed to fetch stats", error: error.message },
      { status: 500 }
    );
  }
}
