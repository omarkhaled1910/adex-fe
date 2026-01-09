const io = require("socket.io-client");

const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:3003";
// ============================================================================
// STATIC IDs - Replace these with actual UUIDs from your database
// ============================================================================
// Query: SELECT id, domain FROM publishers;
// Query: SELECT id, slot_name FROM ad_slots;

// Static Publisher ID (Reddit example - replace with actual UUID from your DB)
const STATIC_PUBLISHER_ID =
  process.env.PUBLISHER_ID || "4a51b363-b808-4cc9-bb2f-88adaeaec862";

// Static Publisher Domain (matches the publisherId above)
// Query: SELECT domain FROM publishers WHERE id = '<your publisher_id>';
const STATIC_PUBLISHER_DOMAIN =
  process.env.PUBLISHER_DOMAIN || "reddit.com";

// Static Ad Slot ID (replace with actual UUID from your DB)
// Query: SELECT id, slot_name FROM ad_slots WHERE publisher_id = '<your publisher_id>';
const STATIC_AD_SLOT_ID =
  process.env.AD_SLOT_ID || "24a73299-230a-4634-a3f2-d2b69355d599";

// Ad slot type that matches the ad_slot_id you selected
// Note: Campaigns target specific slot types like "video_pre_roll", "banner_top", etc.
const STATIC_AD_SLOT_TYPE = process.env.AD_SLOT_TYPE || "video_pre_roll";

const publishers = [
  "cnn.com",
  "nytimes.com",
  "techcrunch.com",
  "reddit.com",
  "medium.com",
];
const adSlots = [
  "banner_top",
  "sidebar_right",
  "in_article_video",
  "native_feed",
  "interstitial",
  "video_pre_roll",
];
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomFloorPrice() {
  return (Math.random() * (0.04 - 0.015) + 0.015).toFixed(4);
}

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("✅ Connected to server as simulated user.");

  setInterval(() => {
    const auctionData = {
      publisherId: STATIC_PUBLISHER_ID || getRandomElement(publishers),
      domain: STATIC_PUBLISHER_DOMAIN || getRandomElement(publishers),
      adSlotId: STATIC_AD_SLOT_ID,
      adSlotType: STATIC_AD_SLOT_TYPE,
      floorPrice: parseFloat(getRandomFloorPrice()),
      userContext: {
        countryCode: getRandomElement(["US", "UK", "CA", "DE", "FR", "JP"]),
        device: getRandomElement(["desktop", "mobile", "tablet"]),
        os: getRandomElement(["Windows", "macOS", "iOS", "Android"]),
        browser: getRandomElement(["Chrome", "Firefox", "Safari"]),
      },
    };
    socket.emit("create_auction", auctionData);
    console.log(
      `🚀 Emitted create_auction: publisher=${STATIC_PUBLISHER_ID}, ` +
        `domain=${STATIC_PUBLISHER_DOMAIN}, ` +
        `slot=${STATIC_AD_SLOT_TYPE}, floor=$${auctionData.floorPrice}`
    );
  }, Math.random() * (8000 - 2000) + 2000);
});

socket.on("disconnect", () => {
  console.log("🔌 Disconnected from server.");
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
});
