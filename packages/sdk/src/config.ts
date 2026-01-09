/**
 * Publisher Configuration
 *
 * This file contains the publisher's embedded credentials.
 * Each SDK build is customized for a specific publisher.
 *
 * During the build process, these values are replaced with the actual
 * publisher's credentials from the database.
 */

import type { PublisherConfig } from "./types";

/**
 * Embedded publisher configuration
 *
 * BUILD SYSTEM: Replace these placeholder values with actual publisher data
 */
export const PUBLISHER_CONFIG: PublisherConfig = {
  // Publisher UUID from database
  id: '62c51d2b-4523-40b9-a6fb-ae4dd50fbf7b"',

  // Publisher's registered domain
  domain: "medium.com",

  // Default floor price (optional)
  defaultFloorPrice: 0.01,

  // Ad slot configurations
  // Maps slot type names to their UUIDs
  // Can be overridden at runtime via client config
  adSlots: {},
};

/**
 * Default API endpoint
 */
export const DEFAULT_API_URL = "http://localhost:3003/api/auctions";

/**
 * Default request timeout (milliseconds)
 */
export const DEFAULT_TIMEOUT = 5000;
