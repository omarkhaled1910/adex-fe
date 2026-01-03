import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import crypto from "crypto";

// Demo publisher ID (replace with actual auth middleware)
const DEMO_PUBLISHER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

async function getPublisherIdFromRequest(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return DEMO_PUBLISHER_ID; // Demo mode
  }

  const apiKey = authHeader.substring(7);
  const result = await query("SELECT id FROM publishers WHERE api_key = $1", [apiKey]);
  return result.length > 0 ? result[0].id : null;
}

// GET /api/publisher/me - Get current publisher info
export async function GET(request: NextRequest) {
  try {
    const publisherId = await getPublisherIdFromRequest(request);

    if (!publisherId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const publishers = await query(
      `SELECT id, company_name, domain, email, wallet_address, status, tier,
              total_earnings, pending_earnings, withdrawn_earnings,
              domain_verified, verification_token, verified_at,
              website_category, monthly_pageviews, created_at, updated_at,
              api_key
       FROM publishers WHERE id = $1`,
      [publisherId]
    );

    if (publishers.length === 0) {
      return NextResponse.json({ error: "Publisher not found" }, { status: 404 });
    }

    return NextResponse.json({ publisher: publishers[0] });
  } catch (error) {
    console.error("Get publisher error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
