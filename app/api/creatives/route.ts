import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// Demo advertiser ID (in production, this would come from auth)
const DEMO_ADVERTISER_ID = "ff2c0776-a69d-4b79-9c29-8bf722d2719e";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";
    const campaign_id = searchParams.get("campaign_id");

    let sql = `
      SELECT 
        ac.id, ac.campaign_id, ac.name, ac.format, ac.headline, 
        ac.description, ac.cta_text, ac.landing_url, ac.width, ac.height,
        ac.review_status, ac.status, ac.impressions, ac.clicks, ac.ctr,
        ac.assets, ac.created_at, ac.updated_at,
        c.name as campaign_name
      FROM ad_creatives ac
      JOIN campaigns c ON ac.campaign_id = c.id
      WHERE c.advertiser_id = $1
    `;
    const params: any[] = [DEMO_ADVERTISER_ID];

    if (campaign_id) {
      sql += ` AND ac.campaign_id = $2`;
      params.push(campaign_id);
    }

    sql += ` ORDER BY ac.created_at DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const creatives = await query(sql, params);
    return NextResponse.json(creatives);
  } catch (error: any) {
    console.error("Error fetching creatives:", error);
    return NextResponse.json(
      { message: "Failed to fetch creatives", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      campaign_id,
      name,
      format,
      headline,
      description,
      cta_text,
      landing_url,
      width,
      height,
      assets,
    } = body;

    // Validation
    if (!campaign_id || !format || !landing_url) {
      return NextResponse.json(
        { message: "Campaign ID, format, and landing URL are required" },
        { status: 400 }
      );
    }

    // Verify campaign belongs to advertiser
    const campaignCheck = await query(
      "SELECT id FROM campaigns WHERE id = $1 AND advertiser_id = $2",
      [campaign_id, DEMO_ADVERTISER_ID]
    );

    if (campaignCheck.length === 0) {
      return NextResponse.json(
        { message: "Campaign not found or unauthorized" },
        { status: 404 }
      );
    }

    const sql = `
      INSERT INTO ad_creatives (
        campaign_id, name, format, headline, description, 
        cta_text, landing_url, width, height, assets,
        review_status, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', 'active'
      )
      RETURNING *
    `;

    const params = [
      campaign_id,
      name || null,
      format,
      headline || null,
      description || null,
      cta_text || null,
      landing_url,
      width || null,
      height || null,
      JSON.stringify(assets || {}),
    ];

    const result = await query(sql, params);
    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    console.error("Error creating creative:", error);
    return NextResponse.json(
      { message: "Failed to create creative", error: error.message },
      { status: 500 }
    );
  }
}
