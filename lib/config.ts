// ============================================================================
// DEMO/TEST CONFIGURATION
// These IDs are used for development and testing purposes
// In production, these would come from authenticated user sessions
// ============================================================================

// Demo Advertiser - Amazon Advertising (has the most campaigns: 23, creatives: 74)
export const DEMO_ADVERTISER_ID =
  process.env.DEMO_ADVERTISER_ID || "0ce94775-5d5d-44ac-86ab-ec05b99b0aa5";

// Demo Publisher - Demo Publisher Inc (has 12 ad slots, premium tier)
export const DEMO_PUBLISHER_ID =
  process.env.DEMO_PUBLISHER_ID || "b0000001-0000-0000-0000-000000000001";

// Configuration for demo mode
export const DEMO_CONFIG = {
  // Enable demo mode (skip authentication)
  enabled: process.env.DEMO_MODE !== "false",

  // Demo advertiser settings
  advertiser: {
    id: DEMO_ADVERTISER_ID,
    email: "demo-advertiser@adexch.io",
    company: "Demo Advertiser Corp",
  },

  // Demo publisher settings
  publisher: {
    id: DEMO_PUBLISHER_ID,
    domain: "demo-publisher.com",
    company: "Demo Publisher Inc",
  },
};
