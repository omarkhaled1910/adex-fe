# AdExchange Advertiser Bot

AMQP-based advertiser bot that connects to RabbitMQ and participates in real-time ad auctions.

## Features

- **AMQP-based bidding** - Uses RabbitMQ instead of WebSocket for reliable message delivery
- **Database-driven** - Fetches campaigns and creatives from PostgreSQL database
- **Smart bidding strategies** - Supports highest, dynamic, target CPM, and second-price strategies
- **Targeting-aware** - Respects campaign targeting (geo, device, OS, browser, publisher)
- **Auto-reconnect** - Handles connection failures gracefully
- **Per-campaign queues** - Each campaign gets its own bid queue for scalability

## Installation

```bash
cd bots/advertiser-bot
npm install
```

## Configuration

Environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `RABBITMQ_URL` | RabbitMQ connection URL | `amqp://localhost:5672` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `adexchange` |
| `DB_USER` | Database user | current user |
| `DB_PASSWORD` | Database password | empty |
| `ADVERTISER_IDS` | Comma-separated advertiser IDs | all advertisers |
| `PARTICIPATION_RATE` | Bid participation rate (0-1) | `0.7` |
| `BID_VARIANCE` | Bid randomization variance | `0.1` |
| `PREFETCH` | AMQP prefetch count | `5` |

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### With Docker

```bash
docker-compose up advertiser-bot
```

## Architecture

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────────┐
│  PostgreSQL DB  │──────│   Ad Bot     │──────│    RabbitMQ     │
│                 │      │              │      │                 │
│ - Campaigns     │      │ - Load Data  │      │ - bid.requests │
│ - Creatives     │      │ - Calc Bids  │      │ - bid.responses│
└─────────────────┘      └──────────────┘      └─────────────────┘
```

## Bot Flow

1. **Connect** to RabbitMQ
2. **Load** active campaigns from database
3. **Create** per-campaign queues (`campaign.{id}.bids`)
4. **Consume** bid requests from queues
5. **Calculate** bid based on campaign strategy
6. **Publish** bid response to `bid.responses` exchange
7. **Track** auction events for wins/losses

## Bid Strategies

- **highest** - Always bid max_bid (subject to budget)
- **dynamic** - Adjust based on time of day, publisher quality
- **target_cpm** - Bid to achieve target CPM
- **second_price** - Bid to win but pay second price

## Message Format

### Bid Request (consumed)

```json
{
  "auctionId": "auction-123",
  "floorPrice": 0.05,
  "adSlotType": "banner_top",
  "userContext": {
    "countryCode": "US",
    "device": "desktop",
    "os": "Windows",
    "browser": "Chrome"
  },
  "timestamp": 1234567890
}
```

### Bid Response (published)

```json
{
  "auctionId": "auction-123",
  "campaignId": "campaign-abc",
  "advertiserId": "advertiser-xyz",
  "amount": 0.055,
  "creative": {
    "id": "creative-1",
    "format": "banner",
    "width": 728,
    "height": 90,
    "assets": {...}
  },
  "timestamp": 1234567891
}
```

## Monitoring

The bot logs:
- Connection status
- Campaigns loaded
- Bids submitted
- Auctions won
- Errors and warnings

## Scaling

To run multiple bot instances:

1. Set `ADVERTISER_IDS` to partition advertisers
2. Or set `PARTICIPATION_RATE` to reduce load
3. Horizontal scaling is supported - each instance creates its own queues
