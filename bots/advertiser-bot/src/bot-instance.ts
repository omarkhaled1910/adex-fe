import { DatabaseService } from "./services/database.service";
import { AmqpService } from "./services/amqp.service";
import { BidStrategyService } from "./services/bid-strategy.service";
import {
  Campaign,
  BidRequest,
  BotInstanceConfig,
  BotPriority,
  BotHealth,
} from "./types/bot.types";

/**
 * BotInstance - A single bot that handles campaigns for one category
 *
 * Each bot instance:
 * - Loads campaigns for a specific category
 * - Listens to auction events via RabbitMQ
 * - Evaluates if auction matches its category
 * - Bids only on matching auctions
 * - Reports health to spawner
 */
export class BotInstance {
  private dbService: DatabaseService;
  private amqpService: AmqpService;
  private bidStrategyService: BidStrategyService;
  private campaigns: Map<string, Campaign> = new Map();

  // Track active campaign consumers (campaignId -> consumerTag)
  private activeConsumers: Map<string, string> = new Map();

  public readonly id: string;
  public readonly category: string;
  public readonly priority: BotPriority;
  public readonly participationRate: number;
  public readonly bidVariance: number;

  // Health tracking
  private health: BotHealth;
  private isRunning = false;
  private healthUpdateInterval?: NodeJS.Timeout;

  // Callbacks for spawner
  private onHealthUpdate?: (health: BotHealth) => void;

  constructor(
    config: BotInstanceConfig,
    dbService: DatabaseService,
    amqpService: AmqpService
  ) {
    this.id = config.id;
    this.category = config.category;
    this.priority = config.priority;
    this.participationRate = config.participationRate;
    this.bidVariance = config.bidVariance;

    this.dbService = dbService;
    this.amqpService = amqpService;
    this.bidStrategyService = new BidStrategyService();

    // Initialize health
    this.health = {
      botId: this.id,
      category: this.category,
      status: "healthy",
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
   * Start the bot instance
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn(`Bot ${this.id} (${this.category}) is already running`);
      return;
    }

    console.log(
      `🤖 Starting bot instance: ${this.id} (category: ${this.category}, priority: ${this.priority})`
    );

    // Load campaigns for this category
    await this.loadCampaigns();

    // Subscribe to auction events
    await this.setupAuctionConsumer();

    // Start health reporting
    this.startHealthReporting();

    this.isRunning = true;
    this.updateHealthStatus("healthy");

    console.log(
      `✅ Bot instance ${this.id} started with ${this.campaigns.size} campaigns`
    );
  }

  /**
   * Stop the bot instance
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log(`🛑 Stopping bot instance: ${this.id}`);

    this.isRunning = false;

    if (this.healthUpdateInterval) {
      clearInterval(this.healthUpdateInterval);
      this.healthUpdateInterval = undefined;
    }

    // Cancel all active consumers
    const channel = this.amqpService.getChannel();
    if (channel) {
      for (const [campaignId, consumerTag] of this.activeConsumers.entries()) {
        try {
          await channel.cancel(consumerTag);
          console.log(
            `✅ Bot ${
              this.id
            } cancelled consumer for campaign ${campaignId.substring(0, 8)}...`
          );
        } catch (error) {
          const err = error as Error;
          console.error(
            `Bot ${this.id} failed to cancel consumer for campaign ${campaignId}:`,
            err.message
          );
        }
      }
    }
    this.activeConsumers.clear();

    // Note: We don't close db/amqp services as they're shared
    this.campaigns.clear();

    console.log(`✅ Bot instance ${this.id} stopped`);
  }

  /**
   * Load campaigns for this category from database
   */
  private async loadCampaigns(): Promise<void> {
    try {
      const campaigns = await this.dbService.getCampaignsByCategory(
        this.category
      );

      this.campaigns.clear();
      for (const campaign of campaigns) {
        this.campaigns.set(campaign.id, campaign);
      }

      console.log(
        `📦 Bot ${this.id} loaded ${this.campaigns.size} campaigns for category "${this.category}"`
      );
    } catch (error) {
      console.error(`Bot ${this.id} failed to load campaigns:`, error);
      this.health.errors++;
    }
  }

  /**
   * Reload campaigns (called by spawner periodically)
   * Properly handles adding/removing campaign consumers
   */
  async reloadCampaigns(): Promise<void> {
    // Store old campaign IDs
    const oldCampaignIds = new Set(this.campaigns.keys());

    // Load new campaigns
    await this.loadCampaigns();

    const newCampaignIds = new Set(this.campaigns.keys());

    // Find campaigns that were added (need new consumers)
    const addedCampaigns = Array.from(newCampaignIds).filter(
      (id) => !oldCampaignIds.has(id)
    );

    // Find campaigns that were removed (need consumers removed)
    const removedCampaigns = Array.from(oldCampaignIds).filter(
      (id) => !newCampaignIds.has(id)
    );

    // Setup consumers for new campaigns
    if (addedCampaigns.length > 0) {
      console.log(
        `[DEBUG] Bot ${this.id}: Adding consumers for ${
          addedCampaigns.length
        } new campaigns: ${addedCampaigns
          .map((id) => id.substring(0, 8))
          .join(", ")}`
      );
      await this.setupCampaignConsumers(
        addedCampaigns.map((id) => this.campaigns.get(id)!)
      );
    }

    // Remove consumers for removed campaigns
    if (removedCampaigns.length > 0) {
      console.log(
        `[DEBUG] Bot ${this.id}: Removing consumers for ${
          removedCampaigns.length
        } removed campaigns: ${removedCampaigns
          .map((id) => id.substring(0, 8))
          .join(", ")}`
      );
      await this.removeCampaignConsumers(removedCampaigns);
    }

    this.health.lastHeartbeat = Date.now();
    this.notifyHealthUpdate();
  }

  /**
   * Setup consumers for specific campaigns (used during initial start and reload)
   */
  private async setupCampaignConsumers(campaigns: Campaign[]): Promise<void> {
    const channel = this.amqpService.getChannel();
    if (!channel) {
      console.error(`Bot ${this.id}: AMQP channel not available`);
      return;
    }

    for (const campaign of campaigns) {
      // Skip if we already have a consumer for this campaign
      if (this.activeConsumers.has(campaign.id)) {
        console.log(
          `[DEBUG] Bot ${
            this.id
          }: Consumer already exists for campaign ${campaign.id.substring(
            0,
            8
          )}..., skipping`
        );
        continue;
      }

      const queueName = `campaign.${campaign.id}.bids`;

      try {
        await channel.assertQueue(queueName, {
          durable: false,
          exclusive: false,
          autoDelete: true,
          messageTtl: 10000,
        });

        await channel.bindQueue(
          queueName,
          "bid.requests",
          `campaign.${campaign.id}`
        );

        const consumerResult = await channel.consume(queueName, async (msg) => {
          if (!msg) return;

          try {
            console.log(
              `📨 Bot ${this.id} received message on queue ${queueName}`
            );
            const bidRequest: BidRequest = JSON.parse(msg.content.toString());
            await this.handleBidRequest(bidRequest);
            channel.ack(msg);
          } catch (error) {
            const err = error as Error;
            console.error(
              `Bot ${this.id} error processing bid request:`,
              err.message
            );
            this.health.errors++;
            channel.nack(msg, false, false);
          }
        });

        // Track the consumer
        this.activeConsumers.set(campaign.id, consumerResult.consumerTag);
        console.log(
          `✅ Bot ${this.id} bound to queue ${queueName} for campaign ${campaign.id}`
        );
      } catch (error) {
        const err = error as Error;
        console.error(
          `Bot ${this.id} failed to setup consumer for campaign ${campaign.id}:`,
          err.message
        );
      }
    }
  }

  /**
   * Remove consumers for specific campaigns (called when campaigns are removed)
   */
  private async removeCampaignConsumers(campaignIds: string[]): Promise<void> {
    const channel = this.amqpService.getChannel();
    if (!channel) {
      console.error(`Bot ${this.id}: AMQP channel not available`);
      return;
    }

    for (const campaignId of campaignIds) {
      const consumerTag = this.activeConsumers.get(campaignId);
      if (consumerTag) {
        try {
          await channel.cancel(consumerTag);
          this.activeConsumers.delete(campaignId);
          console.log(
            `✅ Bot ${
              this.id
            } removed consumer for campaign ${campaignId.substring(0, 8)}...`
          );
        } catch (error) {
          const err = error as Error;
          console.error(
            `Bot ${this.id} failed to remove consumer for campaign ${campaignId}:`,
            err.message
          );
        }
      }

      // Delete the queue (it will be auto-deleted anyway, but explicit is better)
      const queueName = `campaign.${campaignId}.bids`;
      try {
        await channel.deleteQueue(queueName);
      } catch (error) {
        // Queue might not exist, which is fine
      }
    }
  }

  /**
   * Setup consumer for auction events
   *
   * Creates campaign-specific queues and binds them to bid.requests exchange
   * with the correct routing key: campaign.${campaignId}
   */
  private async setupAuctionConsumer(): Promise<void> {
    const campaignsArray = Array.from(this.campaigns.values());
    await this.setupCampaignConsumers(campaignsArray);
    console.log(
      `✅ Bot ${this.id} consuming bid requests for ${this.campaigns.size} campaigns`
    );
  }

  /**
   * Handle a bid request
   */
  private async handleBidRequest(bidRequest: BidRequest): Promise<void> {
    // Update heartbeat
    this.health.lastHeartbeat = Date.now();

    console.log(`\n[DEBUG] ============================================`);
    console.log(
      `[DEBUG] Bot ${this.id.substring(0, 8)}: Processing bid request`
    );
    console.log(
      `[DEBUG]   Auction: ${bidRequest.auctionId.substring(0, 12)}...`
    );
    console.log(`[DEBUG]   AdSlotType: ${bidRequest.adSlotType}`);
    console.log(`[DEBUG]   FloorPrice: $${bidRequest.floorPrice}`);
    console.log(`[DEBUG]   Publisher: ${bidRequest.publisherId}`);
    console.log(`[DEBUG]   Loaded campaigns count: ${this.campaigns.size}`);
    console.log(`[DEBUG] ============================================`);

    // Check if this bot should bid on this auction
    if (!this.shouldBid(bidRequest)) {
      console.log(
        `[DEBUG] ❌ Bot ${this.id.substring(
          0,
          8
        )}: shouldBid returned FALSE - no matching creatives for ad slot type`
      );
      return;
    }

    console.log(
      `[DEBUG] ✅ Bot ${this.id.substring(0, 8)}: shouldBid returned TRUE`
    );

    // Find matching campaign
    const campaign = this.findMatchingCampaign(bidRequest);
    if (!campaign) {
      console.log(
        `[DEBUG] ❌ Bot ${this.id.substring(
          0,
          8
        )}: No matching campaign found (check logs above for reason)`
      );
      return;
    }

    console.log(
      `[DEBUG] ✅ Bot ${this.id.substring(
        0,
        8
      )}: Found matching campaign ${campaign.id.substring(0, 8)}... (${
        campaign.name
      })`
    );

    // Check participation rate
    const randomValue = Math.random();
    console.log(
      `[DEBUG] Bot ${this.id.substring(
        0,
        8
      )}: Participation check - random=${randomValue.toFixed(3)}, rate=${
        this.participationRate
      }`
    );
    if (randomValue > this.participationRate) {
      console.log(
        `[DEBUG] ❌ Bot ${this.id.substring(
          0,
          8
        )}: Skipped due to participation rate`
      );
      return;
    }

    // Generate bid
    const bidResponse = this.bidStrategyService.generateBidResponse(
      campaign,
      bidRequest,
      bidRequest.auctionId
    );

    if (!bidResponse) {
      console.log(
        `[DEBUG] ❌ Bot ${this.id.substring(
          0,
          8
        )}: generateBidResponse returned NULL`
      );
      return;
    }

    console.log(
      `[DEBUG] ✅ Bot ${this.id.substring(0, 8)}: Generated bid $${
        bidResponse.amount
      }`
    );

    // Apply variance if configured
    if (this.bidVariance > 0) {
      const variance =
        1 + (Math.random() * this.bidVariance * 2 - this.bidVariance);
      bidResponse.amount =
        Math.round(bidResponse.amount * variance * 10000) / 10000;
    }

    // Publish bid response
    const published = this.amqpService.publishBidResponse(bidResponse);
    if (published) {
      this.health.bidsProcessed++;
      console.log(
        `💰 [${this.category}] Bot ${this.id.substring(0, 8)}... bid ${
          bidResponse.amount
        } for auction ${bidRequest.auctionId.substring(0, 12)}...`
      );
      this.notifyHealthUpdate();
    } else {
      console.log(
        `[DEBUG] ❌ Bot ${this.id.substring(
          0,
          8
        )}: Failed to publish bid response`
      );
    }
  }

  /**
   * Check if this bot should bid on the given auction
   */
  shouldBid(bidRequest: BidRequest): boolean {
    // Priority check: if auction has priorityBots, only bid if we're in the list
    if (bidRequest.priorityBots && bidRequest.priorityBots.length > 0) {
      // Video priority bots always get first look
      const isPriorityBot =
        this.priority === "video" ||
        bidRequest.priorityBots.includes(this.category);
      if (!isPriorityBot) {
        // Non-priority bots wait a bit to let priority bots bid first
        // In a real system, this would be more sophisticated (e.g., timing-based)
        return Math.random() < 0.3; // Lower chance for non-priority bots
      }
    }

    // Check if any campaign has a matching creative for the ad slot
    for (const campaign of this.campaigns.values()) {
      if (
        this.bidStrategyService.selectCreative(campaign, bidRequest.adSlotType)
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Find the best matching campaign for a bid request
   */
  private findMatchingCampaign(bidRequest: BidRequest): Campaign | null {
    const matchingCampaigns: Array<{ campaign: Campaign; score: number }> = [];

    console.log(
      `[DEBUG]   📋 Evaluating ${this.campaigns.size} campaigns for match...`
    );

    for (const campaign of this.campaigns.values()) {
      const remainingBudget = campaign.total_budget - campaign.spent_amount;

      // Check budget
      console.log(
        `[DEBUG]   📊 Campaign ${campaign.id.substring(0, 8)}... (${
          campaign.name
        }):`
      );
      console.log(
        `[DEBUG]      - Budget: ${campaign.total_budget} - Spent: ${
          campaign.spent_amount
        } = Remaining: ${remainingBudget.toFixed(2)}`
      );
      if (remainingBudget <= 0) {
        console.log(`[DEBUG]      ❌ SKIP: Budget exhausted`);
        continue;
      }

      // Check targeting
      const targetingMatch = this.matchesTargeting(campaign, bidRequest);
      if (!targetingMatch) {
        console.log(`[DEBUG]      ❌ SKIP: Targeting mismatch`);
        continue;
      }

      // Check if we have a suitable creative
      const creative = this.bidStrategyService.selectCreative(
        campaign,
        bidRequest.adSlotType
      );
      if (!creative) {
        console.log(
          `[DEBUG]      ❌ SKIP: No suitable creative for ad slot type ${bidRequest.adSlotType}`
        );
        continue;
      }

      console.log(`[DEBUG]      ✅ PASS: All checks passed`);

      // Calculate a score for this campaign
      let score = 0;

      // Prefer campaigns with higher CTR
      score += (campaign.avg_ctr || 0) * 1000;

      // Prefer campaigns that specifically target this publisher
      if (
        campaign.target_publishers?.some((p) =>
          bidRequest.publisherId.includes(p)
        )
      ) {
        score += 500;
      }

      matchingCampaigns.push({ campaign, score });
      console.log(`[DEBUG]      📈 Score: ${score}`);
    }

    // Sort by score and return the best match
    matchingCampaigns.sort((a, b) => b.score - a.score);
    const bestMatch = matchingCampaigns[0]?.campaign || null;

    if (matchingCampaigns.length > 0) {
      console.log(
        `[DEBUG]   🏆 Found ${
          matchingCampaigns.length
        } matching campaigns, best: ${matchingCampaigns[0].campaign.id.substring(
          0,
          8
        )}... with score ${matchingCampaigns[0].score}`
      );
    } else {
      console.log(`[DEBUG]   ❌ No matching campaigns found`);
    }

    return bestMatch;
  }

  /**
   * Check if a bid request matches a campaign's targeting
   */
  private matchesTargeting(
    campaign: Campaign,
    bidRequest: BidRequest
  ): boolean {
    // Check publisher targeting
    if (campaign.target_publishers && campaign.target_publishers.length > 0) {
      if (
        !campaign.target_publishers.some((p) =>
          bidRequest.publisherId.includes(p)
        )
      ) {
        return false;
      }
    }

    // Check ad slot targeting
    if (campaign.target_ad_slots && campaign.target_ad_slots.length > 0) {
      if (!campaign.target_ad_slots.includes(bidRequest.adSlotId)) {
        return false;
      }
    }

    // Check geo targeting
    if (campaign.target_geos && campaign.target_geos.length > 0) {
      if (
        !bidRequest.userContext.countryCode ||
        !campaign.target_geos.includes(bidRequest.userContext.countryCode)
      ) {
        return false;
      }
    }

    // Check device targeting
    if (campaign.target_devices && campaign.target_devices.length > 0) {
      if (
        !bidRequest.userContext.device ||
        !campaign.target_devices.includes(bidRequest.userContext.device)
      ) {
        return false;
      }
    }

    // Check OS targeting
    if (campaign.target_os && campaign.target_os.length > 0) {
      if (
        !bidRequest.userContext.os ||
        !campaign.target_os.includes(bidRequest.userContext.os)
      ) {
        return false;
      }
    }

    // Check browser targeting
    if (campaign.target_browsers && campaign.target_browsers.length > 0) {
      if (
        !bidRequest.userContext.browser ||
        !campaign.target_browsers.includes(bidRequest.userContext.browser)
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Update health status
   */
  private updateHealthStatus(status: BotHealth["status"]): void {
    this.health.status = status;
    this.health.lastHeartbeat = Date.now();
    this.notifyHealthUpdate();
  }

  /**
   * Start periodic health reporting
   */
  private startHealthReporting(): void {
    this.healthUpdateInterval = setInterval(() => {
      this.notifyHealthUpdate();
    }, 10000); // Report health every 10 seconds
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
      category: this.category,
      priority: this.priority,
      campaigns: this.campaigns.size,
      participationRate: this.participationRate,
      bidVariance: this.bidVariance,
      isRunning: this.isRunning,
      health: this.health,
    };
  }
}

// cd /Users/omarkhaled/Desktop/ADEXCH/adexchange-db && psql -d adexchange -f seeds/08_seed_campaigns_medium_compatible.sql 2>&1
