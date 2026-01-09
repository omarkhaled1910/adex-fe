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

// GET /api/publisher/adslots/[id] - Get specific ad slot
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const publisherId = await getPublisherIdFromRequest(request);
    const { id } = await params;

    const result = await query(
      `SELECT * FROM ad_slots WHERE id = $1 AND publisher_id = $2`,
      [id, publisherId]
    );

    if (result.length === 0) {
      return NextResponse.json({ error: "Ad slot not found" }, { status: 404 });
    }

    return NextResponse.json({ ad_slot: result[0] });
  } catch (error) {
    console.error("Get ad slot error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/publisher/adslots/[id] - Update ad slot
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const publisherId = await getPublisherIdFromRequest(request);
    const { id } = await params;
    const body = await request.json();
    const { floor_price, status } = body;

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (floor_price !== undefined) {
      updates.push(`floor_price = $${paramIndex++}`);
      values.push(floor_price);
    }

    if (status !== undefined) {
      const validStatuses = ["active", "paused", "archived"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    updates.push(`updated_at = NOW()`);
    values.push(id, publisherId);

    const result = await query(
      `UPDATE ad_slots
       SET ${updates.join(", ")}
       WHERE id = $${paramIndex++} AND publisher_id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.length === 0) {
      return NextResponse.json({ error: "Ad slot not found" }, { status: 404 });
    }

    return NextResponse.json({ ad_slot: result[0] });
  } catch (error) {
    console.error("Update ad slot error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
