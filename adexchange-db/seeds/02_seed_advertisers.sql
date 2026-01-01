-- ============================================================================
-- SEED DATA: ADVERTISERS
-- ============================================================================

-- Insert major advertisers (password for all: 'password123')
INSERT INTO advertisers (wallet_address, company_name, email, password_hash, on_chain_balance, status, kyc_status) VALUES
('0xA111111111111111111111111111111111111111', 'Nike Inc', 'ads@nike.com', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', 10.0, 'active', 'verified'),
('0xA222222222222222222222222222222222222222', 'Adidas AG', 'advertising@adidas.com', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', 8.5, 'active', 'verified'),
('0xA333333333333333333333333333333333333333', 'Amazon Advertising', 'ads@amazon.com', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', 15.0, 'active', 'verified'),
('0xA444444444444444444444444444444444444444', 'Google Ads', 'advertising@google.com', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', 20.0, 'active', 'verified'),
('0xA555555555555555555555555555555555555555', 'Meta Ads', 'ads@meta.com', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', 18.0, 'active', 'verified'),
('0xA666666666666666666666666666666666666666', 'Coca-Cola Company', 'advertising@coca-cola.com', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', 12.0, 'active', 'verified'),
('0xA777777777777777777777777777777777777777', 'Apple Inc', 'ads@apple.com', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', 25.0, 'active', 'verified'),
('0xA888888888888888888888888888888888888888', 'Tesla Inc', 'advertising@tesla.com', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', 14.0, 'active', 'verified'),
('0xA999999999999999999999999999999999999999', 'Netflix Inc', 'ads@netflix.com', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', 16.0, 'active', 'verified'),
('0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'Spotify AB', 'advertising@spotify.com', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', 9.0, 'active', 'verified');

-- Record deposit transactions
DO $$
DECLARE
  adv_record RECORD;
BEGIN
  FOR adv_record IN SELECT id, on_chain_balance FROM advertisers LOOP
    INSERT INTO transactions (
      advertiser_id,
      type,
      amount,
      status,
      notes
    ) VALUES (
      adv_record.id,
      'deposit',
      adv_record.on_chain_balance,
      'confirmed',
      'Initial deposit'
    );
  END LOOP;
END $$;

-- Log the seeding
SELECT log_audit('system', NULL, 'seed_advertisers', 'advertisers', NULL, 'Seeded 10 advertisers', NULL);

ANALYZE advertisers;
ANALYZE transactions;
