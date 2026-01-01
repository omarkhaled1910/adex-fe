-- ============================================================================
-- PHASE 3: IMPRESSIONS & ATTENTION TRACKING
-- ============================================================================

-- User fingerprints (for frequency capping)
CREATE TABLE user_fingerprints (
  fingerprint VARCHAR(64) PRIMARY KEY,
  
  -- Tracking
  first_seen_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP DEFAULT NOW(),
  total_impressions INTEGER DEFAULT 0,
  
  -- Campaign exposure
  campaign_exposures JSONB DEFAULT '{}',
  
  -- Fraud detection
  suspicious BOOLEAN DEFAULT false,
  fraud_score DECIMAL(3, 2) DEFAULT 0.00,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_fingerprints_suspicious ON user_fingerprints(suspicious);
CREATE INDEX idx_user_fingerprints_last_seen ON user_fingerprints(last_seen_at);

-- Impressions table
CREATE TABLE impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID REFERENCES auctions(id),
  bid_id UUID REFERENCES bids(id),
  campaign_id UUID REFERENCES campaigns(id),
  publisher_id UUID REFERENCES publishers(id),
  ad_slot_id UUID REFERENCES ad_slots(id),
  creative_id UUID REFERENCES ad_creatives(id),
  
  -- User context
  user_fingerprint VARCHAR(64) REFERENCES user_fingerprints(fingerprint),
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR(20),
  os VARCHAR(50),
  browser VARCHAR(50),
  
  -- Location
  country_code VARCHAR(2),
  region VARCHAR(100),
  city VARCHAR(100),
  
  -- Timing
  served_at TIMESTAMP DEFAULT NOW(),
  
  -- Viewability
  viewable BOOLEAN DEFAULT false,
  time_in_view INTEGER,
  viewport_percentage INTEGER,
  
  -- Engagement
  clicked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMP,
  converted BOOLEAN DEFAULT false,
  converted_at TIMESTAMP,
  conversion_value DECIMAL(18, 8),
  
  -- Fraud detection
  bot_score DECIMAL(3, 2),
  fraud_flags TEXT[],
  flagged_as_fraud BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_impressions_auction ON impressions(auction_id);
CREATE INDEX idx_impressions_campaign ON impressions(campaign_id);
CREATE INDEX idx_impressions_publisher ON impressions(publisher_id);
CREATE INDEX idx_impressions_served_at ON impressions(served_at);
CREATE INDEX idx_impressions_user_fingerprint ON impressions(user_fingerprint);
CREATE INDEX idx_impressions_flagged ON impressions(flagged_as_fraud);

-- Attention events table
CREATE TABLE attention_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  impression_id UUID REFERENCES impressions(id) ON DELETE CASCADE,
  
  -- Event details
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  
  -- Timing
  timestamp BIGINT NOT NULL,
  relative_time INTEGER,
  
  -- Context
  tab_visible BOOLEAN DEFAULT true,
  browser_focused BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attention_impression ON attention_events(impression_id);
CREATE INDEX idx_attention_type ON attention_events(event_type);

-- Attention proofs table
CREATE TABLE attention_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  impression_id UUID REFERENCES impressions(id) ON DELETE CASCADE,
  auction_id UUID REFERENCES auctions(id),
  
  -- Proof details
  events_count INTEGER NOT NULL,
  watch_time_ms INTEGER NOT NULL,
  watch_percentage DECIMAL(5, 2) NOT NULL,
  
  -- Validation
  meets_threshold BOOLEAN DEFAULT false,
  validated BOOLEAN DEFAULT false,
  validated_at TIMESTAMP,
  
  -- Signatures
  user_signature VARCHAR(132),
  publisher_signature VARCHAR(132),
  
  -- Proof data
  proof_hash VARCHAR(66),
  merkle_root VARCHAR(66),
  
  -- Settlement
  settled BOOLEAN DEFAULT false,
  settlement_tx_hash VARCHAR(66),
  settled_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attention_proofs_impression ON attention_proofs(impression_id);
CREATE INDEX idx_attention_proofs_auction ON attention_proofs(auction_id);
CREATE INDEX idx_attention_proofs_validated ON attention_proofs(validated);
CREATE INDEX idx_attention_proofs_settled ON attention_proofs(settled);

-- Add foreign key to transactions
ALTER TABLE transactions
  ADD CONSTRAINT fk_transactions_impression
  FOREIGN KEY (impression_id) REFERENCES impressions(id);

ALTER TABLE transactions
  ADD CONSTRAINT fk_transactions_attention_proof
  FOREIGN KEY (attention_proof_id) REFERENCES attention_proofs(id);

-- Triggers
CREATE TRIGGER update_user_fingerprints_updated_at BEFORE UPDATE ON user_fingerprints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
