import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { DEMO_PUBLISHER_ID } from "@/lib/config";

async function getPublisherIdFromRequest(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return DEMO_PUBLISHER_ID;
  }
  const apiKey = authHeader.substring(7);
  const result = await query("SELECT id FROM publishers WHERE api_key = $1", [apiKey]);
  return result.length > 0 ? result[0].id : DEMO_PUBLISHER_ID;
}

// GET /api/publisher/analytics - Get publisher analytics
export async function GET(request: NextRequest) {
  try {
    const publisherId = await getPublisherIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    // Get aggregate stats
    const stats = await query(
      `SELECT
         COALESCE SUM(impressions_served), 0) as total_impressions,
         COALESCE SUM(clicks), 0) as total_clicks,
         COALESCE SUM(total_revenue), 0) as total_revenue
       FROM ad_slots
       WHERE publisher_id = $1`,
      [publisherId]
    );

    // Get per-slot stats
    const slotStats = await query(
      `SELECT
         id,
         slot_name,
         slot_type,
         impressions_served,
         clicks,
         total_revenue,
         CASE
           WHEN impressions_served > 0 THEN (clicks::float / impressions_served * 100)
           ELSE 0
         END as ctr,
         CASE
           WHEN impressions_served > 0 THEN (total_revenue::float / impressions_served * 1000)
           ELSE 0
         END as rpm
       FROM ad_slots
       WHERE publisher_id = $1
       ORDER BY total_revenue DESC`,
      [publisherId]
    );

    // Generate daily stats (simulated for demo - in production use actual data)
    const dailyStats = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      // Simulate some variation in the data
      const baseImpressions = Math.floor(Math.random() * 50000) + 10000;
      const baseClicks = Math.floor(baseImpressions * (Math.random() * 0.02 + 0.005));
      const baseRevenue = (baseClicks * (Math.random() * 0.5 + 0.1)) +
                         (baseImpressions / 1000 * (Math.random() * 0.5 + 0.2));

      dailyStats.push({
        date: dateStr,
        impressions: baseImpressions,
        clicks: baseClicks,
        revenue: parseFloat(baseRevenue.toFixed(4)),
      });
    }

    const totalImpressions = stats[0]?.total_impressions || 0;
    const totalClicks = stats[0]?.total_clicks || 0;
    const totalRevenue = parseFloat(stats[0]?.total_revenue || 0);
    const avgCtr = totalImpressions > 0
      ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2))
      : 0;
    const fillRate = 85 + Math.random() * 10; // Simulated 85-95%

    return NextResponse.json({
      analytics: {
        total_impressions: totalImpressions,
        total_clicks: totalClicks,
        total_revenue: totalRevenue,
        avg_ctr: avgCtr,
        fill_rate: parseFloat(fillRate.toFixed(2)),
        daily_stats: dailyStats,
        slot_stats: slotStats,
      },
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
