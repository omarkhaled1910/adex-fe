import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hours = parseInt(searchParams.get("hours") || "24");

    // Auction duration metrics with percentiles
    const durationMetrics = await query<{
      avg: number;
      median: number;
      p95: number;
      p99: number;
      min: number;
      max: number;
      total_count: number;
    }>(
      `
      SELECT
        AVG(duration_ms) as avg,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms) as median,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95,
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms) as p99,
        MIN(duration_ms) as min,
        MAX(duration_ms) as max,
        COUNT(*) as total_count
      FROM auctions
      WHERE status = 'completed'
        AND created_at > NOW() - INTERVAL '1 hour' * $1
      `,
      [hours]
    );

    // Bid response time metrics
    const bidResponseMetrics = await query<{
      avg: number;
      median: number;
      p95: number;
      p99: number;
      total_bids: number;
    }>(
      `
      SELECT
        AVG(response_time_ms) as avg,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_time_ms) as median,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95,
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY response_time_ms) as p99,
        COUNT(*) as total_bids
      FROM bids
      WHERE created_at > NOW() - INTERVAL '1 hour' * $1
      `,
      [hours]
    );

    // Completion rates
    const completionMetrics = await query<{
      total_auctions: number;
      completed_count: number;
      with_bids_count: number;
      no_bids_count: number;
      timeout_count: number;
      early_count: number;
      avg_bid_ratio: number;
    }>(
      `
      SELECT
        COUNT(*) as total_auctions,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
        COUNT(*) FILTER (WHERE status = 'completed' AND total_bids > 0) as with_bids_count,
        COUNT(*) FILTER (WHERE status = 'completed' AND total_bids = 0) as no_bids_count,
        COUNT(*) FILTER (WHERE completion_reason = 'timeout') as timeout_count,
        COUNT(*) FILTER (WHERE completion_reason IN ('early_threshold', 'all_bids_received')) as early_count,
        AVG(bid_ratio) as avg_bid_ratio
      FROM auctions
      WHERE created_at > NOW() - INTERVAL '1 hour' * $1
      `,
      [hours]
    );

    // Bid distribution
    const bidDistribution = await query<{
      bid_count: number;
      auction_count: number;
    }>(
      `
      SELECT
        total_bids as bid_count,
        COUNT(*) as auction_count
      FROM auctions
      WHERE status = 'completed'
        AND created_at > NOW() - INTERVAL '1 hour' * $1
      GROUP BY total_bids
      ORDER BY total_bids
      `,
      [hours]
    );

    // Hourly auction volume
    const hourlyVolume = await query<{
      hour: string;
      auction_count: number;
      completed_count: number;
      avg_duration: number;
      avg_bids: number;
    }>(
      `
      SELECT
        TO_CHAR(DATE_TRUNC('hour', created_at), 'HH24:00') as hour,
        COUNT(*) as auction_count,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
        AVG(duration_ms) FILTER (WHERE status = 'completed') as avg_duration,
        AVG(total_bids) as avg_bids
      FROM auctions
      WHERE created_at > NOW() - INTERVAL '1 hour' * $1
      GROUP BY DATE_TRUNC('hour', created_at)
      ORDER BY hour DESC
      LIMIT 24
      `,
      [hours]
    );

    const metrics = {
      duration: {
        avg: parseFloat(durationMetrics[0]?.avg || "0"),
        median: parseFloat(durationMetrics[0]?.median || "0"),
        p95: parseFloat(durationMetrics[0]?.p95 || "0"),
        p99: parseFloat(durationMetrics[0]?.p99 || "0"),
        min: parseFloat(durationMetrics[0]?.min || "0"),
        max: parseFloat(durationMetrics[0]?.max || "0"),
      },
      bidResponse: {
        avg: parseFloat(bidResponseMetrics[0]?.avg || "0"),
        median: parseFloat(bidResponseMetrics[0]?.median || "0"),
        p95: parseFloat(bidResponseMetrics[0]?.p95 || "0"),
        p99: parseFloat(bidResponseMetrics[0]?.p99 || "0"),
        totalBids: parseInt(bidResponseMetrics[0]?.total_bids || "0"),
      },
      completion: {
        totalAuctions: parseInt(completionMetrics[0]?.total_auctions || "0"),
        completedCount: parseInt(completionMetrics[0]?.completed_count || "0"),
        withBidsCount: parseInt(completionMetrics[0]?.with_bids_count || "0"),
        noBidsCount: parseInt(completionMetrics[0]?.no_bids_count || "0"),
        timeoutCount: parseInt(completionMetrics[0]?.timeout_count || "0"),
        earlyCount: parseInt(completionMetrics[0]?.early_count || "0"),
        avgBidRatio: parseFloat(completionMetrics[0]?.avg_bid_ratio || "0"),
        // Calculate derived rates
        completionRate:
          parseInt(completionMetrics[0]?.total_auctions || "0") > 0
            ? (parseInt(completionMetrics[0]?.completed_count || "0") /
                parseInt(completionMetrics[0]?.total_auctions || "1")) *
              100
            : 0,
        bidSuccessRate:
          parseInt(completionMetrics[0]?.completed_count || "0") > 0
            ? (parseInt(completionMetrics[0]?.with_bids_count || "0") /
                parseInt(completionMetrics[0]?.completed_count || "1")) *
              100
            : 0,
        timeoutRate:
          parseInt(completionMetrics[0]?.completed_count || "0") > 0
            ? (parseInt(completionMetrics[0]?.timeout_count || "0") /
                parseInt(completionMetrics[0]?.completed_count || "1")) *
              100
            : 0,
      },
      bidDistribution: bidDistribution.map((d) => ({
        bidCount: parseInt(d.bid_count as unknown as string),
        auctionCount: parseInt(d.auction_count as unknown as string),
      })),
      hourlyVolume: hourlyVolume.map((h) => ({
        hour: h.hour,
        auctionCount: parseInt(h.auction_count as unknown as string),
        completedCount: parseInt(h.completed_count as unknown as string),
        avgDuration: parseFloat(h.avg_duration as unknown as string),
        avgBids: parseFloat(h.avg_bids as unknown as string),
      })),
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance metrics" },
      { status: 500 }
    );
  }
}
