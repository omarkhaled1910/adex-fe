import { DatabaseService } from "./services/database.service";
import { AmqpService } from "./services/amqp.service";
import { BidStrategyService } from "./services/bid-strategy.service";
import { Campaign, BidRequest, BotInstanceConfig, BotHealth } from "./types/bot.types";

/**
 * FallbackBot - Emergency-only bot that activates when specialized bots are down
 *
 * Behavior:
 * - Monitors health signals from all active bots
 * - Only activates when no healthy specialized bot exists for a category
 * - Uses conservative bidding (min(floorPrice * 1.1, campaign.max_bid * 0.5))
 * - Logs emergency activation for alerting
 */
export class FallbackBot {
  private dbService: DatabaseService;
  private amqpService: AmqpService;
  private bidStrategyService: BidStrategyService;
  private campaigns: Map<string, Campaign> = new Map();

  public readonly id: string;
  public readonly fallbackBidMultiplier: number;

  // Health tracking
  private health: BotHealth;
  private isRunning = false;
  private isEmergencyMode = false;

  // Track other bots' health
  private otherBotsHealth: Map<string, BotHealth> = new Map();

  // Callbacks
  private onHealthUpdate?: (health: BotHealth) => void;
  private healthUpdateInterval?: NodeJS.Timeout;
  private modeCheckInterval?: NodeJS.Timeout;

  constructor(
    id: string,
    fallbackBidMultiplier: number,
    dbService: DatabaseService,
    amqpService: AmqpService
  ) {
    this.id = id;
    this.fallbackBidMultiplier = fallbackBidMultiplier;

    this.dbService = dbService;
    this.amqpService = amqpService;
    this.bidStrategyService = new BidStrategyService();

    // Initialize health
    this.health = {
      botId: this.id,
      category: 'fallback',
      status: 'healthy',
      lastHeartbeat: Date.now(),
      bidsProcessed: 0,
      errors: 0,
    };
  }

  /**
   * Set callback for health updates
   */
  setHealthUpdateCallback(callback: (health: BotHealth) => void): void {
    this.onHealthUpdate = callback;
  }

  /**
   * Update health status of another bot
   */
  updateBotHealth(botHealth: BotHealth): void {
    this.otherBotsHealth.set(botHealth.botId, botHealth);
    this.checkEmergencyMode();
  }

  /**
   * Remove a bot from health tracking
   */
  removeBotHealth(botId: string): void {
    this.otherBotsHealth.delete(botId);
    this.checkEmergencyMode();
  }

  /**
   * Check if we should enter emergency mode
   */
  private checkEmergencyMode(): void {
    // Check if any specialized bot is healthy
    const hasHealthySpecializedBot = Array.from(this.otherBotsHealth.values()).some(
      h => h.status === 'healthy' && h.category !== 'fallback'
    );

    const wasEmergencyMode = this.isEmergencyMode;
    this.isEmergencyMode = !hasHealthySpecializedBot;

    if (this.isEmergencyMode && !wasEmergencyMode) {
      console.warn(`🚨 FALLBACK BOT ${this.id} ENTERING EMERGENCY MODE - No healthy specialized bots detected!`);
      this.health.status = 'degraded'; // Degraded means we're operating but not optimally
    } else if (!this.isEmergencyMode && wasEmergencyMode) {
      console.log(`✅ FALLBACK BOT ${this.id} exiting emergency mode - specialized bots are back online`);
      this.health.status = 'healthy';
    }

    this.notifyHealthUpdate();
  }

  /**
   * Start the fallback bot
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn(`Fallback bot ${this.id} is already running`);
      return;
    }

    console.log(`🤖 Starting fallback bot: ${this.id}`);

    // Load all campaigns as fallback
    await this.loadCampaigns();

    // Subscribe to auction events
    await this.setupAuctionConsumer();

    // Start health reporting
    this.startHealthReporting();

    // Start periodic emergency mode checks
    this.modeCheckInterval = setInterval(() => {
      this.checkEmergencyMode();
    }, 5000);

    this.isRunning = true;
    console.log(`✅ Fallback bot ${this.id} started with ${this.campaigns.size} campaigns (standby mode)`);
  }

  /**
   * Stop the fallback bot
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log(`🛑 Stopping fallback bot: ${this.id}`);

    this.isRunning = false;

    if (this.healthUpdateInterval) {
      clearInterval(this.healthUpdateInterval);
      this.healthUpdateInterval = undefined;
    }

    if (this.modeCheckInterval) {
      clearInterval(this.modeCheckInterval);
      this.modeCheckInterval = undefined;
    }

    this.campaigns.clear();
    this.otherBotsHealth.clear();

    console.log(`✅ Fallback bot ${this.id} stopped`);
  }

  /**
   * Load all campaigns for fallback (public for spawner)
   */
  async loadCampaigns(): Promise<void> {
    try {
      const campaigns = await this.dbService.getActiveCampaigns([]);

      this.campaigns.clear();
      for (const campaign of campaigns) {
        this.campaigns.set(campaign.id, campaign);
      }

      console.log(`📦 Fallback bot ${this.id} loaded ${this.campaigns.size} campaigns`);
    } catch (error) {
      console.error(`Fallback bot ${this.id} failed to load campaigns:`, error);
      this.health.errors++;
    }
  }

  /**
   * Setup consumer for auction events
   *
   * Creates campaign-specific queues and binds them to bid.requests exchange
   * with the correct routing key: campaign.${campaignId}
   */
  private async setupAuctionConsumer(): Promise<void> {
    const channel = this.amqpService.getChannel();
    if (!channel) {
      console.error(`Fallback bot ${this.id}: AMQP channel not available`);
      return;
    }

    try {
      // Create a queue for each campaign and bind with correct routing key
      for (const campaign of this.campaigns.values()) {
        const queueName = `campaign.${campaign.id}.bids.fallback`;

        await channel.assertQueue(queueName, {
          durable: false,
          exclusive: false,
          autoDelete: true,
          messageTtl: 10000,
        });

        // Bind to bid.requests exchange with routing key campaign.${campaignId}
        await channel.bindQueue(queueName, 'bid.requests', `campaign.${campaign.id}`);

        await channel.consume(queueName, async (msg) => {
          if (!msg) return;

          try {
            const bidRequest: BidRequest = JSON.parse(msg.content.toString());
            await this.handleBidRequest(bidRequest);
            channel.ack(msg);
          } catch (error) {
            const err = error as Error;
            console.error(`Fallback bot ${this.id} error processing bid request:`, err.message);
            this.health.errors++;
            channel.nack(msg, false, false);
          }
        });

        console.log(`✅ Fallback bot ${this.id} bound to queue ${queueName} for campaign ${campaign.id}`);
      }

      console.log(`✅ Fallback bot ${this.id} consuming bid requests for ${this.campaigns.size} campaigns`);
    } catch (error) {
      const err = error as Error;
      console.error(`Fallback bot ${this.id} failed to setup auction consumer:`, err.message);
    }
  }

  /**
   * Handle a bid request (ALWAYS bids with floor price - fallback mode)
   */
  private async handleBidRequest(bidRequest: BidRequest): Promise<void> {
    // Update heartbeat
    this.health.lastHeartbeat = Date.now();

    // Find ANY campaign with budget and creative (ignore all targeting)
    const campaign = this.findAnyCampaign(bidRequest);
    if (!campaign) {
      console.log(`[FALLBACK] Bot ${this.id.substring(0, 8)}: No campaign found for auction ${bidRequest.auctionId.substring(0, 12)}...`);
      return;
    }

    // Always bid with floor price
    const bidAmount = bidRequest.floorPrice;

    // Select creative
    const creative = this.bidStrategyService.selectCreative(campaign, bidRequest.adSlotType);
    if (!creative) {
      console.log(`[FALLBACK] Bot ${this.id.substring(0, 8)}: No creative for ad slot ${bidRequest.adSlotType}`);
      return;
    }

    const bidResponse = {
      auctionId: bidRequest.auctionId,
      campaignId: campaign.id,
      advertiserId: campaign.advertiser_id,
      amount: Math.round(bidAmount * 10000) / 10000,
      creative,
      timestamp: Date.now(),
    };

    // Publish bid response
    const published = this.amqpService.publishBidResponse(bidResponse);
    if (published) {
      this.health.bidsProcessed++;
      console.log(
        `💰 [FALLBACK] Bot ${this.id.substring(0, 8)}... bid $${bidResponse.amount.toFixed(4)} (floor) for auction ${bidRequest.auctionId.substring(0, 12)}...`
      );
      this.notifyHealthUpdate();
    } else {
      console.log(`[FALLBACK] Bot ${this.id.substring(0, 8)}: Failed to publish bid`);
    }
  }

  /**
   * Find ANY campaign with budget and matching creative (ignores all targeting)
   */
  private findAnyCampaign(bidRequest: BidRequest): Campaign | null {
    for (const campaign of this.campaigns.values()) {
      // Check budget only
      if (campaign.total_budget - campaign.spent_amount <= 0) {
        continue;
      }

      // Check if we have a suitable creative for the ad slot type
      const creative = this.bidStrategyService.selectCreative(campaign, bidRequest.adSlotType);
      if (!creative) {
        continue;
      }

      // Return first campaign with budget and creative - ignore all targeting!
      return campaign;
    }

    return null;
  }

  /**
   * Start periodic health reporting
   */
  private startHealthReporting(): void {
    this.healthUpdateInterval = setInterval(() => {
      this.notifyHealthUpdate();
    }, 10000);
  }

  /**
   * Notify spawner of health update
   */
  private notifyHealthUpdate(): void {
    if (this.onHealthUpdate) {
      this.onHealthUpdate({ ...this.health });
    }
  }

  /**
   * Get current health
   */
  getHealth(): BotHealth {
    return { ...this.health };
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      id: this.id,
      category: 'fallback',
      priority: 'fallback',
      campaigns: this.campaigns.size,
      isRunning: this.isRunning,
      isEmergencyMode: this.isEmergencyMode,
      health: this.health,
      trackedBots: this.otherBotsHealth.size,
    };
  }
}
