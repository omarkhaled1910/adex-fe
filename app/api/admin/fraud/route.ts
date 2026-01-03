import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "all";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build WHERE clause
    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (status !== "all") {
      whereClause += ` AND fi.status = $${params.length + 1}`;
      params.push(status);
    }

    // Get fraud incidents with publisher and advertiser info
    const incidents = await query(
      `
      SELECT
        fi.id,
        fi.fraud_type,
        fi.confidence_score,
        fi.status,
        fi.created_at,
        fi.evidence,
        fi.action_taken,
        fi.refund_amount,
        p.domain as publisher_domain,
        p.company_name as publisher_name,
        adv.company_name as advertiser_name,
        adv.wallet_address as advertiser_wallet,
        a.id as auction_id,
        i.user_fingerprint,
        i.ip_address,
        i.country_code
      FROM fraud_incidents fi
      LEFT JOIN publishers p ON fi.publisher_id = p.id
      LEFT JOIN advertisers adv ON fi.advertiser_id = adv.id
      LEFT JOIN auctions a ON fi.auction_id = a.id
      LEFT JOIN impressions i ON fi.impression_id = i.id
      ${whereClause}
      ORDER BY fi.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `
      SELECT COUNT(*) as total FROM fraud_incidents fi
      ${whereClause}
      `,
      params
    );

    // Get summary stats
    const statsResult = await query(
      `
      SELECT
        COUNT(*) as total_incidents,
        COUNT(*) FILTER (WHERE status = 'open') as open_incidents,
        COUNT(*) FILTER (WHERE status = 'reviewing') as reviewing_incidents,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_incidents,
        COUNT(*) FILTER (WHERE status = 'dismissed') as dismissed_incidents,
        AVG(confidence_score) as avg_confidence,
        SUM(refund_amount) as total_refunds
      FROM fraud_incidents
      `
    );

    // Get fraud type breakdown
    const typeBreakdown = await query(
      `
      SELECT
        fraud_type,
        COUNT(*) as count,
        AVG(confidence_score) as avg_confidence
      FROM fraud_incidents
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY fraud_type
      ORDER BY count DESC
      `
    );

    return NextResponse.json({
      incidents: incidents.map((i: any) => ({
        id: i.id,
        fraudType: i.fraud_type,
        confidenceScore: parseFloat(i.confidence_score),
        status: i.status,
        createdAt: i.created_at,
        evidence: i.evidence,
        actionTaken: i.action_taken,
        refundAmount: parseFloat(i.refund_amount || "0"),
        publisher: {
          domain: i.publisher_domain,
          companyName: i.publisher_name,
        },
        advertiser: {
          companyName: i.advertiser_name,
          walletAddress: i.advertiser_wallet,
        },
        auctionId: i.auction_id,
        impression: {
          fingerprint: i.user_fingerprint,
          ipAddress: i.ip_address,
          countryCode: i.country_code,
        },
      })),
      total: parseInt(countResult[0]?.total || "0"),
      limit,
      offset,
      stats: {
        total: parseInt(statsResult[0]?.total_incidents || "0"),
        open: parseInt(statsResult[0]?.open_incidents || "0"),
        reviewing: parseInt(statsResult[0]?.reviewing_incidents || "0"),
        resolved: parseInt(statsResult[0]?.resolved_incidents || "0"),
        dismissed: parseInt(statsResult[0]?.dismissed_incidents || "0"),
        avgConfidence: parseFloat(statsResult[0]?.avg_confidence || "0"),
        totalRefunds: parseFloat(statsResult[0]?.total_refunds || "0"),
      },
      typeBreakdown: typeBreakdown.map((t: any) => ({
        fraudType: t.fraud_type,
        count: parseInt(t.count),
        avgConfidence: parseFloat(t.avg_confidence),
      })),
    });
  } catch (error) {
    console.error("Error fetching fraud incidents:", error);
    return NextResponse.json(
      { error: "Failed to fetch fraud incidents" },
      { status: 500 }
    );
  }
}
