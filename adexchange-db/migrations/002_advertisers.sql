-- ============================================================================
-- PHASE 2: ADVERTISERS
-- ============================================================================

-- Advertisers table
CREATE TABLE advertisers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  
  -- Authentication
  password_hash VARCHAR(255) NOT NULL,
  
  -- Balance tracking
  on_chain_balance DECIMAL(18, 8) DEFAULT 0,
  reserved_balance DECIMAL(18, 8) DEFAULT 0,
  total_spent DECIMAL(18, 8) DEFAULT 0,
  
  -- Verification
  kyc_status VARCHAR(20) DEFAULT 'pending',
  kyc_document_url TEXT,
  
  -- Account status
  status VARCHAR(20) DEFAULT 'active',
  
  -- Billing
  billing_address JSONB,
  payment_method JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_advertisers_wallet ON advertisers(wallet_address);
CREATE INDEX idx_advertisers_email ON advertisers(email);
CREATE INDEX idx_advertisers_status ON advertisers(status);

CREATE TRIGGER update_advertisers_updated_at BEFORE UPDATE ON advertisers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
