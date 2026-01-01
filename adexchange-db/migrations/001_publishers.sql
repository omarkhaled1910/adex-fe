-- ============================================================================
-- PHASE 1: PUBLISHERS
-- ============================================================================

-- Publishers table
CREATE TABLE publishers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain VARCHAR(255) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  
  -- API credentials
  api_key VARCHAR(64) UNIQUE NOT NULL,
  api_secret_hash VARCHAR(255) NOT NULL,
  
  -- Wallet
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  
  -- Settings
  status VARCHAR(20) DEFAULT 'pending',
  tier VARCHAR(20) DEFAULT 'standard',
  
  -- Revenue tracking
  total_earnings DECIMAL(18, 8) DEFAULT 0,
  pending_earnings DECIMAL(18, 8) DEFAULT 0,
  withdrawn_earnings DECIMAL(18, 8) DEFAULT 0,
  
  -- Verification
  domain_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(64),
  verified_at TIMESTAMP,
  
  -- Metadata
  website_category VARCHAR(100),
  monthly_pageviews BIGINT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_publishers_domain ON publishers(domain);
CREATE INDEX idx_publishers_api_key ON publishers(api_key);
CREATE INDEX idx_publishers_status ON publishers(status);

-- Ad slots table
CREATE TABLE ad_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id UUID REFERENCES publishers(id) ON DELETE CASCADE,
  
  slot_name VARCHAR(100) NOT NULL,
  slot_type VARCHAR(50) NOT NULL,
  
  -- Dimensions
  width INTEGER,
  height INTEGER,
  
  -- Pricing
  floor_price DECIMAL(18, 8) NOT NULL DEFAULT 0.01,
  
  -- Performance
  impressions_served BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  total_revenue DECIMAL(18, 8) DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(publisher_id, slot_name)
);

CREATE INDEX idx_ad_slots_publisher ON ad_slots(publisher_id);
CREATE INDEX idx_ad_slots_type ON ad_slots(slot_type);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_publishers_updated_at BEFORE UPDATE ON publishers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_slots_updated_at BEFORE UPDATE ON ad_slots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
