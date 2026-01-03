import { connect, Channel, ChannelModel } from "amqplib";
import { BotConfig } from "../types/bot.types";

/**
 * AMQP service for RabbitMQ connection and message handling
 */
export class AmqpService {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isShuttingDown = false;
  private readonly config: BotConfig;

  // Message handler callbacks
  private onMessageCallback: ((message: any) => Promise<void>) | null = null;

  constructor(config: BotConfig) {
    this.config = config;
  }

  /**
   * Connect to RabbitMQ
   */
  async connect(): Promise<boolean> {
    try {
      console.log(`🔌 Connecting to RabbitMQ at ${this.config.rabbitmqUrl}`);

      this.connection = await connect(this.config.rabbitmqUrl, {
        heartbeat: 60,
        timeout: 10000,
      });

      this.connection.on("error", (err: Error) => {
        console.error("RabbitMQ connection error:", err.message);
        if (!this.isShuttingDown) {
          this.scheduleReconnect();
        }
      });

      this.connection.on("close", () => {
        console.warn("RabbitMQ connection closed");
        if (!this.isShuttingDown) {
          this.scheduleReconnect();
        }
      });

      this.channel = await this.connection.createChannel();

      // Set prefetch
      await this.channel.prefetch(this.config.prefetch);

      // Setup topology
      await this.setupTopology();

      console.log("✅ Connected to RabbitMQ");
      return true;
    } catch (error) {
      const err = error as Error;
      console.error("Failed to connect to RabbitMQ:", err.message);
      if (!this.isShuttingDown) {
        this.scheduleReconnect();
      }
      return false;
    }
  }

  /**
   * Setup RabbitMQ topology (exchanges and queues)
   */
  private async setupTopology(): Promise<void> {
    if (!this.channel) return;

    // Assert exchanges
    await this.channel.assertExchange("bid.requests", "direct", {
      durable: true,
    });
    await this.channel.assertExchange("bid.responses", "direct", {
      durable: true,
    });
    await this.channel.assertExchange("auction.events", "fanout", {
      durable: true,
    });
    await this.channel.assertExchange("dead.letter", "direct", {
      durable: true,
    });

    console.log("✅ RabbitMQ exchanges asserted");
  }

  /**
   * Create a campaign-specific bid queue
   */
  async createCampaignQueue(campaignId: string): Promise<boolean> {
    if (!this.channel) return false;

    const queueName = `campaign.${campaignId}.bids`;

    try {
      await this.channel.assertQueue(queueName, {
        durable: false,
        exclusive: false,
        autoDelete: true,
        messageTtl: 10000,
      });

      await this.channel.bindQueue(
        queueName,
        "bid.requests",
        `campaign.${campaignId}`
      );
      console.log(`✅ Created campaign queue: ${queueName}`);
      return true;
    } catch (error) {
      const err = error as Error;
      console.error(
        `Failed to create campaign queue ${queueName}:`,
        err.message
      );
      return false;
    }
  }

  /**
   * Start consuming bid requests for a campaign
   */
  async consumeBidRequests(
    campaignId: string,
    handler: (message: any) => Promise<void>
  ): Promise<void> {
    if (!this.channel) return;

    const queueName = `campaign.${campaignId}.bids`;

    try {
      await this.channel.consume(
        queueName,
        async (msg) => {
          if (!msg) return;

          try {
            const content = JSON.parse(msg.content.toString());
            await handler(content);
            this.channel?.ack(msg);
          } catch (error) {
            const err = error as Error & { shouldRetry?: boolean };
            console.error(
              `Error processing bid request for campaign ${campaignId}:`,
              err.message
            );
            this.channel?.nack(msg, false, err.shouldRetry ?? false);
          }
        },
        { noAck: false }
      );

      console.log(`✅ Consuming bid requests for campaign ${campaignId}`);
    } catch (error) {
      const err = error as Error;
      console.error(
        `Failed to consume for campaign ${campaignId}:`,
        err.message
      );
    }
  }

  /**
   * Publish a bid response
   */
  publishBidResponse(bidResponse: any): boolean {
    if (!this.channel) {
      console.warn("Cannot publish: channel not available");
      return false;
    }

    try {
      this.channel.publish(
        "bid.responses",
        "",
        Buffer.from(JSON.stringify(bidResponse)),
        {
          contentType: "application/json",
          expiration: 3000,
          messageId: `bid-response-${bidResponse.auctionId}-${bidResponse.campaignId}`,
        }
      );
      return true;
    } catch (error) {
      const err = error as Error;
      console.error("Failed to publish bid response:", err.message);
      return false;
    }
  }

  /**
   * Subscribe to auction events (for tracking)
   */
  async subscribeToAuctionEvents(handler: (event: any) => void): Promise<void> {
    console.log("🔍 Subscribing to auction events", !!this.channel);
    if (!this.channel) return;

    try {
      // Create a temporary queue for events
      const { queue } = await this.channel.assertQueue("", {
        exclusive: true,
        autoDelete: true,
      });
      await this.channel.bindQueue(queue, "auction.events", "");

      await this.channel.consume(queue, (msg) => {
        if (msg) {
          try {
            const event = JSON.parse(msg.content.toString());
            handler(event);
            this.channel?.ack(msg);
          } catch (error) {
            const err = error as Error;
            console.error("Error processing auction event:", err.message);
            this.channel?.nack(msg, false, false);
          }
        }
      });

      console.log("✅ Subscribed to auction events");
    } catch (error) {
      const err = error as Error;
      console.error("Failed to subscribe to auction events:", err.message);
    }
  }

  /**
   * Schedule reconnection
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    const delay = 5000;
    console.log(`🔄 Reconnecting to RabbitMQ in ${delay}ms...`);

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      await this.connect();
    }, delay);
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    this.isShuttingDown = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.connection) {
      await this.connection.close();
      console.log("🔌 RabbitMQ connection closed");
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }

  /**
   * Get the channel (for advanced usage)
   */
  getChannel(): Channel | null {
    return this.channel;
  }
}
