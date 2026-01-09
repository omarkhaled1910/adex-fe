import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

/**
 * QC-friendly health check endpoint for the auction/bidding engine
 * Returns detailed diagnostics about recent errors, anomalies, and system health
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hours = parseInt(searchParams.get("hours") || "1");

    // 1. Get recent auction completion reasons breakdown
    const completionReasons = await query(
      `
      SELECT 
        completion_reason,
        COUNT(*) as count,
        AVG(duration_ms) as avg_duration,
        AVG(total_bids) as avg_bids,
        AVG(CASE WHEN expected_bids > 0 THEN (total_bids::float / expected_bids) ELSE 0 END) as avg_bid_ratio
      FROM auctions 
      WHERE created_at > NOW() - INTERVAL '1 hour' * $1
        AND status = 'completed'
      GROUP BY completion_reason
      ORDER BY count DESC
      `,
      [hours]
    );

    // 2. Get auction status distribution
    const statusDistribution = await query(
      `
      SELECT 
        status,
        COUNT(*) as count
      FROM auctions 
      WHERE created_at > NOW() - INTERVAL '1 hour' * $1
      GROUP BY status
      ORDER BY count DESC
      `,
      [hours]
    );

    // 3. Get auctions with potential issues (no bids, timeouts, etc.)
    const problematicAuctions = await query(
      `
      SELECT 
        a.id,
        a.publisher_id,
        p.domain,
        a.ad_slot_id,
        a.status,
        a.completion_reason,
        a.total_bids,
        a.expected_bids,
        a.bid_ratio,
        a.duration_ms,
        a.floor_price,
        a.created_at
      FROM auctions a
      LEFT JOIN publishers p ON a.publisher_id = p.id
      WHERE a.created_at > NOW() - INTERVAL '1 hour' * $1
        AND (
          (a.status = 'completed' AND a.total_bids = 0) OR
          a.completion_reason = 'timeout' OR
          a.duration_ms > 3000 OR
          (a.expected_bids > 0 AND a.bid_ratio < 0.1)
        )
      ORDER BY a.created_at DESC
      LIMIT 50
      `,
      [hours]
    );

    // 4. Get bid response time distribution
    const bidResponseTimes = await query(
      `
      SELECT 
        CASE 
          WHEN response_time_ms < 50 THEN '0-50ms'
          WHEN response_time_ms < 100 THEN '50-100ms'
          WHEN response_time_ms < 200 THEN '100-200ms'
          WHEN response_time_ms < 500 THEN '200-500ms'
          ELSE '500ms+'
        END as bucket,
        COUNT(*) as count,
        AVG(bid_amount) as avg_bid_amount
      FROM auction_bids ab
      JOIN auctions a ON ab.auction_id::text = a.id::text
      WHERE a.created_at > NOW() - INTERVAL '1 hour' * $1
        AND ab.response_time_ms IS NOT NULL
      GROUP BY bucket
      ORDER BY bucket
      `,
      [hours]
    );

    // 5. Get publisher-level health (which publishers have issues)
    const publisherHealth = await query(
      `
      SELECT 
        p.id as publisher_id,
        p.domain,
        COUNT(a.id) as total_auctions,
        COUNT(CASE WHEN a.total_bids = 0 THEN 1 END) as no_bid_auctions,
        COUNT(CASE WHEN a.completion_reason = 'timeout' THEN 1 END) as timeout_auctions,
        AVG(a.duration_ms) as avg_duration,
        AVG(a.total_bids) as avg_bids,
        AVG(a.bid_ratio) as avg_bid_ratio,
        ROUND(
          COUNT(CASE WHEN a.total_bids = 0 THEN 1 END)::numeric / 
          NULLIF(COUNT(a.id), 0) * 100, 
          2
        ) as no_bid_rate
      FROM publishers p
      LEFT JOIN auctions a ON p.id = a.publisher_id 
        AND a.created_at > NOW() - INTERVAL '1 hour' * $1
      WHERE a.id IS NOT NULL
      GROUP BY p.id, p.domain
      HAVING COUNT(a.id) > 0
      ORDER BY no_bid_rate DESC NULLS LAST
      LIMIT 20
      `,
      [hours]
    );

    // 6. Get campaign-level health (which campaigns are not bidding)
    const campaignHealth = await query(
      `
      SELECT 
        c.id as campaign_id,
        c.name as campaign_name,
        adv.company_name as advertiser_name,
        c.status,
        c.max_bid,
        c.daily_budget,
        c.spent_amount,
        COUNT(ab.id) as total_bids,
        COUNT(CASE WHEN ab.is_winner THEN 1 END) as wins,
        AVG(ab.bid_amount) as avg_bid_amount,
        AVG(ab.response_time_ms) as avg_response_time
      FROM campaigns c
      JOIN advertisers adv ON c.advertiser_id = adv.id
      LEFT JOIN auction_bids ab ON c.id = ab.campaign_id 
        AND ab.created_at > NOW() - INTERVAL '1 hour' * $1
      WHERE c.status = 'active'
      GROUP BY c.id, c.name, adv.company_name, c.status, c.max_bid, c.daily_budget, c.spent_amount
      ORDER BY total_bids ASC
      LIMIT 20
      `,
      [hours]
    );

    // 7. Get recent error patterns (auctions with invalid IDs, missing data, etc.)
    const recentErrors = await query(
      `
      SELECT 
        COUNT(CASE WHEN publisher_id IS NULL THEN 1 END) as missing_publisher,
        COUNT(CASE WHEN ad_slot_id IS NULL THEN 1 END) as missing_ad_slot,
        COUNT(CASE WHEN floor_price IS NULL OR floor_price <= 0 THEN 1 END) as invalid_floor_price,
        COUNT(CASE WHEN duration_ms IS NULL AND status = 'completed' THEN 1 END) as missing_duration,
        COUNT(CASE WHEN status NOT IN ('active', 'completed', 'expired', 'open') THEN 1 END) as unknown_status
      FROM auctions 
      WHERE created_at > NOW() - INTERVAL '1 hour' * $1
      `,
      [hours]
    );

    // 8. Calculate overall health score
    const totalAuctions = statusDistribution.reduce(
      (sum: number, s: any) => sum + parseInt(s.count),
      0
    );
    const completedAuctions =
      statusDistribution.find((s: any) => s.status === "completed")?.count || 0;
    const timeoutCount =
      completionReasons.find((r: any) => r.completion_reason === "timeout")
        ?.count || 0;
    const noBidCount = problematicAuctions.filter(
      (a: any) => a.total_bids === 0
    ).length;

    const completionRate =
      totalAuctions > 0
        ? (parseInt(completedAuctions) / totalAuctions) * 100
        : 0;
    const timeoutRate =
      totalAuctions > 0 ? (parseInt(timeoutCount) / totalAuctions) * 100 : 0;
    const noBidRate =
      totalAuctions > 0 ? (noBidCount / totalAuctions) * 100 : 0;

    // Health score: 100 - (timeoutRate * 2) - (noBidRate * 1.5) - (error penalties)
    const errorPenalty = Object.values(recentErrors[0] || {}).reduce(
      (sum: number, val: any) => sum + parseInt(val || 0),
      0
    );
    const healthScore = Math.max(
      0,
      Math.min(
        100,
        100 - timeoutRate * 2 - noBidRate * 1.5 - errorPenalty * 0.5
      )
    );

    // Determine health status
    let healthStatus: "healthy" | "degraded" | "critical" = "healthy";
    if (healthScore < 50) healthStatus = "critical";
    else if (healthScore < 80) healthStatus = "degraded";

    // Generate alerts based on thresholds
    const alerts: Array<{
      type: "error" | "warning" | "info";
      message: string;
    }> = [];

    if (timeoutRate > 20) {
      alerts.push({
        type: "error",
        message: `High timeout rate: ${timeoutRate.toFixed(1)}%`,
      });
    } else if (timeoutRate > 10) {
      alerts.push({
        type: "warning",
        message: `Elevated timeout rate: ${timeoutRate.toFixed(1)}%`,
      });
    }

    if (noBidRate > 30) {
      alerts.push({
        type: "error",
        message: `High no-bid rate: ${noBidRate.toFixed(1)}%`,
      });
    } else if (noBidRate > 15) {
      alerts.push({
        type: "warning",
        message: `Elevated no-bid rate: ${noBidRate.toFixed(1)}%`,
      });
    }

    if (errorPenalty > 0) {
      alerts.push({
        type: "warning",
        message: `Data integrity issues detected: ${errorPenalty} errors`,
      });
    }

    if (totalAuctions === 0) {
      alerts.push({
        type: "info",
        message: `No auctions in the last ${hours} hour(s)`,
      });
    }

    return NextResponse.json({
      healthStatus,
      healthScore: Math.round(healthScore),
      alerts,
      summary: {
        totalAuctions,
        completedAuctions: parseInt(completedAuctions),
        completionRate: completionRate.toFixed(1),
        timeoutRate: timeoutRate.toFixed(1),
        noBidRate: noBidRate.toFixed(1),
        timeRange: `${hours}h`,
      },
      completionReasons: completionReasons.map((r: any) => ({
        ...r,
        avg_duration: Number(r.avg_duration),
        avg_bids: Number(r.avg_bids),
        avg_bid_ratio: Number(r.avg_bid_ratio),
      })),
      statusDistribution,
      problematicAuctions,
      bidResponseTimes: bidResponseTimes.map((b: any) => ({
        ...b,
        avg_bid_amount: Number(b.avg_bid_amount),
      })),
      publisherHealth: publisherHealth.map((p: any) => ({
        ...p,
        avg_duration: Number(p.avg_duration),
        avg_bids: Number(p.avg_bids),
        avg_bid_ratio: Number(p.avg_bid_ratio),
        no_bid_rate: Number(p.no_bid_rate),
      })),
      campaignHealth: campaignHealth.map((c: any) => ({
        ...c,
        max_bid: Number(c.max_bid),
        daily_budget: Number(c.daily_budget),
        spent_amount: Number(c.spent_amount),
        avg_bid_amount: Number(c.avg_bid_amount),
        avg_response_time: Number(c.avg_response_time),
      })),
      dataIntegrity: recentErrors[0] || {},
    });
  } catch (error) {
    console.error("Error fetching auction health:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch auction health",
        healthStatus: "critical",
        healthScore: 0,
        alerts: [
          {
            type: "error",
            message: `Database error: ${(error as Error).message}`,
          },
        ],
      },
      { status: 500 }
    );
  }
}
