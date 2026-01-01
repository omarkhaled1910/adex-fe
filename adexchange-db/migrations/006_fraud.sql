-- ============================================================================
-- PHASE 4: FRAUD DETECTION
-- ============================================================================

-- IP reputation table
CREATE TABLE ip_reputation (
  ip_address INET PRIMARY KEY,
  
  -- Reputation score
  reputation_score DECIMAL(3, 2) DEFAULT 0.50,
  
  -- Counters
  total_requests BIGINT DEFAULT 0,
  fraud_incidents INTEGER DEFAULT 0,
  legitimate_traffic BIGINT DEFAULT 0,
  
  -- Classification
  classification VARCHAR(50),
  
  -- Geo
  country_code VARCHAR(2),
  asn INTEGER,
  isp VARCHAR(255),
  
  -- Status
  blocked BOOLEAN DEFAULT false,
  blocked_at TIMESTAMP,
  block_reason TEXT,
  
  last_seen_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ip_reputation_score ON ip_reputation(reputation_score);
CREATE INDEX idx_ip_reputation_blocked ON ip_reputation(blocked);
CREATE INDEX idx_ip_reputation_country ON ip_reputation(country_code);

-- Fraud rules table
CREATE TABLE fraud_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  rule_type VARCHAR(50) NOT NULL,
  
  -- Rule configuration
  config JSONB NOT NULL,
  
  -- Status
  enabled BOOLEAN DEFAULT true,
  severity VARCHAR(20) DEFAULT 'medium',
  
  -- Actions
  action VARCHAR(50) DEFAULT 'flag',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fraud_rules_type ON fraud_rules(rule_type);
CREATE INDEX idx_fraud_rules_enabled ON fraud_rules(enabled);

-- Fraud incidents table
CREATE TABLE fraud_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Related entities
  impression_id UUID REFERENCES impressions(id),
  auction_id UUID REFERENCES auctions(id),
  publisher_id UUID REFERENCES publishers(id),
  advertiser_id UUID REFERENCES advertisers(id),
  
  -- Fraud details
  fraud_type VARCHAR(50) NOT NULL,
  rule_id UUID REFERENCES fraud_rules(id),
  confidence_score DECIMAL(3, 2),
  
  -- Evidence
  evidence JSONB,
  
  -- Status
  status VARCHAR(20) DEFAULT 'open',
  reviewed_at TIMESTAMP,
  reviewed_by UUID,
  
  -- Actions taken
  action_taken VARCHAR(50),
  refund_amount DECIMAL(18, 8),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fraud_incidents_impression ON fraud_incidents(impression_id);
CREATE INDEX idx_fraud_incidents_publisher ON fraud_incidents(publisher_id);
CREATE INDEX idx_fraud_incidents_type ON fraud_incidents(fraud_type);
CREATE INDEX idx_fraud_incidents_status ON fraud_incidents(status);
CREATE INDEX idx_fraud_incidents_created ON fraud_incidents(created_at);

-- Triggers
CREATE TRIGGER update_ip_reputation_updated_at BEFORE UPDATE ON ip_reputation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fraud_rules_updated_at BEFORE UPDATE ON fraud_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
