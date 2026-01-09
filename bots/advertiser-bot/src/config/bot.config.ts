import { BotConfig, AdvertiserConfig, SpawnerConfig } from '../types/bot.types';

/**
 * Bot configuration
 * Loads from environment variables with sensible defaults
 */
export class BotConfigManager {
  static getConfig(): BotConfig {
    return {
      rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
      databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/adexchange',
      advertiserIds: this.parseAdvertiserIds(process.env.ADVERTISER_IDS || ''),
      participationRate: parseFloat(process.env.PARTICIPATION_RATE || '0.7'),
      bidVariance: parseFloat(process.env.BID_VARIANCE || '0.1'),
      prefetch: parseInt(process.env.PREFETCH || '5'),
      spawner: this.getSpawnerConfig(),
    };
  }

  static getSpawnerConfig(): SpawnerConfig {
    return {
      scanInterval: parseInt(process.env.SPAWNER_SCAN_INTERVAL || '60000'),
      healthCheckInterval: parseInt(process.env.SPAWNER_HEALTH_CHECK_INTERVAL || '30000'),
      maxBotsPerCategory: parseInt(process.env.SPAWNER_MAX_BOTS_PER_CATEGORY || '3'),
      fallbackBidMultiplier: parseFloat(process.env.SPAWNER_FALLBACK_BID_MULTIPLIER || '0.5'),
      priorityCategories: this.parsePriorityCategories(process.env.SPAWNER_PRIORITY_CATEGORIES || 'video'),
      unhealthyThreshold: parseInt(process.env.SPAWNER_UNHEALTHY_THRESHOLD || '60000'),
    };
  }

  static getAdvertisers(): AdvertiserConfig[] {
    // In production, this would load from a config file or database
    // For now, we'll load from database at runtime
    return [];
  }

  private static parseAdvertiserIds(ids: string): string[] {
    if (!ids) return [];
    return ids.split(',').map(id => id.trim()).filter(id => id);
  }

  private static parsePriorityCategories(categories: string): string[] {
    if (!categories) return ['video'];
    return categories.split(',').map(cat => cat.trim()).filter(cat => cat);
  }

  static getDatabaseConfig() {
    const url = process.env.DATABASE_URL || 'postgresql://localhost:5432/adexchange';
    const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

    if (match) {
      return {
        host: match[3],
        port: parseInt(match[4]),
        database: match[5],
        user: match[1],
        password: match[2],
      };
    }

    // Fallback to individual env vars
    return {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'adexchange',
      user: process.env.DB_USER || process.env.USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    };
  }
}
