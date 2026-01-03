import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "all";
    const limit = parseInt(searchParams.get("limit") || "50");
    const hours = parseInt(searchParams.get("hours") || "24");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build WHERE clause
    let whereClause = "WHERE a.created_at > NOW() - INTERVAL '1 hour' * $1";
    const params: any[] = [hours];

    if (status !== "all") {
      whereClause += ` AND a.status = $${params.length + 1}`;
      params.push(status);
    }

    // Get auctions with publisher info and bid counts
    const auctions = await query(
      `
      SELECT
        a.id,
        a.publisher_id,
        a.ad_slot_id,
        a.floor_price,
        a.status,
        a.auction_type,
        a.started_at,
        a.closed_at,
        a.duration_ms,
        a.total_bids,
        a.expected_bids,
        a.bid_ratio,
        a.winning_amount,
        a.winning_price,
        a.completion_reason,
        a.winner_campaign_id,
        a.winner_advertiser_id,
        a.user_context,
        a.created_at,
        p.domain,
        p.company_name as publisher_name,
        COUNT(b.id) as bid_count,
        MAX(b.amount) as highest_bid,
        AVG(b.response_time_ms) as avg_response_time_ms
      FROM auctions a
      LEFT JOIN publishers p ON a.publisher_id = p.id
      LEFT JOIN bids b ON a.id = b.auction_id
      ${whereClause}
      GROUP BY a.id, p.domain, p.company_name
      ORDER BY a.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `,
      [...params, limit, offset]
    );

    // Get total count for pagination
    const countResult = await query(
      `
      SELECT COUNT(DISTINCT a.id) as total
      FROM auctions a
      ${whereClause}
      `,
      params
    );

    return NextResponse.json({
      auctions,
      total: parseInt(countResult[0]?.total || "0"),
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching auctions:", error);
    return NextResponse.json(
      { error: "Failed to fetch auctions" },
      { status: 500 }
    );
  }
}
