/**
 * SDK Types and Interfaces
 */

/**
 * User context for auction targeting
 */
export interface UserContext {
  countryCode?: string;
  device?: string;
  os?: string;
  browser?: string;
  userAgent?: string;
  ipAddress?: string;
  fingerprint?: string;
}

/**
 * Options for creating an auction
 */
export interface AuctionOptions {
  /**
   * The ad slot type (e.g., 'banner', 'video_pre_roll', 'sidebar')
   * Uses pre-configured ad slot ID from publisher config
   */
  adSlotType: string;

  /**
   * Optional floor price for the auction
   * If not provided, uses the default floor price
   */
  floorPrice?: number;

  /**
   * Optional user context
   * If not provided, SDK will auto-detect from browser
   */
  userContext?: UserContext;

  /**
   * Override publisher ID (for testing/dynamic use)
   * If not provided, uses the SDK's configured publisher ID
   */
  publisherId?: string;

  /**
   * Override publisher domain (for testing/dynamic use)
   * If not provided, uses the SDK's configured domain
   */
  domain?: string;

  /**
   * Override ad slot ID (for testing/dynamic use)
   * If not provided, uses the SDK's configured ad slot ID for the slot type
   */
  adSlotId?: string;
}

/**
 * Response from auction creation
 */
export interface AuctionResponse {
  auctionId: string;
  status: string;
  createdAt: number;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Ad creative data returned in auction result
 */
export interface AuctionAd {
  html: string;
  clickUrl?: string;
}

/**
 * Auction result from long-polling endpoint
 */
export interface AuctionResult {
  status: "finished" | "timeout" | "error";
  ad?: { html: string; clickUrl?: string };
  price?: number;
}

/**
 * Extended auction response with result
 */
export interface AuctionResponseWithResult extends AuctionResponse {
  result?: AuctionResult;
}

/**
 * Options for fetchAuctionResult
 */
export interface FetchResultOptions {
  maxWaitTime?: number; // Default: 300ms
}

/**
 * Publisher configuration (embedded in SDK build)
 */
export interface PublisherConfig {
  id: string;
  domain: string;
  defaultFloorPrice?: number;
  adSlots: Record<string, string>; // slot type -> slot ID
}

/**
 * SDK Configuration
 */
export interface AdExSDKConfig {
  /**
   * API endpoint for auction creation
   * Defaults to http://localhost:3003/api/auctions
   */
  apiUrl?: string;

  /**
   * Timeout for requests in milliseconds
   * Defaults to 5000
   */
  timeout?: number;

  /**
   * Enable debug logging
   * Defaults to false
   */
  debug?: boolean;

  /**
   * Publisher ID (for dynamic/override use)
   * If provided, overrides the embedded publisher ID
   */
  publisherId?: string;

  /**
   * Publisher domain (for dynamic/override use)
   * If provided, overrides the embedded domain
   */
  domain?: string;

  /**
   * Ad slot mapping (for dynamic/override use)
   * If provided, overrides the embedded ad slot IDs
   */
  adSlots?: Record<string, string>;

  /**
   * CSS selector for element to watch
   * When element enters viewport, auction is triggered automatically
   */
  selector?: string;

  /**
   * Intersection Observer options
   */
  observer?: {
    root?: Element;
    rootMargin?: string;
    threshold?: number | number[];
  };
}

/**
 * HTTP Request to create an auction
 */
interface CreateAuctionHttpRequest {
  publisherId: string;
  domain?: string;
  adSlotId: string;
  adSlotType?: string;
  floorPrice?: number;
  userContext?: UserContext;
}
