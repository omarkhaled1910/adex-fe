# @adexch/sdk

A browser SDK for creating ad auctions on the AdEx platform. This SDK enables publishers to integrate real-time ad auctions into their websites with minimal setup.

## Features

- **Simple API** - Create auctions with a single function call
- **Auto-detection** - Automatically detects user context (device, OS, browser, country)
- **Viewport Triggering** - Automatically trigger auctions when ad containers enter the viewport using Intersection Observer
- **TypeScript Support** - Full TypeScript definitions included
- **Multiple Installation Methods** - Use via npm or script tag
- **Configurable** - Override publisher settings at runtime for testing or dynamic scenarios
- **Debug Mode** - Built-in logging for development and troubleshooting

## Installation

### Via npm

```bash
npm install @adexch/sdk
```

### Via CDN

```html
<script src="https://cdn.adexch.com/sdk/v1/adex-sdk.js"></script>
```

## Quick Start

### ES Modules / TypeScript

```typescript
import { AdExClient } from '@adexch/sdk';

// Create a client instance
const client = new AdExClient({ debug: true });

// Create an auction
const result = await client.createAuction({ adSlotType: 'banner' });

if (result.status === 'active') {
  console.log('Auction created:', result.auctionId);
}
```

### Script Tag

```html
<script src="https://cdn.adexch.com/sdk/v1/adex-sdk.js"></script>
<script>
  // Quick one-shot auction
  const result = await AdExSDK.createAuction('banner');
  console.log(result.auctionId);
</script>
```

## Usage

### Client Configuration

```typescript
const client = new AdExClient({
  // API endpoint (defaults to standard AdEx API)
  apiUrl: 'https://api.adexch.com/auctions',

  // Request timeout in milliseconds (default: 5000)
  timeout: 10000,

  // Enable debug logging
  debug: true,

  // Override publisher settings (for testing/dynamic use)
  publisherId: 'custom-publisher-id',
  domain: 'example.com',
  adSlots: {
    banner: 'banner-slot-id',
    sidebar: 'sidebar-slot-id'
  }
});
```

### Creating Auctions

```typescript
// Basic auction using configured ad slots
const result = await client.createAuction({
  adSlotType: 'banner'
});

// Auction with custom floor price
const result = await client.createAuction({
  adSlotType: 'video_pre_roll',
  floorPrice: 0.50  // $0.50 CPM
});

// Auction with custom user context
const result = await client.createAuction({
  adSlotType: 'sidebar',
  userContext: {
    countryCode: 'US',
    device: 'mobile',
    os: 'iOS',
    browser: 'Safari'
  }
});

// Override publisher settings per request
const result = await client.createAuction({
  adSlotType: 'banner',
  publisherId: 'override-publisher-id',
  domain: 'override-domain.com',
  adSlotId: 'specific-slot-id'
});
```

### Viewport Triggering

Automatically trigger auctions when an ad container enters the viewport:

```typescript
const client = new AdExClient({
  selector: '#ad-container'
});

// Or manually start observing
client.observe(
  { adSlotType: 'banner' },
  '#ad-container'
);

// Customize Intersection Observer behavior
const client = new AdExClient({
  selector: '#ad-container',
  observer: {
    rootMargin: '100px',  // Trigger 100px before entering viewport
    threshold: 0.5        // Trigger when 50% visible
  }
});

// Stop observing
client.unobserve();

// Check if currently observing
if (client.isObserving()) {
  console.log('Observing for viewport entry');
}
```

### Helper Function

For quick one-off auctions without a client instance:

```typescript
import { createAuction } from '@adexch/sdk';

const result = await createAuction('banner', {
  floorPrice: 0.10,
  publisherId: 'custom-id'
});
```

## API Reference

### `AdExClient`

Main client class for creating auctions.

#### Constructor

```typescript
new AdExClient(config?: AdExSDKConfig)
```

#### Methods

| Method | Description |
|--------|-------------|
| `createAuction(options)` | Create a new auction |
| `observe(options, selector?)` | Start observing element for viewport entry |
| `unobserve()` | Stop observing |
| `isObserving()` | Check if currently observing |
| `getPublisherConfig()` | Get current publisher configuration |
| `setConfig(config)` | Update SDK configuration |

### Types

```typescript
interface AdExSDKConfig {
  apiUrl?: string;
  timeout?: number;
  debug?: boolean;
  publisherId?: string;
  domain?: string;
  adSlots?: Record<string, string>;
  selector?: string;
  observer?: {
    root?: Element;
    rootMargin?: string;
    threshold?: number | number[];
  };
}

interface AuctionOptions {
  adSlotType: string;
  floorPrice?: number;
  userContext?: UserContext;
  publisherId?: string;
  domain?: string;
  adSlotId?: string;
}

interface UserContext {
  countryCode?: string;
  device?: string;
  os?: string;
  browser?: string;
  userAgent?: string;
  ipAddress?: string;
  fingerprint?: string;
}

interface AuctionResponse {
  auctionId: string;
  status: string;
  createdAt: number;
  errorCode?: string;
  errorMessage?: string;
}
```

## Error Handling

```typescript
const result = await client.createAuction({ adSlotType: 'banner' });

if (result.status === 'rejected') {
  console.error('Auction failed:', result.errorCode, result.errorMessage);
}

// Common error codes:
// - INVALID_AD_SLOT_TYPE: Ad slot type not configured
// - NETWORK_ERROR: Request failed or timed out
```

## Building

```bash
# Install dependencies
npm install

# Build SDK
npm run build

# Watch mode for development
npm run build:watch
```

The build outputs:
- `dist/adex-sdk.umd.js` - UMD bundle for script tag usage
- `dist/adex-sdk.esm.js` - ESM bundle for npm usage
- `dist/index.d.ts` - TypeScript declarations

## License

UNLICENSED
