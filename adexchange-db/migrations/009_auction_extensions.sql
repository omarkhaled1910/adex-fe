-- ============================================================================
-- PHASE 9: AUCTION EXTENSIONS
-- Adds additional columns and auction_bids table for detailed auction tracking
-- ============================================================================

-- Add missing columns to auctions table
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS completion_reason VARCHAR(50);
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS winning_price DECIMAL(18, 8);
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS winner_campaign_id UUID REFERENCES campaigns(id);
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS winner_advertiser_id UUID REFERENCES advertisers(id);
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS expected_bids INTEGER;
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS bid_ratio DECIMAL(5, 4);

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_auctions_completion_reason ON auctions(completion_reason);
CREATE INDEX IF NOT EXISTS idx_auctions_winner_campaign ON auctions(winner_campaign_id);
CREATE INDEX IF NOT EXISTS idx_auctions_winner_advertiser ON auctions(winner_advertiser_id);

-- Create auction_bids table for detailed bid tracking
CREATE TABLE IF NOT EXISTS auction_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id VARCHAR(100) NOT NULL,
  campaign_id UUID REFERENCES campaigns(id),
  advertiser_id UUID REFERENCES advertisers(id),
  
  -- Bid details
  bid_amount DECIMAL(18, 8) NOT NULL,
  creative JSONB,
  response_time_ms INTEGER,
  is_winner BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auction_bids_auction ON auction_bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_bids_campaign ON auction_bids(campaign_id);
CREATE INDEX IF NOT EXISTS idx_auction_bids_advertiser ON auction_bids(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_auction_bids_winner ON auction_bids(is_winner);

