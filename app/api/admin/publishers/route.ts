import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "all";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sortBy = searchParams.get("sort") || "created_at";

    // Build WHERE clause
    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (status !== "all") {
      whereClause += ` AND p.status = $${params.length + 1}`;
      params.push(status);
    }

    // Build ORDER BY clause
    const validSortFields = [
      "created_at",
      "total_earnings",
      "auction_count",
      "domain",
      "company_name",
    ];
    const orderBy = validSortFields.includes(sortBy) ? sortBy : "created_at";
    const orderDirection = sortBy === "total_earnings" ? "DESC" : "DESC";

    // Get publishers with auction counts
    const publishers = await query(
      `
      SELECT
        p.id,
        p.domain,
        p.company_name,
        p.email,
        p.status,
        p.tier,
        p.total_earnings,
        p.pending_earnings,
        p.withdrawn_earnings,
        p.domain_verified,
        p.website_category,
        p.monthly_pageviews,
        p.created_at,
        p.updated_at,
        COUNT(DISTINCT a.id) as auction_count,
        COALESCE(SUM(a.winning_price), 0) as total_revenue_generated,
        AVG(a.duration_ms) FILTER (WHERE a.status = 'completed') as avg_auction_duration
      FROM publishers p
      LEFT JOIN auctions a ON p.id = a.publisher_id
        AND a.created_at > NOW() - INTERVAL '30 days'
      ${whereClause}
      GROUP BY p.id
      ORDER BY ${orderBy} ${orderDirection}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `
      SELECT COUNT(*) as total FROM publishers p
      ${whereClause}
      `,
      params
    );

    // Get summary stats
    const statsResult = await query(
      `
      SELECT
        COUNT(*) as total_publishers,
        COUNT(*) FILTER (WHERE status = 'active') as active_publishers,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_publishers,
        COUNT(*) FILTER (WHERE status = 'suspended') as suspended_publishers,
        COUNT(*) FILTER (WHERE domain_verified = true) as verified_publishers,
        SUM(total_earnings) as total_platform_earnings
      FROM publishers
      `
    );

    return NextResponse.json({
      publishers,
      total: parseInt(countResult[0]?.total || "0"),
      limit,
      offset,
      stats: {
        total: parseInt(statsResult[0]?.total_publishers || "0"),
        active: parseInt(statsResult[0]?.active_publishers || "0"),
        pending: parseInt(statsResult[0]?.pending_publishers || "0"),
        suspended: parseInt(statsResult[0]?.suspended_publishers || "0"),
        verified: parseInt(statsResult[0]?.verified_publishers || "0"),
        totalEarnings: parseFloat(statsResult[0]?.total_platform_earnings || "0"),
      },
    });
  } catch (error) {
    console.error("Error fetching publishers:", error);
    return NextResponse.json(
      { error: "Failed to fetch publishers" },
      { status: 500 }
    );
  }
}
