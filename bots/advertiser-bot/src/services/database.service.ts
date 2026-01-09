import { Pool, PoolClient } from "pg";
import { Campaign, Creative } from "../types/bot.types";
import { BotConfigManager } from "../config/bot.config";

/**
 * Database service for fetching campaign and creative data
 */
export class DatabaseService {
  private pool: Pool;

  constructor() {
    const config = BotConfigManager.getDatabaseConfig();
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      max: 10,
    });

    this.pool.on("error", (err) => {
      console.error("Database pool error:", err);
    });
  }

  /**
   * Get all active campaigns for the configured advertisers
   */
  async getActiveCampaigns(advertiserIds: string[]): Promise<Campaign[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT
          c.id,
          c.advertiser_id,
          c.name,
          c.total_budget,
          c.daily_budget,
          c.spent_amount,
          c.max_bid,
          c.bid_strategy,
          c.target_publishers,
          c.target_ad_slots,
          c.target_geos,
          c.target_devices,
          c.target_os,
          c.target_browsers,
          c.status,
          c.category,
          c.subcategory,
          COALESCE(
            jsonb_agg(
              DISTINCT jsonb_build_object(
                'id', cr.id,
                'campaign_id', cr.campaign_id,
                'name', cr.name,
                'format', cr.format,
                'assets', cr.assets,
                'headline', cr.headline,
                'description', cr.description,
                'cta_text', cr.cta_text,
                'landing_url', cr.landing_url,
                'width', cr.width,
                'height', cr.height,
                'duration', cr.duration,
                'review_status', cr.review_status,
                'status', cr.status,
                'impressions', cr.impressions,
                'clicks', cr.clicks,
                'ctr', cr.ctr
              )
            ) FILTER (WHERE cr.id IS NOT NULL),
            '[]'::jsonb
          ) as creatives
        FROM campaigns c
        LEFT JOIN ad_creatives cr ON cr.campaign_id = c.id
          AND cr.review_status = 'approved'
          AND cr.status = 'active'
        WHERE (cardinality($1::uuid[]) = 0 OR c.advertiser_id = ANY($1))
          AND c.status = 'active'
          AND c.start_date <= NOW()
          AND (c.end_date IS NULL OR c.end_date >= NOW())
        GROUP BY c.id
        ORDER BY c.created_at DESC`,
        [advertiserIds]
      );

      return result.rows.map((row) => ({
        ...row,
        creatives: row.creatives || [],
      }));
    } finally {
      client.release();
    }
  }

  /**
   * Get campaigns by category
   */
  async getCampaignsByCategory(category: string): Promise<Campaign[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT
          c.id,
          c.advertiser_id,
          c.name,
          c.total_budget,
          c.daily_budget,
          c.spent_amount,
          c.max_bid,
          c.bid_strategy,
          c.target_publishers,
          c.target_ad_slots,
          c.target_geos,
          c.target_devices,
          c.target_os,
          c.target_browsers,
          c.status,
          c.category,
          c.subcategory,
          COALESCE(
            jsonb_agg(
              DISTINCT jsonb_build_object(
                'id', cr.id,
                'campaign_id', cr.campaign_id,
                'name', cr.name,
                'format', cr.format,
                'assets', cr.assets,
                'headline', cr.headline,
                'description', cr.description,
                'cta_text', cr.cta_text,
                'landing_url', cr.landing_url,
                'width', cr.width,
                'height', cr.height,
                'duration', cr.duration,
                'review_status', cr.review_status,
                'status', cr.status,
                'impressions', cr.impressions,
                'clicks', cr.clicks,
                'ctr', cr.ctr
              )
            ) FILTER (WHERE cr.id IS NOT NULL),
            '[]'::jsonb
          ) as creatives
        FROM campaigns c
        LEFT JOIN ad_creatives cr ON cr.campaign_id = c.id
          AND cr.review_status = 'approved'
          AND cr.status = 'active'
        WHERE COALESCE(c.category, 'uncategorized') = $1
          AND c.status = 'active'
          AND c.start_date <= NOW()
          AND (c.end_date IS NULL OR c.end_date >= NOW())
        GROUP BY c.id
        ORDER BY c.created_at DESC`,
        [category]
      );

      return result.rows.map((row) => ({
        ...row,
        creatives: row.creatives || [],
      }));
    } finally {
      client.release();
    }
  }

  /**
   * Get a single campaign by ID
   */
  async getCampaign(campaignId: string): Promise<Campaign | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT
          c.id,
          c.advertiser_id,
          c.name,
          c.total_budget,
          c.daily_budget,
          c.spent_amount,
          c.max_bid,
          c.bid_strategy,
          c.target_publishers,
          c.target_ad_slots,
          c.target_geos,
          c.target_devices,
          c.target_os,
          c.target_browsers,
          c.status,
          c.category,
          c.subcategory,
          COALESCE(
            jsonb_agg(
              DISTINCT jsonb_build_object(
                'id', cr.id,
                'campaign_id', cr.campaign_id,
                'name', cr.name,
                'format', cr.format,
                'assets', cr.assets,
                'headline', cr.headline,
                'description', cr.description,
                'cta_text', cr.cta_text,
                'landing_url', cr.landing_url,
                'width', cr.width,
                'height', cr.height,
                'duration', cr.duration,
                'review_status', cr.review_status,
                'status', cr.status,
                'impressions', cr.impressions,
                'clicks', cr.clicks,
                'ctr', cr.ctr
              )
            ) FILTER (WHERE cr.id IS NOT NULL),
            '[]'::jsonb
          ) as creatives
        FROM campaigns c
        LEFT JOIN ad_creatives cr ON cr.campaign_id = c.id
          AND cr.review_status = 'approved'
          AND cr.status = 'active'
        WHERE c.id = $1
        GROUP BY c.id`,
        [campaignId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        ...row,
        creatives: row.creatives || [],
      };
    } finally {
      client.release();
    }
  }

  /**
   * Get all advertiser IDs
   */
  async getAllAdvertiserIds(): Promise<string[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT id FROM advertisers WHERE status = 'active'`
      );
      return result.rows.map((row) => row.id);
    } finally {
      client.release();
    }
  }

  /**
   * Check daily budget availability
   */
  async checkDailyBudget(campaignId: string): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT
          c.daily_budget,
          COALESCE(SUM(dbt.spent), 0) as daily_spend
        FROM campaigns c
        LEFT JOIN daily_budget_tracking dbt ON dbt.campaign_id = c.id
          AND dbt.date = CURRENT_DATE
        WHERE c.id = $1
        GROUP BY c.daily_budget`,
        [campaignId]
      );

      if (result.rows.length === 0) {
        return true; // Campaign not found, allow bid
      }

      const { daily_budget, daily_spend } = result.rows[0];
      if (!daily_budget) {
        return true; // No daily budget set
      }

      return daily_spend < daily_budget;
    } finally {
      client.release();
    }
  }

  /**
   * Close the database connection pool
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}
