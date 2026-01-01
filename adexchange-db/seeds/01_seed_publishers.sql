-- ============================================================================
-- SEED DATA: PUBLISHERS
-- ============================================================================

-- Insert major publishers
INSERT INTO publishers (domain, company_name, email, api_key, api_secret_hash, wallet_address, status, tier, website_category, monthly_pageviews, domain_verified) VALUES
('cnn.com', 'CNN Digital', 'ads@cnn.com', 'pub_cnn_8f3a9b2c1d4e5f6g', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0x1234567890123456789012345678901234567890', 'active', 'premium', 'news', 500000000, true),
('nytimes.com', 'The New York Times', 'advertising@nytimes.com', 'pub_nyt_7e2a8b1c0d3e4f5g', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0x2345678901234567890123456789012345678901', 'active', 'premium', 'news', 600000000, true),
('techcrunch.com', 'TechCrunch', 'ads@techcrunch.com', 'pub_tc_6d1a7b0c9d2e3f4g', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0x3456789012345678901234567890123456789012', 'active', 'premium', 'technology', 200000000, true),
('reddit.com', 'Reddit Inc', 'advertising@reddit.com', 'pub_reddit_5c0a6b9c8d1e2f3g', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0x4567890123456789012345678901234567890123', 'active', 'premium', 'social', 1000000000, true),
('medium.com', 'Medium Corporation', 'ads@medium.com', 'pub_medium_4b9a5c8d7e0f1g2h', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0x5678901234567890123456789012345678901234', 'active', 'standard', 'blogging', 150000000, true),
('espn.com', 'ESPN Digital', 'ads@espn.com', 'pub_espn_3a8b4c7d6e9f0g1h', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0x6789012345678901234567890123456789012345', 'active', 'premium', 'sports', 400000000, true),
('forbes.com', 'Forbes Media', 'advertising@forbes.com', 'pub_forbes_2a7b3c6d5e8f9g0h', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0x7890123456789012345678901234567890123456', 'active', 'premium', 'business', 300000000, true),
('buzzfeed.com', 'BuzzFeed Inc', 'ads@buzzfeed.com', 'pub_buzz_1a6b2c5d4e7f8g9h', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0x8901234567890123456789012345678901234567', 'active', 'standard', 'entertainment', 250000000, true),
('theguardian.com', 'The Guardian', 'ads@theguardian.com', 'pub_guard_0a5b1c4d3e6f7g8h', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0x9012345678901234567890123456789012345678', 'active', 'premium', 'news', 350000000, true),
('washingtonpost.com', 'The Washington Post', 'advertising@washingtonpost.com', 'pub_wapo_9a4b0c3d2e5f6g7h', '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', '0x0123456789012345678901234567890123456789', 'active', 'premium', 'news', 380000000, true);

-- Get publisher IDs for ad slots
DO $$
DECLARE
  cnn_id UUID;
  nyt_id UUID;
  tc_id UUID;
  reddit_id UUID;
  medium_id UUID;
  espn_id UUID;
  forbes_id UUID;
  buzz_id UUID;
  guard_id UUID;
  wapo_id UUID;
BEGIN
  SELECT id INTO cnn_id FROM publishers WHERE domain = 'cnn.com';
  SELECT id INTO nyt_id FROM publishers WHERE domain = 'nytimes.com';
  SELECT id INTO tc_id FROM publishers WHERE domain = 'techcrunch.com';
  SELECT id INTO reddit_id FROM publishers WHERE domain = 'reddit.com';
  SELECT id INTO medium_id FROM publishers WHERE domain = 'medium.com';
  SELECT id INTO espn_id FROM publishers WHERE domain = 'espn.com';
  SELECT id INTO forbes_id FROM publishers WHERE domain = 'forbes.com';
  SELECT id INTO buzz_id FROM publishers WHERE domain = 'buzzfeed.com';
  SELECT id INTO guard_id FROM publishers WHERE domain = 'theguardian.com';
  SELECT id INTO wapo_id FROM publishers WHERE domain = 'washingtonpost.com';

  -- CNN ad slots
  INSERT INTO ad_slots (publisher_id, slot_name, slot_type, width, height, floor_price, status) VALUES
  (cnn_id, 'homepage_banner_top', 'banner', 728, 90, 0.025, 'active'),
  (cnn_id, 'article_sidebar_right', 'banner', 300, 250, 0.020, 'active'),
  (cnn_id, 'video_pre_roll', 'video', 1920, 1080, 0.045, 'active'),
  (cnn_id, 'native_feed', 'native', NULL, NULL, 0.030, 'active');

  -- New York Times ad slots
  INSERT INTO ad_slots (publisher_id, slot_name, slot_type, width, height, floor_price, status) VALUES
  (nyt_id, 'homepage_leaderboard', 'banner', 970, 90, 0.030, 'active'),
  (nyt_id, 'article_inline', 'banner', 300, 600, 0.028, 'active'),
  (nyt_id, 'video_pre_roll', 'video', 1920, 1080, 0.050, 'active'),
  (nyt_id, 'mobile_banner', 'banner', 320, 50, 0.015, 'active');

  -- TechCrunch ad slots
  INSERT INTO ad_slots (publisher_id, slot_name, slot_type, width, height, floor_price, status) VALUES
  (tc_id, 'header_banner', 'banner', 728, 90, 0.022, 'active'),
  (tc_id, 'sidebar_square', 'banner', 300, 250, 0.018, 'active'),
  (tc_id, 'native_sponsored', 'native', NULL, NULL, 0.035, 'active'),
  (tc_id, 'video_mid_roll', 'video', 1280, 720, 0.040, 'active');

  -- Reddit ad slots
  INSERT INTO ad_slots (publisher_id, slot_name, slot_type, width, height, floor_price, status) VALUES
  (reddit_id, 'feed_native', 'native', NULL, NULL, 0.025, 'active'),
  (reddit_id, 'sidebar_banner', 'banner', 300, 250, 0.015, 'active'),
  (reddit_id, 'video_promoted', 'video', 1280, 720, 0.035, 'active');

  -- Medium ad slots
  INSERT INTO ad_slots (publisher_id, slot_name, slot_type, width, height, floor_price, status) VALUES
  (medium_id, 'article_top', 'banner', 728, 90, 0.015, 'active'),
  (medium_id, 'article_bottom', 'banner', 300, 250, 0.012, 'active'),
  (medium_id, 'native_recommendation', 'native', NULL, NULL, 0.020, 'active');

  -- ESPN ad slots
  INSERT INTO ad_slots (publisher_id, slot_name, slot_type, width, height, floor_price, status) VALUES
  (espn_id, 'scoreboard_banner', 'banner', 970, 90, 0.032, 'active'),
  (espn_id, 'video_pre_roll', 'video', 1920, 1080, 0.048, 'active'),
  (espn_id, 'article_inline', 'banner', 300, 600, 0.025, 'active'),
  (espn_id, 'mobile_interstitial', 'banner', 320, 480, 0.020, 'active');

  -- Forbes ad slots
  INSERT INTO ad_slots (publisher_id, slot_name, slot_type, width, height, floor_price, status) VALUES
  (forbes_id, 'homepage_billboard', 'banner', 970, 250, 0.035, 'active'),
  (forbes_id, 'article_sidebar', 'banner', 300, 250, 0.022, 'active'),
  (forbes_id, 'video_pre_roll', 'video', 1920, 1080, 0.045, 'active'),
  (forbes_id, 'native_content', 'native', NULL, NULL, 0.038, 'active');

  -- BuzzFeed ad slots
  INSERT INTO ad_slots (publisher_id, slot_name, slot_type, width, height, floor_price, status) VALUES
  (buzz_id, 'feed_native', 'native', NULL, NULL, 0.018, 'active'),
  (buzz_id, 'sidebar_banner', 'banner', 300, 250, 0.015, 'active'),
  (buzz_id, 'video_mid_roll', 'video', 1280, 720, 0.030, 'active');

  -- The Guardian ad slots
  INSERT INTO ad_slots (publisher_id, slot_name, slot_type, width, height, floor_price, status) VALUES
  (guard_id, 'homepage_banner', 'banner', 728, 90, 0.028, 'active'),
  (guard_id, 'article_sidebar', 'banner', 300, 600, 0.025, 'active'),
  (guard_id, 'video_pre_roll', 'video', 1920, 1080, 0.042, 'active'),
  (guard_id, 'mobile_banner', 'banner', 320, 50, 0.012, 'active');

  -- Washington Post ad slots
  INSERT INTO ad_slots (publisher_id, slot_name, slot_type, width, height, floor_price, status) VALUES
  (wapo_id, 'homepage_leaderboard', 'banner', 970, 90, 0.032, 'active'),
  (wapo_id, 'article_inline', 'banner', 300, 250, 0.025, 'active'),
  (wapo_id, 'video_pre_roll', 'video', 1920, 1080, 0.048, 'active'),
  (wapo_id, 'native_recommendation', 'native', NULL, NULL, 0.035, 'active');
END $$;

-- Log the seeding
SELECT log_audit('system', NULL, 'seed_publishers', 'publishers', NULL, 'Seeded 10 publishers with ad slots', NULL);

ANALYZE publishers;
ANALYZE ad_slots;
