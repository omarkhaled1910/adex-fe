import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "all";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const advertiserId = searchParams.get("advertiser_id");

    // Build WHERE clause
    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (status !== "all") {
      whereClause += ` AND c.status = $${params.length + 1}`;
      params.push(status);
    }

    if (advertiserId) {
      whereClause += ` AND c.advertiser_id = $${params.length + 1}`;
      params.push(advertiserId);
    }

    // Get campaigns with advertiser info
    const campaigns = await query(
      `
      SELECT
        c.id,
        c.advertiser_id,
        c.name,
        c.status,
        c.total_budget,
        c.daily_budget,
        c.spent_amount,
        c.max_bid,
        c.bid_strategy,
        c.start_date,
        c.end_date,
        c.impressions_won,
        c.impressions_served,
        c.clicks,
        c.conversions,
        c.avg_cpm,
        c.avg_cpc,
        c.avg_ctr,
        c.created_at,
        c.updated_at,
        adv.company_name as advertiser_name,
        adv.wallet_address,
        (c.total_budget - c.spent_amount) as remaining_budget,
        CASE
          WHEN c.total_budget > 0 THEN (c.spent_amount / c.total_budget) * 100
          ELSE 0
        END as budget_utilization_percent
      FROM campaigns c
      LEFT JOIN advertisers adv ON c.advertiser_id = adv.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `
      SELECT COUNT(*) as total FROM campaigns c
      ${whereClause}
      `,
      params
    );

    return NextResponse.json({
      campaigns,
      total: parseInt(countResult[0]?.total || "0"),
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}
