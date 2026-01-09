export { AdvertiserBot, main } from "./bot";
export { BotInstance } from "./bot-instance";
export { FallbackBot } from "./fallback-bot";
export { DatabaseService } from "./services/database.service";
export { AmqpService } from "./services/amqp.service";
export { BidStrategyService } from "./services/bid-strategy.service";
export { BotSpawnerService } from "./services/bot-spawner.service";
export { BotConfigManager } from "./config/bot.config";
export * from "./types/bot.types";

// Run main if this file is executed directly
import { main } from "./bot";
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
