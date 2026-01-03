import { DatabaseService } from "./services/database.service";
import { AmqpService } from "./services/amqp.service";
import { BidStrategyService } from "./services/bid-strategy.service";
import { BotConfigManager } from "./config/bot.config";
import { Campaign, BidRequest } from "./types/bot.types";

/**
 * Advertiser Bot - AMQP-based bidding bot
 *
 * This bot:
 * 1. Connects to RabbitMQ
 * 2. Fetches active campaigns from database
 * 3. Creates per-campaign bid queues
 * 4. Consumes bid requests and responds with bids
 */
export class AdvertiserBot {
  private dbService: DatabaseService;
  private amqpService: AmqpService;
  private bidStrategyService: BidStrategyService;
  private campaigns: Map<string, Campaign> = new Map();
  private config: ReturnType<typeof BotConfigManager.getConfig>;
  private advertiserIds: string[] = [];

  constructor() {
    this.config = BotConfigManager.getConfig();
    this.amqpService = new AmqpService(this.config);
    this.dbService = new DatabaseService();
    this.bidStrategyService = new BidStrategyService();
  }

  /**
   * Start the bot
   */
  async start(): Promise<void> {
    console.log("🚀 Starting Advertiser Bot...");

    // Connect to RabbitMQ
    const connected = await this.amqpService.connect();
    if (!connected) {
      console.error("Failed to connect to RabbitMQ, exiting...");
      process.exit(1);
    }

    // Load advertiser IDs from config or database
    if (this.config.advertiserIds.length > 0) {
      this.advertiserIds = this.config.advertiserIds;
    } else {
      this.advertiserIds = await this.dbService.getAllAdvertiserIds();
      console.log(`Found ${this.advertiserIds.length} advertisers in database`);
    }

    // Load campaigns
    await this.loadCampaigns();

    // Subscribe to auction events for tracking
    this.amqpService.subscribeToAuctionEvents((event) => {
      console.log("🔍 Auction event received");
      this.handleAuctionEvent(event);
    });

    // Setup campaign queues and consumers
    await this.setupCampaignConsumers();

    // Set up periodic campaign refresh
    setInterval(() => this.loadCampaigns(), 60000); // Refresh every minute

    console.log("✅ Bot started successfully");
    console.log(
      `📊 Managing ${this.campaigns.size} campaigns across ${this.advertiserIds.length} advertisers`
    );
  }

  /**
   * Load campaigns from database
   */
  private async loadCampaigns(): Promise<void> {
    try {
      const campaigns = await this.dbService.getActiveCampaigns(
        this.advertiserIds
      );

      this.campaigns.clear();
      for (const campaign of campaigns) {
        this.campaigns.set(campaign.id, campaign);
      }

      console.log(`📦 Loaded ${this.campaigns.size} active campaigns`);
    } catch (error) {
      console.error("Failed to load campaigns:", error);
    }
  }

  /**
   * Setup consumers for each campaign
   */
  private async setupCampaignConsumers(): Promise<void> {
    for (const campaign of this.campaigns.values()) {
      await this.amqpService.createCampaignQueue(campaign.id);
      await this.amqpService.consumeBidRequests(
        campaign.id,
        async (bidRequest) => {
          await this.handleBidRequest(campaign.id, bidRequest);
        }
      );
    }
  }

  /**
   * Handle a bid request for a campaign
   */
  private async handleBidRequest(
    campaignId: string,
    bidRequest: BidRequest
  ): Promise<void> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      console.warn(`Campaign ${campaignId} not found`);
      return;
    }

    // Check participation rate
    const participationRate = this.config.participationRate;
    if (Math.random() > participationRate) {
      console.debug(
        `Campaign ${campaignId} skipping auction ${bidRequest.auctionId}`
      );
      return;
    }

    // Check budget
    if (campaign.total_budget - campaign.spent_amount <= 0) {
      console.debug(`Campaign ${campaignId} budget exhausted`);
      return;
    }

    // Generate bid response
    const bidResponse = this.bidStrategyService.generateBidResponse(
      campaign,
      bidRequest,
      bidRequest.auctionId
    );

    if (!bidResponse) {
      console.debug(
        `Campaign ${campaignId} no suitable bid for auction ${bidRequest.auctionId}`
      );
      return;
    }

    // Apply variance if configured
    if (this.config.bidVariance > 0) {
      const variance =
        1 +
        (Math.random() * this.config.bidVariance * 2 - this.config.bidVariance);
      bidResponse.amount =
        Math.round(bidResponse.amount * variance * 10000) / 10000;
    }

    // Publish bid response
    const published = this.amqpService.publishBidResponse(bidResponse);
    if (published) {
      console.log(
        `💰 Campaign ${campaignId.substring(0, 8)}... bid ${
          bidResponse.amount
        } for auction ${bidRequest.auctionId.substring(0, 12)}...`
      );
    }
  }

  /**
   * Handle auction events (for tracking)
   */
  private handleAuctionEvent(event: any): void {
    if (event.event === "auction_created") {
      console.debug(`📢 Auction created: ${event.data.id}`);
    } else if (event.event === "auction_completed") {
      const { winner, auctionId } = event.data;
      if (winner && this.campaigns.has(winner.campaignId)) {
        console.log(
          `🏆 Campaign ${winner.campaignId.substring(
            0,
            8
          )}... won auction ${auctionId.substring(0, 12)}... with bid ${
            winner.amount
          }`
        );
      }
    }
  }

  /**
   * Stop the bot
   */
  async stop(): Promise<void> {
    console.log("🛑 Stopping bot...");
    await this.amqpService.close();
    await this.dbService.close();
    console.log("✅ Bot stopped");
  }

  /**
   * Get bot statistics
   */
  getStats() {
    return {
      connected: this.amqpService.isConnected(),
      campaigns: this.campaigns.size,
      advertisers: this.advertiserIds.length,
      participationRate: this.config.participationRate,
      bidVariance: this.config.bidVariance,
    };
  }
}

// Main entry point
async function main() {
  const bot = new AdvertiserBot();

  // Handle shutdown
  process.on("SIGINT", async () => {
    console.log("\nReceived SIGINT, shutting down...");
    await bot.stop();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("\nReceived SIGTERM, shutting down...");
    await bot.stop();
    process.exit(0);
  });

  // Start bot
  try {
    await bot.start();
  } catch (error) {
    console.error("Failed to start bot:", error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

export { main };
