import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// Demo advertiser ID (in production, this would come from auth)
const DEMO_ADVERTISER_ID = "ff2c0776-a69d-4b79-9c29-8bf722d2719e";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const sql = `
      SELECT 
        ac.id, ac.campaign_id, ac.name, ac.format, ac.headline, 
        ac.description, ac.cta_text, ac.landing_url, ac.width, ac.height,
        ac.review_status, ac.status, ac.impressions, ac.clicks, ac.ctr,
        ac.assets, ac.created_at, ac.updated_at,
        c.name as campaign_name
      FROM ad_creatives ac
      JOIN campaigns c ON ac.campaign_id = c.id
      WHERE ac.id = $1 AND c.advertiser_id = $2
    `;

    const creatives = await query(sql, [id, DEMO_ADVERTISER_ID]);

    if (creatives.length === 0) {
      return NextResponse.json(
        { message: "Creative not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(creatives[0]);
  } catch (error: any) {
    console.error("Error fetching creative:", error);
    return NextResponse.json(
      { message: "Failed to fetch creative", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verify creative belongs to advertiser
    const checkSql = `
      SELECT ac.id FROM ad_creatives ac
      JOIN campaigns c ON ac.campaign_id = c.id
      WHERE ac.id = $1 AND c.advertiser_id = $2
    `;
    const checkResult = await query(checkSql, [id, DEMO_ADVERTISER_ID]);

    if (checkResult.length === 0) {
      return NextResponse.json(
        { message: "Creative not found or unauthorized" },
        { status: 404 }
      );
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = [
      "name",
      "format",
      "headline",
      "description",
      "cta_text",
      "landing_url",
      "width",
      "height",
      "assets",
      "status",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "assets") {
          updates.push(`${field} = $${paramIndex}`);
          values.push(JSON.stringify(body[field]));
        } else {
          updates.push(`${field} = $${paramIndex}`);
          values.push(body[field]);
        }
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { message: "No fields to update" },
        { status: 400 }
      );
    }

    values.push(id);

    const sql = `
      UPDATE ad_creatives
      SET ${updates.join(", ")}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(sql, values);

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Creative not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("Error updating creative:", error);
    return NextResponse.json(
      { message: "Failed to update creative", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify creative belongs to advertiser before deleting
    const checkSql = `
      SELECT ac.id FROM ad_creatives ac
      JOIN campaigns c ON ac.campaign_id = c.id
      WHERE ac.id = $1 AND c.advertiser_id = $2
    `;
    const checkResult = await query(checkSql, [id, DEMO_ADVERTISER_ID]);

    if (checkResult.length === 0) {
      return NextResponse.json(
        { message: "Creative not found or unauthorized" },
        { status: 404 }
      );
    }

    const sql = `DELETE FROM ad_creatives WHERE id = $1 RETURNING id`;
    const result = await query(sql, [id]);

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Creative not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Creative deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting creative:", error);
    return NextResponse.json(
      { message: "Failed to delete creative", error: error.message },
      { status: 500 }
    );
  }
}
