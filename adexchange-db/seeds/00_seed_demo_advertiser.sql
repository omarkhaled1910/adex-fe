-- ============================================================================
-- DEMO ADVERTISER FOR NEXT.JS APP
-- ============================================================================

-- Create demo advertiser with known UUID for API integration
INSERT INTO advertisers (
    id,
    wallet_address,
    company_name,
    email,
    password_hash,
    on_chain_balance,
    reserved_balance,
    total_spent,
    kyc_status,
    status
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    '0xDemoAdvertiser0000000000000000000001',
    'Demo Advertiser Inc.',
    'demo@adexch.io',
    '$2b$10$demohashedpassword', -- In production, use proper bcrypt hash
    10000.00000000,
    0.00000000,
    0.00000000,
    'verified',
    'active'
) ON CONFLICT (id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    email = EXCLUDED.email;

-- Verify the insert
SELECT id, company_name, email, status FROM advertisers WHERE id = 'a0000000-0000-0000-0000-000000000001';

