import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { randomBytes } from "crypto";
import crypto from "crypto";

// POST /api/publisher/register - Register a new publisher
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_name,
      domain,
      email,
      wallet_address,
      website_category,
      monthly_pageviews,
    } = body;

    // Validation
    if (!company_name || !domain || !email || !wallet_address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if domain or email already exists
    const existing = await query(
      `SELECT id, domain, email FROM publishers WHERE domain = $1 OR email = $2`,
      [domain, email]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Domain or email already registered" },
        { status: 409 }
      );
    }

    // Generate API key and secret
    const api_key = `pk_${randomBytes(24).toString("hex")}`;
    const api_secret = randomBytes(32).toString("hex");
    const api_secret_hash = crypto
      .createHash("sha256")
      .update(api_secret)
      .digest("hex");

    // Generate verification token
    const verification_token = randomBytes(16).toString("hex");

    // Insert new publisher
    const result = await query(
      `INSERT INTO publishers (
        company_name, domain, email, wallet_address, api_key, api_secret_hash,
        website_category, monthly_pageviews, verification_token, status, tier
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, company_name, domain, email, api_key, status, tier, verification_token`,
      [
        company_name,
        domain,
        email,
        wallet_address,
        api_key,
        api_secret_hash,
        website_category || null,
        monthly_pageviews || null,
        verification_token,
        "pending",
        "standard",
      ]
    );

    const publisher = result[0];

    return NextResponse.json(
      {
        message: "Account created. Verify your domain to activate.",
        publisher: {
          id: publisher.id,
          company_name: publisher.company_name,
          domain: publisher.domain,
          api_key: publisher.api_key,
          verification_token: publisher.verification_token,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
