/**
 * AdEx Browser SDK
 *
 * A browser SDK for creating ad auctions on the AdEx platform.
 *
 * @example
 * ```typescript
 * import { AdExClient } from '@adexch/sdk';
 *
 * const client = new AdExClient({ debug: true });
 * const result = await client.createAuction({ adSlotType: 'banner' });
 * console.log(result.auctionId);
 * ```
 *
 * @example Script tag usage:
 * ```html
 * <script src="https://cdn.adexch.com/sdk/v1/adex-sdk.js"></script>
 * <script>
 *   const result = await AdExSDK.createAuction('banner');
 *   console.log(result.auctionId);
 * </script>
 * ```
 */

// Main client class
export { AdExClient, createAuction } from './AdExClient';

// Types
export type {
  PublisherConfig,
  AdExSDKConfig,
  AuctionOptions,
  AuctionResponse,
  AuctionResponseWithResult,
  AuctionResult,
  AuctionAd,
  FetchResultOptions,
  UserContext,
} from './types';

// Config constants
export { PUBLISHER_CONFIG, DEFAULT_API_URL, DEFAULT_TIMEOUT } from './config';

// Version
export const VERSION = '1.0.0';
