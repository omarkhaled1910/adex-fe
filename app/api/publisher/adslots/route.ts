import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { DEMO_PUBLISHER_ID } from "@/lib/config";

async function getPublisherIdFromRequest(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return DEMO_PUBLISHER_ID;
  }
  const apiKey = authHeader.substring(7);
  const result = await query("SELECT id FROM publishers WHERE api_key = $1", [apiKey]);
  return result.length > 0 ? result[0].id : DEMO_PUBLISHER_ID;
}

// GET /api/publisher/adslots - Get all ad slots for current publisher
export async function GET(request: NextRequest) {
  try {
    const publisherId = await getPublisherIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let queryText = `
      SELECT id, publisher_id, slot_name, slot_type, width, height, floor_price,
             impressions_served, clicks, total_revenue, status, created_at, updated_at
      FROM ad_slots
      WHERE publisher_id = $1
    `;
    const params: any[] = [publisherId];

    if (status) {
      queryText += " AND status = $2";
      params.push(status);
    }

    queryText += " ORDER BY created_at DESC";

    const adSlots = await query(queryText, params);

    return NextResponse.json({ ad_slots: adSlots });
  } catch (error) {
    console.error("Get ad slots error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/publisher/adslots - Create a new ad slot
export async function POST(request: NextRequest) {
  try {
    const publisherId = await getPublisherIdFromRequest(request);
    const body = await request.json();
    const {
      slot_name,
      slot_type,
      width,
      height,
      floor_price,
    } = body;

    // Validation
    if (!slot_name || !slot_type) {
      return NextResponse.json(
        { error: "slot_name and slot_type are required" },
        { status: 400 }
      );
    }

    const validTypes = ["banner", "video", "native", "interstitial"];
    if (!validTypes.includes(slot_type)) {
      return NextResponse.json(
        { error: "Invalid slot_type" },
        { status: 400 }
      );
    }

    // Check if slot name already exists for this publisher
    const existing = await query(
      `SELECT id FROM ad_slots WHERE publisher_id = $1 AND slot_name = $2`,
      [publisherId, slot_name]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Ad slot with this name already exists" },
        { status: 409 }
      );
    }

    // Create ad slot
    const result = await query(
      `INSERT INTO ad_slots (publisher_id, slot_name, slot_type, width, height, floor_price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [publisherId, slot_name, slot_type, width || null, height || null, floor_price || 0.01, "active"]
    );

    return NextResponse.json(
      { ad_slot: result[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create ad slot error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
