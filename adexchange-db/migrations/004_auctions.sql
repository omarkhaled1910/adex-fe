-- ============================================================================
-- PHASE 3: AUCTIONS & BIDS
-- ============================================================================

-- Auctions table
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
  total_bids INTEGER DEFAULT 0,
  
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

-- Bids table
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

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Parties
  advertiser_id UUID REFERENCES advertisers(id),
  publisher_id UUID REFERENCES publishers(id),
  campaign_id UUID REFERENCES campaigns(id),
  
  -- Transaction details
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  
  -- Blockchain data
  tx_hash VARCHAR(66),
  block_number INTEGER,
  gas_used INTEGER,
  gas_price DECIMAL(18, 8),
  
  -- Related entities
  auction_id UUID REFERENCES auctions(id),
  impression_id UUID,
  attention_proof_id UUID,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  
  -- Metadata
  notes TEXT,
  metadata JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP
);

CREATE INDEX idx_transactions_advertiser ON transactions(advertiser_id);
CREATE INDEX idx_transactions_publisher ON transactions(publisher_id);
CREATE INDEX idx_transactions_campaign ON transactions(campaign_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_tx_hash ON transactions(tx_hash);
CREATE INDEX idx_transactions_created ON transactions(created_at);
