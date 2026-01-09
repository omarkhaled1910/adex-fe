import { DatabaseService } from "./services/database.service";
import { AmqpService } from "./services/amqp.service";
import { BotSpawnerService } from "./services/bot-spawner.service";
import { BotConfigManager } from "./config/bot.config";

/**
 * Advertiser Bot - Bot Spawner Architecture
 *
 * This bot now uses a spawner architecture:
 * 1. Connects to RabbitMQ
 * 2. Creates a BotSpawner that manages multiple bot instances
 * 3. Each bot instance handles campaigns for a specific category
 * 4. Fallback bot ensures at least one bot always bids
 */
export class AdvertiserBot {
  private dbService: DatabaseService;
  private amqpService: AmqpService;
  private botSpawner: BotSpawnerService;
  private config: ReturnType<typeof BotConfigManager.getConfig>;

  constructor() {
    this.config = BotConfigManager.getConfig();
    this.amqpService = new AmqpService(this.config);
    this.dbService = new DatabaseService();
    this.botSpawner = new BotSpawnerService(
      this.dbService,
      this.amqpService,
      this.config.spawner,
      {
        participationRate: this.config.participationRate,
        bidVariance: this.config.bidVariance,
      }
    );
  }

  /**
   * Start the bot
   */
  async start(): Promise<void> {
    console.log("🚀 Starting Advertiser Bot (Spawner Mode)...");

    // Connect to RabbitMQ
    const connected = await this.amqpService.connect();
    if (!connected) {
      console.error("Failed to connect to RabbitMQ, exiting...");
      process.exit(1);
    }

    // Start the bot spawner
    await this.botSpawner.start();

    console.log("✅ Bot started successfully");
    this.printStats();
  }

  /**
   * Stop the bot
   */
  async stop(): Promise<void> {
    console.log("🛑 Stopping bot...");
    await this.botSpawner.stop();
    await this.amqpService.close();
    await this.dbService.close();
    console.log("✅ Bot stopped");
  }

  /**
   * Get bot statistics
   */
  getStats() {
    return this.botSpawner.getStats();
  }

  /**
   * Print current statistics
   */
  private printStats(): void {
    const stats = this.getStats();
    console.log("\n📊 Bot Spawner Statistics:");
    console.log(`   Total Bots: ${stats.totalBots}`);
    console.log(`   Bots by Category:`, stats.botsByCategory);
    console.log(`   Bots by Priority:`, stats.botsByPriority);
    console.log(`   Fallback Bot Active: ${stats.fallbackBotActive}`);
    console.log(`   Total Bids Processed: ${stats.totalBidsProcessed}`);
    console.log("");
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
