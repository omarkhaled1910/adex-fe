import { Campaign, Creative, BidRequest, BidResponse } from '../types/bot.types';

/**
 * Bid strategy service for calculating bid amounts
 */
export class BidStrategyService {
  /**
   * Calculate bid amount based on campaign strategy
   */
  calculateBid(campaign: Campaign, bidRequest: BidRequest): number {
    const { floorPrice } = bidRequest;

    switch (campaign.bid_strategy) {
      case 'highest':
        return this.bidHighest(campaign, floorPrice);
      case 'dynamic':
        return this.bidDynamic(campaign, bidRequest);
      case 'target_cpm':
        return this.bidTargetCPM(campaign, floorPrice);
      case 'second_price':
        return this.bidSecondPrice(campaign, floorPrice);
      default:
        return this.bidHighest(campaign, floorPrice);
    }
  }

  /**
   * Highest bid strategy: bid max_bid
   */
  private bidHighest(campaign: Campaign, floorPrice: number): number {
    const minBid = floorPrice * 1.01;
    const maxBid = campaign.max_bid;
    const remainingBudget = campaign.total_budget - campaign.spent_amount;
    const budgetCapped = Math.min(maxBid, remainingBudget);
    return Math.max(minBid, budgetCapped);
  }

  /**
   * Dynamic bid strategy with adjustments
   */
  private bidDynamic(campaign: Campaign, bidRequest: BidRequest): number {
    const baseBid = this.bidHighest(campaign, bidRequest.floorPrice);
    let multiplier = 1.0;

    // Time of day adjustment
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 17) {
      multiplier *= 1.1;
    }

    // Premium publishers - use publisherId for matching
    // Includes all simulated-user.js publishers
    const premiumPublishers = [
      "nytimes.com",
      "cnn.com",
      "techcrunch.com",
      "reddit.com",
      "medium.com",
      "forbes.com",
    ];
    if (premiumPublishers.some((p) => bidRequest.publisherId?.includes(p))) {
      multiplier *= 1.15; // Higher multiplier for more aggressive bidding
    }

    return Math.min(baseBid * multiplier, campaign.max_bid);
  }

  /**
   * Target CPM strategy
   */
  private bidTargetCPM(campaign: Campaign, floorPrice: number): number {
    const targetCPM = floorPrice * 1.2;
    if (campaign.avg_ctr) {
      const ctrMultiplier = Math.min(1.5, 1 + (campaign.avg_ctr / 0.05));
      return Math.min(targetCPM * ctrMultiplier, campaign.max_bid);
    }
    return Math.min(targetCPM, campaign.max_bid);
  }

  /**
   * Second price strategy
   */
  private bidSecondPrice(campaign: Campaign, floorPrice: number): number {
    return Math.min(floorPrice * 1.1, campaign.max_bid);
  }

  /**
   * Select best creative for the ad slot
   */
  selectCreative(campaign: Campaign, adSlotType: string): Creative | null {
    const creatives = campaign.creatives;
    if (!creatives || creatives.length === 0) {
      return null;
    }

    // Format matching - map ad slot types to acceptable creative formats
    const formatMap: Record<string, string[]> = {
      banner_top: ["banner"],
      sidebar_right: ["banner"],
      sidebar_left: ["banner"],
      in_article: ["banner", "native"],
      in_article_video: ["video", "banner"],
      video_pre_roll: ["video"],
      video_mid_roll: ["video"],
      native_feed: ["native", "banner"],
      native: ["native", "banner"],
      interstitial: ["banner", "video", "interstitial"],
      banner: ["banner"],
      video: ["video"],
    };

    const allowedFormats = formatMap[adSlotType] || [
      "banner",
      "video",
      "native",
    ];
    let matching = creatives.filter((c) => allowedFormats.includes(c.format));

    // If no matching creatives, fall back to any available creative
    if (matching.length === 0) {
      matching = creatives;
    }

    // Sort by CTR (descending)
    matching.sort((a, b) => (b.ctr || 0) - (a.ctr || 0));

    return matching[0];
  }

  /**
   * Generate bid response
   */
  generateBidResponse(
    campaign: Campaign,
    bidRequest: BidRequest,
    auctionId: string,
  ): BidResponse | null {
    const bidAmount = this.calculateBid(campaign, bidRequest);

    if (bidAmount < bidRequest.floorPrice) {
      return null;
    }

    const creative = this.selectCreative(campaign, bidRequest.adSlotType);
    if (!creative) {
      return null;
    }

    return {
      auctionId,
      campaignId: campaign.id,
      advertiserId: campaign.advertiser_id,
      amount: bidAmount,
      creative,
      timestamp: Date.now(),
    };
  }
}
