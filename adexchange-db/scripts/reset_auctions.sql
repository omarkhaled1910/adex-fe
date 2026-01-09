-- ============================================================================
-- RESET AUCTIONS AND RELATED DATA
-- Run this to clear auction data while keeping publishers, advertisers, campaigns, creatives
-- ============================================================================

-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Drop data from tables that depend on auctions (in correct order)
TRUNCATE TABLE attention_proofs CASCADE;
TRUNCATE TABLE attention_events CASCADE;
TRUNCATE TABLE impressions CASCADE;
TRUNCATE TABLE bids CASCADE;

-- Clear auction-related transactions
DELETE FROM transactions WHERE auction_id IS NOT NULL OR impression_id IS NOT NULL;

-- Clear daily_stats
TRUNCATE TABLE daily_stats CASCADE;

-- Now drop the auctions table and recreate it
DROP TABLE IF EXISTS auctions CASCADE;

-- Recreate auctions table (includes extended columns from 009_auction_extensions)
CREATE TABLE auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Context
  publisher_id UUID REFERENCES publishers(id),
  ad_slot_id UUID REFERENCES ad_slots(id),
  
  -- Auction details
  floor_price DECIMAL(18, 8) NOT NULL,
  auction_type VARCHAR(20) DEFAULT 'first_price',
  
  -- User context
  user_context JSONB,
  ip_address INET,
  user_agent TEXT,
  
  -- Timing
  started_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP,
  duration_ms INTEGER,
  
  -- Results
  status VARCHAR(20) DEFAULT 'open',
  winning_bid_id UUID,
  winning_amount DECIMAL(18, 8),
  winning_price DECIMAL(18, 8),
  total_bids INTEGER DEFAULT 0,
  
  -- Extended fields (from 009_auction_extensions)
  completion_reason VARCHAR(50),
  winner_campaign_id UUID REFERENCES campaigns(id),
  winner_advertiser_id UUID REFERENCES advertisers(id),
  expected_bids INTEGER,
  bid_ratio DECIMAL(5, 4),
  
  -- Settlement
  settled BOOLEAN DEFAULT false,
  settled_at TIMESTAMP,
  settlement_tx_hash VARCHAR(66),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_auctions_publisher ON auctions(publisher_id);
CREATE INDEX idx_auctions_slot ON auctions(ad_slot_id);
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_created ON auctions(created_at);
CREATE INDEX idx_auctions_settled ON auctions(settled);
CREATE INDEX idx_auctions_completion_reason ON auctions(completion_reason);
CREATE INDEX idx_auctions_winner_campaign ON auctions(winner_campaign_id);
CREATE INDEX idx_auctions_winner_advertiser ON auctions(winner_advertiser_id);

-- Recreate auction_bids table for detailed bid tracking
DROP TABLE IF EXISTS auction_bids CASCADE;
CREATE TABLE auction_bids (
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

CREATE INDEX idx_auction_bids_auction ON auction_bids(auction_id);
CREATE INDEX idx_auction_bids_campaign ON auction_bids(campaign_id);
CREATE INDEX idx_auction_bids_advertiser ON auction_bids(advertiser_id);
CREATE INDEX idx_auction_bids_winner ON auction_bids(is_winner);

-- Recreate bids table
DROP TABLE IF EXISTS bids CASCADE;

CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id),
  advertiser_id UUID REFERENCES advertisers(id),
  creative_id UUID REFERENCES ad_creatives(id),
  
  -- Bid details
  amount DECIMAL(18, 8) NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'submitted',
  won BOOLEAN DEFAULT false,
  
  -- Timing
  submitted_at TIMESTAMP DEFAULT NOW(),
  response_time_ms INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bids_auction ON bids(auction_id);
CREATE INDEX idx_bids_campaign ON bids(campaign_id);
CREATE INDEX idx_bids_advertiser ON bids(advertiser_id);
CREATE INDEX idx_bids_status ON bids(status);
CREATE INDEX idx_bids_won ON bids(won);

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Reset campaign metrics
UPDATE campaigns SET
  impressions_won = 0,
  impressions_served = 0,
  spent_amount = 0,
  clicks = 0,
  avg_cpm = NULL,
  avg_cpc = NULL,
  avg_ctr = NULL;

-- Reset creative metrics
UPDATE ad_creatives SET
  impressions = 0,
  clicks = 0,
  ctr = NULL;

-- Reset publisher earnings
UPDATE publishers SET
  total_earnings = 0,
  pending_earnings = 0;

-- Reset ad slot metrics
UPDATE ad_slots SET
  impressions_served = 0,
  clicks = 0,
  total_revenue = 0;

-- Refresh dashboard stats (if the function and view exist)
DO $$
BEGIN
  PERFORM refresh_dashboard_stats();
EXCEPTION WHEN undefined_table OR undefined_function THEN
  RAISE NOTICE 'Skipping dashboard refresh - view or function does not exist';
END $$;

-- Log the reset
SELECT log_audit('system', NULL, 'reset_auctions', 'auctions', NULL, 'Reset all auction data', NULL);

-- Done message
DO $$ BEGIN RAISE NOTICE 'Auctions table reset complete!'; END $$;
