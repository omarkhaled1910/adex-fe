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
      whereClause += ` AND adv.status = $${params.length + 1}`;
      params.push(status);
    }

    // Build ORDER BY clause
    const validSortFields = [
      "created_at",
      "total_spent",
      "campaign_count",
      "company_name",
      "on_chain_balance",
    ];
    const orderBy = validSortFields.includes(sortBy) ? sortBy : "created_at";
    const orderDirection = "DESC";

    // Get advertisers with campaign counts
    const advertisers = await query(
      `
      SELECT
        adv.id,
        adv.wallet_address,
        adv.company_name,
        adv.email,
        adv.status,
        adv.on_chain_balance,
        adv.reserved_balance,
        adv.total_spent,
        adv.kyc_status,
        adv.created_at,
        adv.updated_at,
        COUNT(DISTINCT c.id) as campaign_count,
        COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'active') as active_campaigns_count,
        SUM(c.spent_amount) as campaign_spend,
        SUM(c.impressions_won) as total_impressions,
        AVG(c.avg_cpm) as avg_cpm,
        AVG(c.avg_cpc) as avg_cpc
      FROM advertisers adv
      LEFT JOIN campaigns c ON adv.id = c.advertiser_id
      ${whereClause}
      GROUP BY adv.id
      ORDER BY ${orderBy} ${orderDirection}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `
      SELECT COUNT(*) as total FROM advertisers adv
      ${whereClause}
      `,
      params
    );

    // Get summary stats
    const statsResult = await query(
      `
      SELECT
        COUNT(*) as total_advertisers,
        COUNT(*) FILTER (WHERE status = 'active') as active_advertisers,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_advertisers,
        COUNT(*) FILTER (WHERE kyc_status = 'approved') as kyc_approved,
        COUNT(*) FILTER (WHERE kyc_status = 'pending') as kyc_pending,
        SUM(total_spent) as total_platform_spend,
        SUM(on_chain_balance) as total_balances
      FROM advertisers
      `
    );

    return NextResponse.json({
      advertisers,
      total: parseInt(countResult[0]?.total || "0"),
      limit,
      offset,
      stats: {
        total: parseInt(statsResult[0]?.total_advertisers || "0"),
        active: parseInt(statsResult[0]?.active_advertisers || "0"),
        pending: parseInt(statsResult[0]?.pending_advertisers || "0"),
        kycApproved: parseInt(statsResult[0]?.kyc_approved || "0"),
        kycPending: parseInt(statsResult[0]?.kyc_pending || "0"),
        totalSpend: parseFloat(statsResult[0]?.total_platform_spend || "0"),
        totalBalances: parseFloat(statsResult[0]?.total_balances || "0"),
      },
    });
  } catch (error) {
    console.error("Error fetching advertisers:", error);
    return NextResponse.json(
      { error: "Failed to fetch advertisers" },
      { status: 500 }
    );
  }
}
