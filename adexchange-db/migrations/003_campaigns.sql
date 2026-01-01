-- ============================================================================
-- PHASE 2: CAMPAIGNS & CREATIVES
-- ============================================================================

-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID REFERENCES advertisers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  
  -- Budget
  total_budget DECIMAL(18, 8) NOT NULL,
  daily_budget DECIMAL(18, 8),
  spent_amount DECIMAL(18, 8) DEFAULT 0,
  
  -- Bidding
  max_bid DECIMAL(18, 8) NOT NULL,
  bid_strategy VARCHAR(50) DEFAULT 'highest',
  
  -- Targeting
  target_publishers TEXT[],
  target_ad_slots TEXT[],
  target_geos TEXT[],
  target_devices TEXT[],
  target_os TEXT[],
  target_browsers TEXT[],
  target_age_range INT4RANGE,
  target_interests TEXT[],
  
  -- Schedule
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  
  -- Day parting
  active_hours INTEGER[],
  active_days INTEGER[],
  
  -- Frequency capping
  max_impressions_per_user INTEGER,
  max_impressions_per_day INTEGER,
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft',
  
  -- Metrics
  impressions_won INTEGER DEFAULT 0,
  impressions_served INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  
  -- Performance
  avg_cpm DECIMAL(18, 8),
  avg_cpc DECIMAL(18, 8),
  avg_ctr DECIMAL(5, 4),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_campaigns_advertiser ON campaigns(advertiser_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);

-- Ad Creatives table
CREATE TABLE ad_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Creative details
  name VARCHAR(255),
  format VARCHAR(50) NOT NULL,
  
  -- Assets
  assets JSONB NOT NULL,
  
  -- Ad content
  headline VARCHAR(255),
  description TEXT,
  cta_text VARCHAR(50),
  landing_url TEXT NOT NULL,
  
  -- Dimensions
  width INTEGER,
  height INTEGER,
  duration INTEGER,
  
  -- Review
  review_status VARCHAR(20) DEFAULT 'approved',
  rejection_reason TEXT,
  reviewed_at TIMESTAMP,
  reviewed_by UUID,
  
  -- Performance
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  ctr DECIMAL(5, 4),
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_creatives_campaign ON ad_creatives(campaign_id);
CREATE INDEX idx_creatives_status ON ad_creatives(status);
CREATE INDEX idx_creatives_review ON ad_creatives(review_status);

-- Daily budget tracking
CREATE TABLE daily_budget_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  spent DECIMAL(18, 8) DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(campaign_id, date)
);

CREATE INDEX idx_budget_tracking_campaign ON daily_budget_tracking(campaign_id);
CREATE INDEX idx_budget_tracking_date ON daily_budget_tracking(date);

-- Triggers
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creatives_updated_at BEFORE UPDATE ON ad_creatives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_tracking_updated_at BEFORE UPDATE ON daily_budget_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
