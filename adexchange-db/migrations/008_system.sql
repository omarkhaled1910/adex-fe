-- ============================================================================
-- SYSTEM TABLES
-- ============================================================================

-- Admin users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  
  status VARCHAR(20) DEFAULT 'active',
  
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Actor
  actor_type VARCHAR(50) NOT NULL,
  actor_id UUID,
  
  -- Action
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  
  -- Details
  description TEXT,
  metadata JSONB,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_type, actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Platform configuration table
CREATE TABLE platform_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO platform_config (key, value, description) VALUES
('platform_fee_percentage', '5', 'Platform fee as percentage (5 = 5%)'),
('min_floor_price', '0.001', 'Minimum floor price in ETH'),
('max_bid_amount', '1.0', 'Maximum bid amount in ETH'),
('auction_duration_ms', '200', 'Auction duration in milliseconds'),
('attention_threshold', '0.8', 'Required watch percentage for proof (0.8 = 80%)'),
('fraud_score_threshold', '0.7', 'Fraud score threshold for blocking (0.7 = 70%)'),
('min_viewability_time', '1000', 'Minimum time in view (ms) to count as viewable'),
('max_frequency_per_user', '3', 'Maximum impressions per user per campaign per day'),
('settlement_batch_size', '100', 'Number of impressions to settle in one batch'),
('publisher_payout_threshold', '0.1', 'Minimum balance before payout (ETH)');

-- Function to log actions
CREATE OR REPLACE FUNCTION log_audit(
  p_actor_type VARCHAR(50),
  p_actor_id UUID,
  p_action VARCHAR(100),
  p_entity_type VARCHAR(50),
  p_entity_id UUID,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    actor_type, actor_id, action, entity_type, entity_id, description, metadata
  ) VALUES (
    p_actor_type, p_actor_id, p_action, p_entity_type, p_entity_id, p_description, p_metadata
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Create default admin user (password: 'admin123' - CHANGE IN PRODUCTION!)
INSERT INTO admin_users (email, password_hash, name, role)
VALUES (
  'admin@adexchange.com',
  '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', -- bcrypt hash of 'admin123'
  'System Administrator',
  'admin'
);
