import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// POST /api/publisher/[id]/verify-domain - Verify domain ownership
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get publisher with verification token
    const publishers = await query(
      `SELECT id, domain, verification_token, domain_verified FROM publishers WHERE id = $1`,
      [id]
    );

    if (publishers.length === 0) {
      return NextResponse.json({ error: "Publisher not found" }, { status: 404 });
    }

    const publisher = publishers[0];

    if (publisher.domain_verified) {
      return NextResponse.json(
        {
          message: "Domain already verified",
          verified_at: publisher.verified_at,
        },
        { status: 200 }
      );
    }

    // In production, this would make actual DNS/HTTP checks
    // For demo purposes, we'll simulate verification
    const isVerified = Math.random() > 0.3; // 70% success rate for demo

    if (isVerified) {
      await query(
        `UPDATE publishers
         SET domain_verified = true, verified_at = NOW(), status = 'active'
         WHERE id = $1`,
        [id]
      );

      return NextResponse.json(
        {
          message: "Domain verified successfully",
          verified_at: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: "Verification failed. Please ensure you have added the DNS TXT record or meta tag.",
        verified: false,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Domain verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/publisher/[id]/verify-domain - Get verification status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const publishers = await query(
      `SELECT id, domain, domain_verified, verified_at, verification_token FROM publishers WHERE id = $1`,
      [id]
    );

    if (publishers.length === 0) {
      return NextResponse.json({ error: "Publisher not found" }, { status: 404 });
    }

    const publisher = publishers[0];

    return NextResponse.json({
      domain: publisher.domain,
      domain_verified: publisher.domain_verified,
      verified_at: publisher.verified_at,
      verification_token: publisher.verification_token,
    });
  } catch (error) {
    console.error("Get verification status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
