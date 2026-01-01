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
        id, name, status, total_budget, daily_budget, spent_amount, 
        max_bid, bid_strategy, target_geos, target_devices, target_os, 
        target_browsers, start_date, end_date, max_impressions_per_user,
        max_impressions_per_day, active_hours, active_days,
        impressions_served, clicks, avg_ctr, created_at, updated_at
      FROM campaigns
      WHERE id = $1 AND advertiser_id = $2
    `;

    const campaigns = await query(sql, [id, DEMO_ADVERTISER_ID]);

    if (campaigns.length === 0) {
      return NextResponse.json(
        { message: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(campaigns[0]);
  } catch (error: any) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { message: "Failed to fetch campaign", error: error.message },
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

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = [
      "name",
      "total_budget",
      "daily_budget",
      "max_bid",
      "bid_strategy",
      "start_date",
      "end_date",
      "target_geos",
      "target_devices",
      "target_os",
      "target_browsers",
      "max_impressions_per_user",
      "max_impressions_per_day",
      "active_hours",
      "active_days",
      "status",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(body[field]);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { message: "No fields to update" },
        { status: 400 }
      );
    }

    // Add id and advertiser_id to values
    values.push(id);
    values.push(DEMO_ADVERTISER_ID);

    const sql = `
      UPDATE campaigns
      SET ${updates.join(", ")}, updated_at = NOW()
      WHERE id = $${paramIndex} AND advertiser_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await query(sql, values);

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { message: "Failed to update campaign", error: error.message },
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

    const sql = `
      DELETE FROM campaigns
      WHERE id = $1 AND advertiser_id = $2
      RETURNING id
    `;

    const result = await query(sql, [id, DEMO_ADVERTISER_ID]);

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Campaign deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { message: "Failed to delete campaign", error: error.message },
      { status: 500 }
    );
  }
}
