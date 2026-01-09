-- ============================================================================
-- ENHANCED SEED DATA: MORE REALISTIC PUBLISHERS, ADVERTISERS, AND CAMPAIGNS
-- Run this AFTER the basic seeds to add more rich data
-- ============================================================================

-- ============================================================================
-- ADDITIONAL PUBLISHERS WITH REALISTIC DATA
-- ============================================================================

INSERT INTO publishers (domain, company_name, email, api_key, api_secret_hash, wallet_address, status, tier, website_category, monthly_pageviews, domain_verified)
VALUES
-- Tech Publishers
('wired.com', 'Wired Media', 'ads@wired.com', 'pub_wired_a1b2c3d4e5f6g7h8', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0xB111111111111111111111111111111111111111', 'active', 'premium', 'technology', 180000000, true),
('theverge.com', 'Vox Media - The Verge', 'advertising@theverge.com', 'pub_verge_b2c3d4e5f6g7h8i9', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0xB222222222222222222222222222222222222222', 'active', 'premium', 'technology', 250000000, true),
('arstechnica.com', 'Ars Technica', 'ads@arstechnica.com', 'pub_ars_c3d4e5f6g7h8i9j0', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0xB333333333333333333333333333333333333333', 'active', 'premium', 'technology', 120000000, true),
('cnet.com', 'CNET Media', 'advertising@cnet.com', 'pub_cnet_d4e5f6g7h8i9j0k1', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0xB444444444444444444444444444444444444444', 'active', 'premium', 'technology', 200000000, true),
('engadget.com', 'Engadget', 'ads@engadget.com', 'pub_engadget_e5f6g7h8i9j0k1l2', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0xB555555555555555555555555555555555555555', 'active', 'standard', 'technology', 100000000, true),

-- Entertainment Publishers
('ign.com', 'IGN Entertainment', 'advertising@ign.com', 'pub_ign_f6g7h8i9j0k1l2m3', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0xB666666666666666666666666666666666666666', 'active', 'premium', 'gaming', 350000000, true),
('gamespot.com', 'GameSpot', 'ads@gamespot.com', 'pub_gamespot_g7h8i9j0k1l2m3n4', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0xB777777777777777777777777777777777777777', 'active', 'premium', 'gaming', 180000000, true),
('polygon.com', 'Polygon', 'advertising@polygon.com', 'pub_polygon_h8i9j0k1l2m3n4o5', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0xB888888888888888888888888888888888888888', 'active', 'standard', 'gaming', 90000000, true),
('variety.com', 'Variety Entertainment', 'ads@variety.com', 'pub_variety_i9j0k1l2m3n4o5p6', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0xB999999999999999999999999999999999999999', 'active', 'premium', 'entertainment', 150000000, true),
('hollywoodreporter.com', 'The Hollywood Reporter', 'advertising@hollywoodreporter.com', 'pub_thr_j0k1l2m3n4o5p6q7', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0xBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'active', 'premium', 'entertainment', 130000000, true),

-- Lifestyle Publishers
('vogue.com', 'Vogue', 'ads@vogue.com', 'pub_vogue_k1l2m3n4o5p6q7r8', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB', 'active', 'premium', 'fashion', 200000000, true),
('gq.com', 'GQ Magazine', 'advertising@gq.com', 'pub_gq_l2m3n4o5p6q7r8s9', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0xBCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC', 'active', 'premium', 'fashion', 120000000, true),
('foodnetwork.com', 'Food Network', 'ads@foodnetwork.com', 'pub_food_m3n4o5p6q7r8s9t0', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0xBDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD', 'active', 'standard', 'food', 180000000, true),

-- Finance Publishers
('bloomberg.com', 'Bloomberg Media', 'advertising@bloomberg.com', 'pub_bloom_n4o5p6q7r8s9t0u1', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0xBEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', 'active', 'premium', 'finance', 400000000, true),
('wsj.com', 'Wall Street Journal', 'ads@wsj.com', 'pub_wsj_o5p6q7r8s9t0u1v2', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0xBFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', 'active', 'premium', 'finance', 450000000, true)

ON CONFLICT (domain) DO UPDATE SET
  monthly_pageviews = EXCLUDED.monthly_pageviews,
  status = 'active';

-- ============================================================================
-- ADD MORE AD SLOTS FOR NEW PUBLISHERS
-- ============================================================================

DO $$
DECLARE
  pub_record RECORD;
BEGIN
  FOR pub_record IN 
    SELECT id, domain FROM publishers 
    WHERE domain IN ('wired.com', 'theverge.com', 'arstechnica.com', 'cnet.com', 'engadget.com',
                     'ign.com', 'gamespot.com', 'polygon.com', 'variety.com', 'hollywoodreporter.com',
                     'vogue.com', 'gq.com', 'foodnetwork.com', 'bloomberg.com', 'wsj.com')
  LOOP
    -- Check if ad slots already exist for this publisher
    IF NOT EXISTS (SELECT 1 FROM ad_slots WHERE publisher_id = pub_record.id) THEN
      -- Premium banner slot
      INSERT INTO ad_slots (publisher_id, slot_name, slot_type, width, height, floor_price, status)
      VALUES (pub_record.id, 'homepage_banner_top', 'banner', 970, 90, 0.028, 'active');
      
      -- Medium rectangle
      INSERT INTO ad_slots (publisher_id, slot_name, slot_type, width, height, floor_price, status)
      VALUES (pub_record.id, 'article_sidebar', 'banner', 300, 250, 0.020, 'active');
      
      -- Video pre-roll
      INSERT INTO ad_slots (publisher_id, slot_name, slot_type, width, height, floor_price, status)
      VALUES (pub_record.id, 'video_pre_roll', 'video', 1920, 1080, 0.045, 'active');
      
      -- Native feed
      INSERT INTO ad_slots (publisher_id, slot_name, slot_type, width, height, floor_price, status)
      VALUES (pub_record.id, 'native_feed', 'native', NULL, NULL, 0.032, 'active');
      
      -- Mobile banner
      INSERT INTO ad_slots (publisher_id, slot_name, slot_type, width, height, floor_price, status)
      VALUES (pub_record.id, 'mobile_banner', 'banner', 320, 50, 0.015, 'active');
      
      -- Half-page
      INSERT INTO ad_slots (publisher_id, slot_name, slot_type, width, height, floor_price, status)
      VALUES (pub_record.id, 'article_half_page', 'banner', 300, 600, 0.025, 'active');
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- ADDITIONAL ADVERTISERS
-- ============================================================================

INSERT INTO advertisers (wallet_address, company_name, email, password_hash, on_chain_balance, status, kyc_status)
VALUES
-- Tech Giants
('0xC111111111111111111111111111111111111111', 'Microsoft Corporation', 'ads@microsoft.com', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', 30.0, 'active', 'verified'),
('0xC222222222222222222222222222222222222222', 'Samsung Electronics', 'advertising@samsung.com', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', 22.0, 'active', 'verified'),
('0xC333333333333333333333333333333333333333', 'Intel Corporation', 'ads@intel.com', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', 18.0, 'active', 'verified'),
('0xC444444444444444444444444444444444444444', 'NVIDIA Corporation', 'advertising@nvidia.com', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', 25.0, 'active', 'verified'),

-- Consumer Brands
('0xC555555555555555555555555555555555555555', 'Procter & Gamble', 'ads@pg.com', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', 20.0, 'active', 'verified'),
('0xC666666666666666666666666666666666666666', 'Unilever', 'advertising@unilever.com', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', 18.0, 'active', 'verified'),
('0xC777777777777777777777777777777777777777', 'PepsiCo', 'ads@pepsico.com', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', 15.0, 'active', 'verified'),
('0xC888888888888888888888888888888888888888', 'McDonalds Corporation', 'advertising@mcdonalds.com', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', 16.0, 'active', 'verified'),

-- Automotive
('0xC999999999999999999999999999999999999999', 'BMW Group', 'ads@bmw.com', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', 19.0, 'active', 'verified'),
('0xCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'Mercedes-Benz', 'advertising@mercedes-benz.com', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', 21.0, 'active', 'verified'),

-- Gaming
('0xCBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB', 'Sony Interactive', 'ads@playstation.com', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', 17.0, 'active', 'verified'),
('0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC', 'Xbox Game Studios', 'advertising@xbox.com', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', 16.0, 'active', 'verified'),
('0xCDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD', 'Nintendo', 'ads@nintendo.com', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', 14.0, 'active', 'verified')

ON CONFLICT (wallet_address) DO UPDATE SET
  on_chain_balance = EXCLUDED.on_chain_balance,
  status = 'active';

-- ============================================================================
-- ADDITIONAL CAMPAIGNS FOR NEW ADVERTISERS
-- ============================================================================

DO $$
DECLARE
  microsoft_id UUID;
  samsung_id UUID;
  intel_id UUID;
  nvidia_id UUID;
  pg_id UUID;
  unilever_id UUID;
  pepsi_id UUID;
  mcdonalds_id UUID;
  bmw_id UUID;
  mercedes_id UUID;
  sony_id UUID;
  xbox_id UUID;
  nintendo_id UUID;
BEGIN
  -- Get advertiser IDs
  SELECT id INTO microsoft_id FROM advertisers WHERE company_name = 'Microsoft Corporation';
  SELECT id INTO samsung_id FROM advertisers WHERE company_name = 'Samsung Electronics';
  SELECT id INTO intel_id FROM advertisers WHERE company_name = 'Intel Corporation';
  SELECT id INTO nvidia_id FROM advertisers WHERE company_name = 'NVIDIA Corporation';
  SELECT id INTO pg_id FROM advertisers WHERE company_name = 'Procter & Gamble';
  SELECT id INTO unilever_id FROM advertisers WHERE company_name = 'Unilever';
  SELECT id INTO pepsi_id FROM advertisers WHERE company_name = 'PepsiCo';
  SELECT id INTO mcdonalds_id FROM advertisers WHERE company_name = 'McDonalds Corporation';
  SELECT id INTO bmw_id FROM advertisers WHERE company_name = 'BMW Group';
  SELECT id INTO mercedes_id FROM advertisers WHERE company_name = 'Mercedes-Benz';
  SELECT id INTO sony_id FROM advertisers WHERE company_name = 'Sony Interactive';
  SELECT id INTO xbox_id FROM advertisers WHERE company_name = 'Xbox Game Studios';
  SELECT id INTO nintendo_id FROM advertisers WHERE company_name = 'Nintendo';

  -- Microsoft Campaigns
  IF microsoft_id IS NOT NULL THEN
    INSERT INTO campaigns (advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy, target_publishers, target_ad_slots, target_geos, target_devices, start_date, end_date, status, category)
    VALUES
    (microsoft_id, 'Windows 12 Global Launch', 15.0, 0.6, 0.085, 'highest', ARRAY['techcrunch.com', 'theverge.com', 'wired.com', 'cnet.com'], ARRAY['homepage_banner_top', 'video_pre_roll', 'native_feed'], ARRAY['US', 'UK', 'DE', 'FR', 'JP', 'CA'], ARRAY['desktop', 'tablet'], NOW() - INTERVAL '5 days', NOW() + INTERVAL '90 days', 'active', 'tech'),
    (microsoft_id, 'Microsoft 365 Business', 10.0, 0.4, 0.072, 'target_cpm', ARRAY['forbes.com', 'wsj.com', 'bloomberg.com'], ARRAY['banner_top', 'native_sponsored'], ARRAY['US', 'UK', 'DE'], ARRAY['desktop'], NOW() - INTERVAL '10 days', NOW() + INTERVAL '120 days', 'active', 'tech'),
    (microsoft_id, 'Azure Cloud Services', 12.0, 0.5, 0.078, 'dynamic', ARRAY['techcrunch.com', 'arstechnica.com', 'wired.com'], ARRAY['banner_top', 'sidebar_right', 'native_feed'], ARRAY['US', 'IN', 'UK', 'DE'], ARRAY['desktop'], NOW() - INTERVAL '3 days', NOW() + INTERVAL '180 days', 'active', 'tech'),
    (microsoft_id, 'Surface Pro Launch', 8.0, 0.35, 0.068, 'highest', ARRAY['theverge.com', 'engadget.com', 'cnet.com'], ARRAY['video_pre_roll', 'homepage_banner_top'], ARRAY['US', 'CA', 'UK', 'AU'], ARRAY['desktop', 'mobile'], NOW() - INTERVAL '7 days', NOW() + INTERVAL '60 days', 'active', 'tech');
  END IF;

  -- Samsung Campaigns
  IF samsung_id IS NOT NULL THEN
    INSERT INTO campaigns (advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy, target_publishers, target_ad_slots, target_geos, target_devices, start_date, end_date, status, category)
    VALUES
    (samsung_id, 'Galaxy S26 Ultra Launch', 12.0, 0.5, 0.080, 'highest', ARRAY['techcrunch.com', 'theverge.com', 'cnet.com', 'engadget.com'], ARRAY['video_pre_roll', 'homepage_banner_top', 'native_feed'], ARRAY['US', 'UK', 'KR', 'DE', 'FR'], ARRAY['mobile', 'desktop'], NOW() - INTERVAL '2 days', NOW() + INTERVAL '45 days', 'active', 'tech'),
    (samsung_id, 'Samsung Smart TV', 7.0, 0.32, 0.065, 'dynamic', ARRAY['variety.com', 'cnet.com', 'theverge.com'], ARRAY['video_pre_roll', 'banner_top'], ARRAY['US', 'UK', 'CA'], ARRAY['desktop', 'tablet'], NOW() - INTERVAL '8 days', NOW() + INTERVAL '75 days', 'active', 'tech'),
    (samsung_id, 'Galaxy Watch Health', 5.5, 0.26, 0.058, 'target_cpm', ARRAY['espn.com', 'menshealth.com'], ARRAY['banner_top', 'native_feed'], ARRAY['US', 'UK', 'KR'], ARRAY['mobile'], NOW() - INTERVAL '4 days', NOW() + INTERVAL '60 days', 'active', 'tech');
  END IF;

  -- NVIDIA Campaigns
  IF nvidia_id IS NOT NULL THEN
    INSERT INTO campaigns (advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy, target_publishers, target_ad_slots, target_geos, target_devices, start_date, end_date, status, category)
    VALUES
    (nvidia_id, 'GeForce RTX 5090 Launch', 14.0, 0.55, 0.088, 'highest', ARRAY['ign.com', 'gamespot.com', 'polygon.com', 'techcrunch.com'], ARRAY['video_pre_roll', 'homepage_banner_top', 'native_feed'], ARRAY['US', 'UK', 'DE', 'JP', 'KR'], ARRAY['desktop'], NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', 'active', 'gaming'),
    (nvidia_id, 'NVIDIA AI Enterprise', 10.0, 0.42, 0.075, 'target_cpm', ARRAY['techcrunch.com', 'wired.com', 'arstechnica.com'], ARRAY['banner_top', 'native_sponsored'], ARRAY['US', 'UK', 'DE', 'IN'], ARRAY['desktop'], NOW() - INTERVAL '12 days', NOW() + INTERVAL '120 days', 'active', 'tech'),
    (nvidia_id, 'GeForce NOW Cloud Gaming', 8.0, 0.36, 0.068, 'dynamic', ARRAY['ign.com', 'polygon.com', 'gamespot.com'], ARRAY['video_pre_roll', 'native_feed'], ARRAY['US', 'UK', 'CA', 'DE'], ARRAY['desktop', 'mobile'], NOW() - INTERVAL '6 days', NOW() + INTERVAL '90 days', 'active', 'gaming');
  END IF;

  -- Sony PlayStation Campaigns
  IF sony_id IS NOT NULL THEN
    INSERT INTO campaigns (advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy, target_publishers, target_ad_slots, target_geos, target_devices, start_date, end_date, status, category)
    VALUES
    (sony_id, 'PS5 Exclusive Games 2026', 10.0, 0.45, 0.078, 'highest', ARRAY['ign.com', 'gamespot.com', 'polygon.com', 'kotaku.com'], ARRAY['video_pre_roll', 'homepage_banner_top'], ARRAY['US', 'UK', 'JP', 'DE', 'FR'], ARRAY['desktop', 'mobile'], NOW() - INTERVAL '3 days', NOW() + INTERVAL '60 days', 'active', 'gaming'),
    (sony_id, 'PlayStation Plus Premium', 6.5, 0.30, 0.062, 'dynamic', ARRAY['ign.com', 'gamespot.com', 'reddit.com'], ARRAY['banner_top', 'native_feed'], ARRAY['US', 'UK', 'CA', 'AU'], ARRAY['desktop', 'mobile'], NOW() - INTERVAL '9 days', NOW() + INTERVAL '90 days', 'active', 'gaming'),
    (sony_id, 'PlayStation VR2 Games', 5.0, 0.24, 0.056, 'target_cpm', ARRAY['ign.com', 'roadtovr.com', 'uploadvr.com'], ARRAY['video_pre_roll', 'native_feed'], ARRAY['US', 'UK', 'JP'], ARRAY['desktop'], NOW() - INTERVAL '5 days', NOW() + INTERVAL '45 days', 'active', 'gaming');
  END IF;

  -- Xbox Campaigns
  IF xbox_id IS NOT NULL THEN
    INSERT INTO campaigns (advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy, target_publishers, target_ad_slots, target_geos, target_devices, start_date, end_date, status, category)
    VALUES
    (xbox_id, 'Xbox Game Pass Ultimate', 9.0, 0.40, 0.072, 'highest', ARRAY['ign.com', 'gamespot.com', 'polygon.com'], ARRAY['video_pre_roll', 'homepage_banner_top', 'native_feed'], ARRAY['US', 'UK', 'CA', 'AU', 'DE'], ARRAY['desktop', 'mobile'], NOW() - INTERVAL '4 days', NOW() + INTERVAL '90 days', 'active', 'gaming'),
    (xbox_id, 'Halo Infinite Season 5', 6.0, 0.28, 0.060, 'dynamic', ARRAY['ign.com', 'gamespot.com', 'reddit.com'], ARRAY['video_pre_roll', 'native_feed'], ARRAY['US', 'UK', 'CA'], ARRAY['desktop'], NOW() - INTERVAL '7 days', NOW() + INTERVAL '45 days', 'active', 'gaming'),
    (xbox_id, 'Xbox Cloud Gaming', 7.0, 0.32, 0.065, 'target_cpm', ARRAY['theverge.com', 'engadget.com', 'ign.com'], ARRAY['banner_top', 'native_feed'], ARRAY['US', 'UK', 'DE', 'JP'], ARRAY['mobile', 'tablet'], NOW() - INTERVAL '10 days', NOW() + INTERVAL '120 days', 'active', 'gaming');
  END IF;

  -- Nintendo Campaigns
  IF nintendo_id IS NOT NULL THEN
    INSERT INTO campaigns (advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy, target_publishers, target_ad_slots, target_geos, target_devices, start_date, end_date, status, category)
    VALUES
    (nintendo_id, 'Nintendo Switch 2 Launch', 11.0, 0.48, 0.082, 'highest', ARRAY['ign.com', 'gamespot.com', 'polygon.com', 'kotaku.com'], ARRAY['video_pre_roll', 'homepage_banner_top'], ARRAY['US', 'UK', 'JP', 'DE', 'FR'], ARRAY['desktop', 'mobile'], NOW() - INTERVAL '1 day', NOW() + INTERVAL '60 days', 'active', 'gaming'),
    (nintendo_id, 'Pokemon Legends 2', 8.0, 0.36, 0.070, 'dynamic', ARRAY['ign.com', 'gamespot.com', 'polygon.com'], ARRAY['video_pre_roll', 'native_feed'], ARRAY['US', 'UK', 'JP', 'CA'], ARRAY['mobile', 'desktop'], NOW() - INTERVAL '5 days', NOW() + INTERVAL '45 days', 'active', 'gaming'),
    (nintendo_id, 'Legend of Zelda Collection', 6.5, 0.30, 0.064, 'highest', ARRAY['ign.com', 'kotaku.com', 'polygon.com'], ARRAY['banner_top', 'video_pre_roll'], ARRAY['US', 'UK', 'JP'], ARRAY['desktop'], NOW() - INTERVAL '8 days', NOW() + INTERVAL '75 days', 'active', 'gaming');
  END IF;

  -- BMW Campaigns
  IF bmw_id IS NOT NULL THEN
    INSERT INTO campaigns (advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy, target_publishers, target_ad_slots, target_geos, target_devices, start_date, end_date, status, category)
    VALUES
    (bmw_id, 'BMW i7 Electric Luxury', 10.0, 0.42, 0.076, 'highest', ARRAY['forbes.com', 'wsj.com', 'bloomberg.com'], ARRAY['video_pre_roll', 'homepage_banner_top'], ARRAY['US', 'UK', 'DE', 'CH'], ARRAY['desktop', 'tablet'], NOW() - INTERVAL '6 days', NOW() + INTERVAL '90 days', 'active', 'automotive'),
    (bmw_id, 'BMW M Performance', 7.5, 0.34, 0.068, 'dynamic', ARRAY['espn.com', 'motortrend.com', 'caranddriver.com'], ARRAY['video_pre_roll', 'native_feed'], ARRAY['US', 'UK', 'DE'], ARRAY['desktop', 'mobile'], NOW() - INTERVAL '10 days', NOW() + INTERVAL '60 days', 'active', 'automotive');
  END IF;

  -- Mercedes Campaigns
  IF mercedes_id IS NOT NULL THEN
    INSERT INTO campaigns (advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy, target_publishers, target_ad_slots, target_geos, target_devices, start_date, end_date, status, category)
    VALUES
    (mercedes_id, 'Mercedes EQS SUV', 11.0, 0.46, 0.080, 'highest', ARRAY['forbes.com', 'wsj.com', 'bloomberg.com', 'cnn.com'], ARRAY['video_pre_roll', 'homepage_banner_top'], ARRAY['US', 'UK', 'DE', 'FR', 'CH'], ARRAY['desktop', 'tablet'], NOW() - INTERVAL '4 days', NOW() + INTERVAL '75 days', 'active', 'automotive'),
    (mercedes_id, 'Mercedes AMG GT', 8.0, 0.36, 0.072, 'dynamic', ARRAY['espn.com', 'caranddriver.com', 'topgear.com'], ARRAY['video_pre_roll', 'native_feed'], ARRAY['US', 'UK', 'DE'], ARRAY['desktop'], NOW() - INTERVAL '8 days', NOW() + INTERVAL '60 days', 'active', 'automotive');
  END IF;

  -- McDonalds Campaigns
  IF mcdonalds_id IS NOT NULL THEN
    INSERT INTO campaigns (advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy, target_publishers, target_ad_slots, target_geos, target_devices, start_date, end_date, status, category)
    VALUES
    (mcdonalds_id, 'McDonalds App Deals', 8.0, 0.38, 0.065, 'highest', ARRAY['buzzfeed.com', 'reddit.com', 'foodnetwork.com'], ARRAY['banner_top', 'native_feed', 'mobile_banner'], ARRAY['US', 'CA', 'UK'], ARRAY['mobile'], NOW() - INTERVAL '3 days', NOW() + INTERVAL '45 days', 'active', 'food_bev'),
    (mcdonalds_id, 'McDonalds Celebrity Meal', 6.5, 0.30, 0.058, 'dynamic', ARRAY['buzzfeed.com', 'tmz.com', 'eonline.com'], ARRAY['video_pre_roll', 'native_feed'], ARRAY['US', 'UK', 'CA'], ARRAY['mobile', 'desktop'], NOW() - INTERVAL '7 days', NOW() + INTERVAL '30 days', 'active', 'food_bev');
  END IF;

  -- PepsiCo Campaigns
  IF pepsi_id IS NOT NULL THEN
    INSERT INTO campaigns (advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy, target_publishers, target_ad_slots, target_geos, target_devices, start_date, end_date, status, category)
    VALUES
    (pepsi_id, 'Pepsi Zero Sugar', 7.0, 0.32, 0.060, 'highest', ARRAY['espn.com', 'buzzfeed.com', 'reddit.com'], ARRAY['video_pre_roll', 'banner_top'], ARRAY['US', 'CA', 'MX'], ARRAY['mobile', 'desktop'], NOW() - INTERVAL '5 days', NOW() + INTERVAL '60 days', 'active', 'food_bev'),
    (pepsi_id, 'Doritos Super Bowl', 9.0, 0.42, 0.072, 'highest', ARRAY['espn.com', 'bleacherreport.com', 'nfl.com'], ARRAY['video_pre_roll', 'homepage_takeover'], ARRAY['US'], ARRAY['desktop', 'mobile', 'tablet'], NOW() - INTERVAL '2 days', NOW() + INTERVAL '30 days', 'active', 'food_bev'),
    (pepsi_id, 'Mountain Dew Gaming', 5.5, 0.26, 0.055, 'dynamic', ARRAY['ign.com', 'gamespot.com', 'twitch.tv'], ARRAY['video_pre_roll', 'native_feed'], ARRAY['US', 'CA', 'UK'], ARRAY['desktop'], NOW() - INTERVAL '9 days', NOW() + INTERVAL '75 days', 'active', 'food_bev');
  END IF;

END $$;

-- ============================================================================
-- CREATE CREATIVES FOR ALL NEW CAMPAIGNS
-- ============================================================================

DO $$
DECLARE
  campaign_rec RECORD;
  creative_count INTEGER := 0;
BEGIN
  FOR campaign_rec IN 
    SELECT c.id, c.name, c.advertiser_id, a.company_name
    FROM campaigns c
    JOIN advertisers a ON c.advertiser_id = a.id
    WHERE c.status = 'active'
    AND NOT EXISTS (SELECT 1 FROM ad_creatives WHERE campaign_id = c.id)
  LOOP
    -- Banner creative 728x90
    INSERT INTO ad_creatives (campaign_id, name, format, assets, headline, description, cta_text, landing_url, width, height, review_status, status)
    VALUES (
      campaign_rec.id,
      campaign_rec.name || ' - Leaderboard Banner',
      'banner',
      jsonb_build_object('image_url', 'https://via.placeholder.com/728x90?text=' || replace(split_part(campaign_rec.company_name, ' ', 1), ' ', '+')),
      'Discover ' || split_part(campaign_rec.company_name, ' ', 1),
      'Experience the best from ' || campaign_rec.company_name || '. Limited time offer!',
      'Learn More',
      'https://example.com/click/' || encode(gen_random_bytes(8), 'hex'),
      728, 90, 'approved', 'active'
    );

    -- Banner creative 300x250
    INSERT INTO ad_creatives (campaign_id, name, format, assets, headline, description, cta_text, landing_url, width, height, review_status, status)
    VALUES (
      campaign_rec.id,
      campaign_rec.name || ' - Medium Rectangle',
      'banner',
      jsonb_build_object('image_url', 'https://via.placeholder.com/300x250?text=' || replace(split_part(campaign_rec.company_name, ' ', 1), ' ', '+')),
      'Shop ' || split_part(campaign_rec.company_name, ' ', 1),
      'Don''t miss out on exclusive deals!',
      'Shop Now',
      'https://example.com/click/' || encode(gen_random_bytes(8), 'hex'),
      300, 250, 'approved', 'active'
    );

    -- Banner creative 970x90
    INSERT INTO ad_creatives (campaign_id, name, format, assets, headline, description, cta_text, landing_url, width, height, review_status, status)
    VALUES (
      campaign_rec.id,
      campaign_rec.name || ' - Large Leaderboard',
      'banner',
      jsonb_build_object('image_url', 'https://via.placeholder.com/970x90?text=' || replace(split_part(campaign_rec.company_name, ' ', 1), ' ', '+')),
      'Premium ' || split_part(campaign_rec.company_name, ' ', 1) || ' Experience',
      'Elevate your experience with our latest offerings.',
      'Explore',
      'https://example.com/click/' || encode(gen_random_bytes(8), 'hex'),
      970, 90, 'approved', 'active'
    );

    -- Video creative 1920x1080
    INSERT INTO ad_creatives (campaign_id, name, format, assets, headline, description, cta_text, landing_url, width, height, duration, review_status, status)
    VALUES (
      campaign_rec.id,
      campaign_rec.name || ' - HD Video',
      'video',
      jsonb_build_object(
        'video_url', 'https://example.com/videos/' || encode(gen_random_bytes(8), 'hex') || '.mp4',
        'thumbnail_url', 'https://via.placeholder.com/1920x1080?text=Video'
      ),
      'Watch: ' || split_part(campaign_rec.company_name, ' ', 1) || ' Story',
      'See what makes us different. Watch now.',
      'Watch Now',
      'https://example.com/video/' || encode(gen_random_bytes(8), 'hex'),
      1920, 1080, 30, 'approved', 'active'
    );

    -- Video creative 1280x720
    INSERT INTO ad_creatives (campaign_id, name, format, assets, headline, description, cta_text, landing_url, width, height, duration, review_status, status)
    VALUES (
      campaign_rec.id,
      campaign_rec.name || ' - 720p Video',
      'video',
      jsonb_build_object(
        'video_url', 'https://example.com/videos/' || encode(gen_random_bytes(8), 'hex') || '.mp4',
        'thumbnail_url', 'https://via.placeholder.com/1280x720?text=Video'
      ),
      split_part(campaign_rec.company_name, ' ', 1) || ' in Action',
      'Experience excellence. Watch our latest video.',
      'Play Video',
      'https://example.com/video/' || encode(gen_random_bytes(8), 'hex'),
      1280, 720, 15, 'approved', 'active'
    );

    -- Native creative
    INSERT INTO ad_creatives (campaign_id, name, format, assets, headline, description, cta_text, landing_url, review_status, status)
    VALUES (
      campaign_rec.id,
      campaign_rec.name || ' - Native Ad',
      'native',
      jsonb_build_object(
        'image_url', 'https://via.placeholder.com/600x400?text=Native+Ad',
        'logo_url', 'https://via.placeholder.com/100x100?text=Logo'
      ),
      'Sponsored: ' || split_part(campaign_rec.company_name, ' ', 1),
      'Discover why millions choose ' || campaign_rec.company_name || '. Learn more about our innovative solutions.',
      'Learn More',
      'https://example.com/native/' || encode(gen_random_bytes(8), 'hex'),
      'approved', 'active'
    );

    -- Mobile banner 320x50
    INSERT INTO ad_creatives (campaign_id, name, format, assets, headline, description, cta_text, landing_url, width, height, review_status, status)
    VALUES (
      campaign_rec.id,
      campaign_rec.name || ' - Mobile Banner',
      'banner',
      jsonb_build_object('image_url', 'https://via.placeholder.com/320x50?text=' || replace(split_part(campaign_rec.company_name, ' ', 1), ' ', '+')),
      split_part(campaign_rec.company_name, ' ', 1) || ' Mobile',
      'Tap to discover more!',
      'Tap Now',
      'https://example.com/mobile/' || encode(gen_random_bytes(8), 'hex'),
      320, 50, 'approved', 'active'
    );

    creative_count := creative_count + 7;
  END LOOP;

  RAISE NOTICE 'Created % creatives for new campaigns', creative_count;
END $$;

-- ============================================================================
-- RECORD DEPOSIT TRANSACTIONS FOR NEW ADVERTISERS
-- ============================================================================

INSERT INTO transactions (advertiser_id, type, amount, status, notes)
SELECT id, 'deposit', on_chain_balance, 'confirmed', 'Initial deposit'
FROM advertisers
WHERE NOT EXISTS (
  SELECT 1 FROM transactions t 
  WHERE t.advertiser_id = advertisers.id AND t.type = 'deposit'
);

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

-- Show summary
SELECT 'Publishers' as entity, COUNT(*) as count FROM publishers WHERE status = 'active'
UNION ALL
SELECT 'Advertisers', COUNT(*) FROM advertisers WHERE status = 'active'
UNION ALL
SELECT 'Campaigns', COUNT(*) FROM campaigns WHERE status = 'active'
UNION ALL
SELECT 'Ad Creatives', COUNT(*) FROM ad_creatives WHERE status = 'active'
UNION ALL
SELECT 'Ad Slots', COUNT(*) FROM ad_slots WHERE status = 'active';

-- Log the seeding
SELECT log_audit('system', NULL, 'seed_enhanced_data', 'multiple', NULL, 'Seeded enhanced realistic data for publishers, advertisers, campaigns, and creatives', NULL);

ANALYZE publishers;
ANALYZE advertisers;
ANALYZE campaigns;
ANALYZE ad_creatives;
ANALYZE ad_slots;
