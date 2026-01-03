console.log("🔥 src/index.ts is running");

export { AdvertiserBot, main } from "./bot";
export { DatabaseService } from "./services/database.service";
export { AmqpService } from "./services/amqp.service";
export { BidStrategyService } from "./services/bid-strategy.service";
export { BotConfigManager } from "./config/bot.config";
export * from "./types/bot.types";
import { main } from "./bot";
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
