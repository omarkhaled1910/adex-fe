#!/usr/bin/env node

/**
 * gRPC Simulated User for Auction Creation
 *
 * This script replaces the Socket.IO-based simulated user with a gRPC client.
 * It simulates publishers creating auctions at random intervals.
 *
 * Usage:
 *   node scripts/simulated-user-grpc.js
 *
 * Environment variables:
 *   GRPC_URL - gRPC server address (default: localhost:50051)
 *   PUBLISHER_ID - Static publisher UUID (optional)
 *   PUBLISHER_DOMAIN - Static publisher domain (optional)
 *   AD_SLOT_ID - Static ad slot UUID (optional)
 *   AD_SLOT_TYPE - Static ad slot type (optional)
 */

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const GRPC_URL = process.env.GRPC_URL || 'localhost:50051';

// Static IDs - Replace with actual UUIDs from your database
// Query: SELECT id, domain FROM publishers;
const STATIC_PUBLISHER_ID =
  process.env.PUBLISHER_ID || '4a51b363-b808-4cc9-bb2f-88adaeaec862';

// Static Publisher Domain (matches the publisherId above)
// Query: SELECT domain FROM publishers WHERE id = '<your publisher_id>';
const STATIC_PUBLISHER_DOMAIN =
  process.env.PUBLISHER_DOMAIN || 'reddit.com';

// Static Ad Slot ID
// Query: SELECT id, slot_name FROM ad_slots WHERE publisher_id = '<your publisher_id>';
const STATIC_AD_SLOT_ID =
  process.env.AD_SLOT_ID || '24a73299-230a-4634-a3f2-d2b69355d599';

// Ad slot type
const STATIC_AD_SLOT_TYPE = process.env.AD_SLOT_TYPE || 'video_pre_roll';

// ============================================================================
// PROTO LOADING
// ============================================================================

const PROTO_PATH = path.join(__dirname, '../adex-server/src/grpc-proto/auction.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const auctionProto = grpc.loadPackageDefinition(packageDefinition).auction.v1;

// ============================================================================
// gRPC CLIENT SETUP
// ============================================================================

const client = new auctionProto.AuctionService(
  GRPC_URL,
  grpc.credentials.createInsecure(),
);

// ============================================================================
// AUCTION DATA GENERATION
// ============================================================================

const publishers = [
  'cnn.com',
  'nytimes.com',
  'techcrunch.com',
  'reddit.com',
  'medium.com',
];

const adSlots = [
  'banner_top',
  'sidebar_right',
  'in_article_video',
  'native_feed',
  'interstitial',
  'video_pre_roll',
];

const countries = ['US', 'UK', 'CA', 'DE', 'FR', 'JP'];
const devices = ['desktop', 'mobile', 'tablet'];
const oses = ['Windows', 'macOS', 'iOS', 'Android'];
const browsers = ['Chrome', 'Firefox', 'Safari'];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomFloorPrice() {
  return Math.random() * (0.04 - 0.015) + 0.015;
}

// ============================================================================
// AUCTION CREATION
// ============================================================================

let auctionCount = 0;
let errorCount = 0;

function createAuction() {
  const deadline = new Date();
  deadline.setSeconds(deadline.getSeconds() + 5); // 5 second deadline

  const request = {
    publisherId: STATIC_PUBLISHER_ID || getRandomElement(publishers),
    domain: STATIC_PUBLISHER_DOMAIN || getRandomElement(publishers),
    adSlotId: STATIC_AD_SLOT_ID,
    adSlotType: STATIC_AD_SLOT_TYPE,
    floorPrice: getRandomFloorPrice(),
    userContext: {
      countryCode: getRandomElement(countries),
      device: getRandomElement(devices),
      os: getRandomElement(oses),
      browser: getRandomElement(browsers),
    },
  };

  client.createAuction(request, { deadline }, (error, response) => {
    if (error) {
      errorCount++;
      console.error(`[${new Date().toISOString()}] gRPC Error [${errorCount}]: ${error.message}`);
      if (error.metadata) {
        console.error(`  Code: ${error.code}`);
        console.error(`  Details: ${error.details}`);
      }
      return;
    }

    auctionCount++;
    const auctionIdShort = response.auctionId
      ? response.auctionId.slice(0, 16)
      : 'unknown';
    const publisherIdShort = request.publisherId.slice(0, 8);

    console.log(
      `[${new Date().toISOString()}] gRPC Auction #${auctionCount}: ` +
        `ID=${auctionIdShort}... ` +
        `status=${response.status} ` +
        `publisher=${publisherIdShort}... ` +
        `slot=${request.adSlotType} ` +
        `floor=$${request.floorPrice.toFixed(4)}`
    );
  });
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

console.log('='.repeat(60));
console.log('gRPC Simulated User starting...');
console.log('='.repeat(60));
console.log(`Target: ${GRPC_URL}`);
console.log(`Publisher: ${STATIC_PUBLISHER_ID} (${STATIC_PUBLISHER_DOMAIN})`);
console.log(`Ad Slot: ${STATIC_AD_SLOT_ID} (${STATIC_AD_SLOT_TYPE})`);
console.log('='.repeat(60));

// Start with interval 2-8 seconds (randomized)
const interval = Math.random() * (8000 - 2000) + 2000;
console.log(`Emitting auctions every ~${Math.floor(interval)}ms\n`);

// Send first auction immediately
createAuction();

// Then send auctions at random intervals
setInterval(createAuction, interval);

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

process.on('SIGINT', () => {
  console.log('\n' + '='.repeat(60));
  console.log(`gRPC Simulated User shutting down...`);
  console.log(`Total auctions created: ${auctionCount}`);
  console.log(`Total errors: ${errorCount}`);
  console.log('='.repeat(60));
  process.exit(0);
});
