import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { DEMO_ADVERTISER_ID } from "@/lib/config";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";
    const status = searchParams.get("status");

    let sql = `
      SELECT
        id, name, status, total_budget, daily_budget, spent_amount,
        max_bid, bid_strategy, target_geos, target_devices, target_os,
        target_browsers, target_categories, start_date, end_date, impressions_served,
        clicks, avg_ctr, created_at, updated_at
      FROM campaigns
      WHERE advertiser_id = $1
    `;
    const params: any[] = [DEMO_ADVERTISER_ID];

    if (status) {
      sql += ` AND status = $2`;
      params.push(status);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const campaigns = await query(sql, params);
    return NextResponse.json(campaigns);
  } catch (error: any) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { message: "Failed to fetch campaigns", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      total_budget,
      daily_budget,
      max_bid,
      bid_strategy,
      start_date,
      end_date,
      target_geos,
      target_devices,
      target_os,
      target_browsers,
      target_categories,
      max_impressions_per_user,
      max_impressions_per_day,
      active_hours,
      active_days,
      status,
    } = body;

    // Validation
    if (!name || !total_budget || !max_bid) {
      return NextResponse.json(
        { message: "Name, total budget, and max bid are required" },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO campaigns (
        advertiser_id, name, total_budget, daily_budget, max_bid,
        bid_strategy, start_date, end_date, target_geos, target_devices,
        target_os, target_browsers, target_categories, max_impressions_per_user,
        max_impressions_per_day, active_hours, active_days, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      )
      RETURNING *
    `;

    const params = [
      DEMO_ADVERTISER_ID,
      name,
      total_budget,
      daily_budget || null,
      max_bid,
      bid_strategy || "highest",
      start_date || new Date().toISOString(),
      end_date || null,
      target_geos?.length > 0 ? target_geos : null,
      target_devices?.length > 0 ? target_devices : null,
      target_os?.length > 0 ? target_os : null,
      target_browsers?.length > 0 ? target_browsers : null,
      target_categories?.length > 0 ? target_categories : null,
      max_impressions_per_user || null,
      max_impressions_per_day || null,
      active_hours?.length > 0 ? active_hours : null,
      active_days?.length > 0 ? active_days : null,
      status || "draft",
    ];

    const result = await query(sql, params);
    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { message: "Failed to create campaign", error: error.message },
      { status: 500 }
    );
  }
}
