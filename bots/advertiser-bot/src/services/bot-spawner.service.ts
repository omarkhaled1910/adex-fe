import { DatabaseService } from "./database.service";
import { AmqpService } from "./amqp.service";
import { BotInstance } from "../bot-instance";
import { FallbackBot } from "../fallback-bot";
import { Campaign, BotInstanceConfig, BotHealth, SpawnerConfig, BotPriority } from "../types/bot.types";

/**
 * BotSpawner Service - Creates and manages multiple bot instances
 *
 * Responsibilities:
 * - Scans database for active campaigns by category
 * - Dynamically creates bot instances per category found
 * - Monitors bot health and restarts failed bots
 * - Manages a fallback bot for emergency scenarios
 * - Syncs category assignments every scan interval
 */
export class BotSpawnerService {
  private dbService: DatabaseService;
  private amqpService: AmqpService;

  // Bot instances managed by this spawner
  private bots: Map<string, BotInstance> = new Map();
  private fallbackBot: FallbackBot | null = null;

  // Category to campaigns mapping
  private categoryCampaigns: Map<string, Campaign[]> = new Map();

  // Health tracking
  private botsHealth: Map<string, BotHealth> = new Map();

  // Timers
  private scanInterval?: NodeJS.Timeout;
  private healthCheckInterval?: NodeJS.Timeout;

  // Configuration
  private config: SpawnerConfig;
  private baseConfig: { participationRate: number; bidVariance: number };

  constructor(
    dbService: DatabaseService,
    amqpService: AmqpService,
    spawnerConfig: Partial<SpawnerConfig> = {},
    baseConfig: { participationRate: number; bidVariance: number } = { participationRate: 0.7, bidVariance: 0.1 }
  ) {
    this.dbService = dbService;
    this.amqpService = amqpService;
    this.baseConfig = baseConfig;

    // Default configuration
    this.config = {
      scanInterval: spawnerConfig.scanInterval || 60000,
      healthCheckInterval: spawnerConfig.healthCheckInterval || 30000,
      maxBotsPerCategory: spawnerConfig.maxBotsPerCategory || 3,
      fallbackBidMultiplier: spawnerConfig.fallbackBidMultiplier || 0.5,
      priorityCategories: spawnerConfig.priorityCategories || ['video'],
      unhealthyThreshold: spawnerConfig.unhealthyThreshold || 60000,
    };
  }

  /**
   * Start the bot spawner
   */
  async start(): Promise<void> {
    console.log("🚀 Starting Bot Spawner...");

    // Initial scan and spawn
    await this.scanAndSpawn();

    // Start fallback bot
    await this.startFallbackBot();

    // Start periodic scanning
    this.scanInterval = setInterval(() => {
      this.scanAndSpawn();
    }, this.config.scanInterval);

    // Start health monitoring
    this.healthCheckInterval = setInterval(() => {
      this.monitorHealth();
    }, this.config.healthCheckInterval);

    console.log("✅ Bot Spawner started");
    console.log(`📊 Managing ${this.bots.size} category bots + 1 fallback bot`);
  }

  /**
   * Stop the bot spawner and all bots
   */
  async stop(): Promise<void> {
    console.log("🛑 Stopping Bot Spawner...");

    // Clear timers
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = undefined;
    }

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }

    // Stop all bot instances
    const stopPromises: Promise<void>[] = [];

    for (const bot of this.bots.values()) {
      stopPromises.push(bot.stop());
    }

    if (this.fallbackBot) {
      stopPromises.push(this.fallbackBot.stop());
    }

    await Promise.all(stopPromises);

    this.bots.clear();
    this.botsHealth.clear();

    console.log("✅ Bot Spawner stopped");
  }

  /**
   * Scan database for categories and spawn/manage bots
   */
  private async scanAndSpawn(): Promise<void> {
    try {
      // Get all active campaigns grouped by category
      const campaignsByCategory = await this.getCampaignsByCategory();

      // Update local mapping
      this.categoryCampaigns = campaignsByCategory;

      // Determine which categories need bots
      const categoriesNeedingBots = new Set<string>();

      for (const [category, campaigns] of campaignsByCategory) {
        if (campaigns.length > 0) {
          categoriesNeedingBots.add(category);
        }
      }

      // Spawn new bots for categories that don't have one
      for (const category of categoriesNeedingBots) {
        const botId = `bot-${category}`;

        if (!this.bots.has(botId)) {
          await this.spawnBot(category, campaignsByCategory.get(category)!);
        } else {
          // Reload campaigns for existing bot
          const bot = this.bots.get(botId)!;
          await bot.reloadCampaigns();
        }
      }

      // Terminate bots for categories that no longer have campaigns
      for (const [botId, bot] of this.bots) {
        if (!categoriesNeedingBots.has(bot.category)) {
          await this.terminateBot(botId);
        }
      }

      // Update fallback bot with all campaigns
      if (this.fallbackBot) {
        await this.fallbackBot.loadCampaigns();
      }

    } catch (error) {
      console.error("Bot Spawner: Error during scan and spawn:", error);
    }
  }

  /**
   * Get campaigns grouped by category from database
   */
  private async getCampaignsByCategory(): Promise<Map<string, Campaign[]>> {
    const campaignsByCategory = new Map<string, Campaign[]>();

    try {
      // Get all active campaigns
      const allCampaigns = await this.dbService.getActiveCampaigns([]);

      // Group by category
      for (const campaign of allCampaigns) {
        const category = campaign.category || 'uncategorized';

        if (!campaignsByCategory.has(category)) {
          campaignsByCategory.set(category, []);
        }

        campaignsByCategory.get(category)!.push(campaign);
      }

      console.log(`📦 Found campaigns in ${campaignsByCategory.size} categories:`);
      for (const [category, campaigns] of campaignsByCategory) {
        console.log(`   - ${category}: ${campaigns.length} campaigns`);
      }

    } catch (error) {
      console.error("Error getting campaigns by category:", error);
    }

    return campaignsByCategory;
  }

  /**
   * Spawn a new bot instance for a category
   */
  private async spawnBot(category: string, campaigns: Campaign[]): Promise<void> {
    const botId = `bot-${category}`;
    const botIdUnique = `${botId}-${Date.now()}`;

    // Determine priority based on category
    let priority: BotPriority = 'standard';
    if (this.config.priorityCategories.includes(category)) {
      priority = 'video'; // Use 'video' as the high priority type
    }

    const config: BotInstanceConfig = {
      id: botIdUnique,
      category,
      priority,
      campaignIds: campaigns.map(c => c.id),
      participationRate: this.baseConfig.participationRate,
      bidVariance: this.baseConfig.bidVariance,
    };

    const bot = new BotInstance(config, this.dbService, this.amqpService);

    // Set health update callback
    bot.setHealthUpdateCallback((health) => {
      this.botsHealth.set(botIdUnique, health);
      this.updateFallbackBotHealth(health);
    });

    // Start the bot
    await bot.start();

    // Store bot
    this.bots.set(botIdUnique, bot);
    this.botsHealth.set(botIdUnique, bot.getHealth());

    // Update fallback bot
    this.updateFallbackBotHealth(bot.getHealth());

    console.log(`✅ Spawned new bot: ${botIdUnique} (category: ${category}, priority: ${priority})`);
  }

  /**
   * Terminate a bot instance
   */
  private async terminateBot(botId: string): Promise<void> {
    const bot = this.bots.get(botId);
    if (!bot) {
      return;
    }

    await bot.stop();
    this.bots.delete(botId);
    this.botsHealth.delete(botId);

    // Remove from fallback bot's health tracking
    if (this.fallbackBot) {
      this.fallbackBot.removeBotHealth(botId);
    }

    console.log(`🗑️ Terminated bot: ${botId}`);
  }

  /**
   * Start the fallback bot
   */
  private async startFallbackBot(): Promise<void> {
    const fallbackBotId = `fallback-bot-${Date.now()}`;

    this.fallbackBot = new FallbackBot(
      fallbackBotId,
      this.config.fallbackBidMultiplier,
      this.dbService,
      this.amqpService
    );

    // Set health update callback
    this.fallbackBot.setHealthUpdateCallback((health) => {
      this.botsHealth.set(fallbackBotId, health);
    });

    // Initialize with current bot healths
    for (const health of this.botsHealth.values()) {
      this.fallbackBot.updateBotHealth(health);
    }

    await this.fallbackBot.start();
    this.botsHealth.set(fallbackBotId, this.fallbackBot.getHealth());

    console.log(`✅ Started fallback bot: ${fallbackBotId}`);
  }

  /**
   * Update fallback bot with health from another bot
   */
  private updateFallbackBotHealth(health: BotHealth): void {
    if (this.fallbackBot && health.category !== 'fallback') {
      this.fallbackBot.updateBotHealth(health);
    }
  }

  /**
   * Monitor health of all bots
   */
  private monitorHealth(): void {
    const now = Date.now();
    const unhealthyBots: string[] = [];

    for (const [botId, health] of this.botsHealth) {
      // Skip fallback bot
      if (health.category === 'fallback') {
        continue;
      }

      // Check if bot is unhealthy (no recent heartbeat)
      const timeSinceHeartbeat = now - health.lastHeartbeat;
      if (timeSinceHeartbeat > this.config.unhealthyThreshold) {
        unhealthyBots.push(botId);

        // Try to restart the bot
        console.warn(`⚠️ Bot ${botId} is unhealthy (${timeSinceHeartbeat}ms since heartbeat), attempting restart...`);

        const bot = this.bots.get(botId);
        if (bot) {
          bot.stop().then(() => {
            bot.start();
          });
        }
      }
    }

    if (unhealthyBots.length > 0) {
      console.warn(`⚠️ Found ${unhealthyBots.length} unhealthy bot(s)`);
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    const botsByCategory: Record<string, number> = {};
    const botsByPriority: Record<string, number> = {};

    for (const bot of this.bots.values()) {
      const stats = bot.getStats();
      botsByCategory[stats.category] = (botsByCategory[stats.category] || 0) + 1;
      botsByPriority[stats.priority] = (botsByPriority[stats.priority] || 0) + 1;
    }

    return {
      totalBots: this.bots.size,
      botsByCategory,
      botsByPriority,
      fallbackBotActive: this.fallbackBot?.getStats().isEmergencyMode || false,
      fallbackBotBids: this.fallbackBot?.getStats().health.bidsProcessed || 0,
      totalBidsProcessed: Array.from(this.botsHealth.values()).reduce((sum, h) => sum + h.bidsProcessed, 0),
      config: this.config,
    };
  }

  /**
   * Get all bot health
   */
  getAllBotHealth(): BotHealth[] {
    return Array.from(this.botsHealth.values());
  }

  /**
   * Get a specific bot's health
   */
  getBotHealth(botId: string): BotHealth | undefined {
    return this.botsHealth.get(botId);
  }
}
