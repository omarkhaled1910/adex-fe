-- ============================================================================
-- PHASE 4: ANALYTICS & REPORTING
-- ============================================================================

-- Daily aggregated stats
CREATE TABLE daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  
  -- Entity
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  
  -- Metrics
  auctions INTEGER DEFAULT 0,
  bids INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  
  -- Revenue
  total_spent DECIMAL(18, 8) DEFAULT 0,
  total_earned DECIMAL(18, 8) DEFAULT 0,
  platform_fees DECIMAL(18, 8) DEFAULT 0,
  
  -- Performance
  avg_cpm DECIMAL(18, 8),
  avg_cpc DECIMAL(18, 8),
  avg_ctr DECIMAL(5, 4),
  avg_bid_amount DECIMAL(18, 8),
  
  -- Fraud
  fraud_incidents INTEGER DEFAULT 0,
  blocked_impressions INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(date, entity_type, entity_id)
);

CREATE INDEX idx_daily_stats_date ON daily_stats(date);
CREATE INDEX idx_daily_stats_entity ON daily_stats(entity_type, entity_id);

-- Materialized view for real-time dashboard
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT
  -- Platform totals
  COUNT(DISTINCT a.id) as total_auctions,
  COUNT(DISTINCT b.id) as total_bids,
  COUNT(DISTINCT i.id) as total_impressions,
  SUM(CASE WHEN i.clicked THEN 1 ELSE 0 END) as total_clicks,
  
  -- Revenue
  COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'bid_win'), 0) as total_spent,
  COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'settlement'), 0) as total_earned,
  
  -- Active entities
  COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active') as active_publishers,
  COUNT(DISTINCT adv.id) FILTER (WHERE adv.status = 'active') as active_advertisers,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'active') as active_campaigns,
  
  -- Last 24 hours
  COUNT(DISTINCT a.id) FILTER (WHERE a.created_at > NOW() - INTERVAL '24 hours') as auctions_24h,
  COUNT(DISTINCT i.id) FILTER (WHERE i.created_at > NOW() - INTERVAL '24 hours') as impressions_24h,
  
  -- Updated timestamp
  NOW() as last_updated
FROM auctions a
LEFT JOIN bids b ON a.id = b.auction_id
LEFT JOIN impressions i ON a.id = i.auction_id
LEFT JOIN transactions t ON a.id = t.auction_id
LEFT JOIN publishers p ON a.publisher_id = p.id
LEFT JOIN advertisers adv ON b.advertiser_id = adv.id
LEFT JOIN campaigns c ON b.campaign_id = c.id;

CREATE UNIQUE INDEX ON dashboard_stats ((1)); -- Dummy index for CONCURRENTLY refresh

-- Function to refresh dashboard stats
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
END;
$$ LANGUAGE plpgsql;
