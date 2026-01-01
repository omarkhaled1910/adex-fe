-- ============================================================================
-- SEED DATA: CAMPAIGNS
-- ============================================================================

DO $$
DECLARE
  nike_id UUID;
  adidas_id UUID;
  amazon_id UUID;
  google_id UUID;
  meta_id UUID;
  coke_id UUID;
  apple_id UUID;
  tesla_id UUID;
  netflix_id UUID;
  spotify_id UUID;
BEGIN
  -- Get advertiser IDs
  SELECT id INTO nike_id FROM advertisers WHERE company_name = 'Nike Inc';
  SELECT id INTO adidas_id FROM advertisers WHERE company_name = 'Adidas AG';
  SELECT id INTO amazon_id FROM advertisers WHERE company_name = 'Amazon Advertising';
  SELECT id INTO google_id FROM advertisers WHERE company_name = 'Google Ads';
  SELECT id INTO meta_id FROM advertisers WHERE company_name = 'Meta Ads';
  SELECT id INTO coke_id FROM advertisers WHERE company_name = 'Coca-Cola Company';
  SELECT id INTO apple_id FROM advertisers WHERE company_name = 'Apple Inc';
  SELECT id INTO tesla_id FROM advertisers WHERE company_name = 'Tesla Inc';
  SELECT id INTO netflix_id FROM advertisers WHERE company_name = 'Netflix Inc';
  SELECT id INTO spotify_id FROM advertisers WHERE company_name = 'Spotify AB';

  -- Nike campaigns
  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices,
    start_date, end_date, status
  ) VALUES
  (
    nike_id, 'Nike Air Max Spring 2026', 5.0, 0.2, 0.055,
    'highest',
    ARRAY['espn.com', 'reddit.com', 'buzzfeed.com'],
    ARRAY['banner_top', 'video_pre_roll', 'native_feed'],
    ARRAY['US', 'UK', 'CA'],
    ARRAY['mobile', 'desktop'],
    NOW() - INTERVAL '7 days',
    NOW() + INTERVAL '30 days',
    'active'
  ),
  (
    nike_id, 'Nike Running Holiday Sale', 3.0, 0.15, 0.048,
    'dynamic',
    ARRAY['espn.com', 'theguardian.com'],
    ARRAY['banner_top', 'sidebar_right'],
    ARRAY['US', 'DE', 'FR'],
    ARRAY['mobile', 'desktop', 'tablet'],
    NOW() - INTERVAL '3 days',
    NOW() + INTERVAL '14 days',
    'active'
  );

  -- Adidas campaigns
  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices,
    start_date, end_date, status
  ) VALUES
  (
    adidas_id, 'Adidas Originals Collection', 4.0, 0.18, 0.052,
    'highest',
    ARRAY['espn.com', 'buzzfeed.com', 'medium.com'],
    ARRAY['video_pre_roll', 'native_feed'],
    ARRAY['US', 'UK', 'JP'],
    ARRAY['mobile', 'desktop'],
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '25 days',
    'active'
  );

  -- Amazon campaigns
  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices,
    start_date, end_date, status
  ) VALUES
  (
    amazon_id, 'Amazon Prime Day 2026', 8.0, 0.35, 0.065,
    'highest',
    ARRAY['cnn.com', 'nytimes.com', 'techcrunch.com', 'forbes.com'],
    ARRAY['homepage_banner_top', 'video_pre_roll', 'native_feed'],
    ARRAY['US', 'CA', 'UK', 'DE'],
    ARRAY['mobile', 'desktop', 'tablet'],
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '60 days',
    'active'
  ),
  (
    amazon_id, 'Amazon Web Services B2B', 5.0, 0.25, 0.058,
    'target_cpm',
    ARRAY['techcrunch.com', 'forbes.com'],
    ARRAY['banner_top', 'sidebar_right', 'native_sponsored'],
    ARRAY['US', 'UK', 'IN'],
    ARRAY['desktop'],
    NOW() - INTERVAL '10 days',
    NOW() + INTERVAL '90 days',
    'active'
  );

  -- Google campaigns
  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices,
    start_date, end_date, status
  ) VALUES
  (
    google_id, 'Google Workspace Campaign', 10.0, 0.4, 0.070,
    'highest',
    ARRAY['techcrunch.com', 'forbes.com', 'washingtonpost.com'],
    ARRAY['banner_top', 'video_pre_roll', 'native_content'],
    ARRAY['US', 'UK', 'CA', 'AU'],
    ARRAY['desktop', 'tablet'],
    NOW() - INTERVAL '15 days',
    NOW() + INTERVAL '45 days',
    'active'
  );

  -- Meta campaigns
  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices,
    start_date, end_date, status
  ) VALUES
  (
    meta_id, 'Meta Quest VR Launch', 9.0, 0.38, 0.068,
    'dynamic',
    ARRAY['techcrunch.com', 'reddit.com', 'buzzfeed.com'],
    ARRAY['video_pre_roll', 'native_feed', 'banner_top'],
    ARRAY['US', 'UK', 'JP', 'KR'],
    ARRAY['mobile', 'desktop'],
    NOW() - INTERVAL '4 days',
    NOW() + INTERVAL '30 days',
    'active'
  );

  -- Coca-Cola campaigns
  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices,
    start_date, end_date, status
  ) VALUES
  (
    coke_id, 'Coca-Cola Summer Refresh', 6.0, 0.28, 0.060,
    'highest',
    ARRAY['cnn.com', 'espn.com', 'buzzfeed.com'],
    ARRAY['video_pre_roll', 'banner_top', 'native_feed'],
    ARRAY['US', 'MX', 'BR', 'CA'],
    ARRAY['mobile', 'desktop', 'tablet'],
    NOW() - INTERVAL '8 days',
    NOW() + INTERVAL '60 days',
    'active'
  );

  -- Apple campaigns
  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices,
    start_date, end_date, status
  ) VALUES
  (
    apple_id, 'iPhone 16 Launch Campaign', 12.0, 0.5, 0.075,
    'highest',
    ARRAY['cnn.com', 'nytimes.com', 'techcrunch.com', 'forbes.com', 'theguardian.com'],
    ARRAY['homepage_banner_top', 'video_pre_roll', 'native_content'],
    ARRAY['US', 'UK', 'CA', 'AU', 'JP', 'DE', 'FR'],
    ARRAY['mobile', 'desktop', 'tablet'],
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '90 days',
    'active'
  ),
  (
    apple_id, 'Apple Watch Fitness Challenge', 7.0, 0.3, 0.062,
    'target_cpm',
    ARRAY['espn.com', 'reddit.com', 'medium.com'],
    ARRAY['banner_top', 'native_feed', 'sidebar_right'],
    ARRAY['US', 'UK', 'CA'],
    ARRAY['mobile'],
    NOW() - INTERVAL '6 days',
    NOW() + INTERVAL '45 days',
    'active'
  );

  -- Tesla campaigns
  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices,
    start_date, end_date, status
  ) VALUES
  (
    tesla_id, 'Tesla Model 3 Highland', 7.5, 0.32, 0.064,
    'highest',
    ARRAY['techcrunch.com', 'forbes.com', 'cnn.com'],
    ARRAY['video_pre_roll', 'banner_top', 'native_content'],
    ARRAY['US', 'CA', 'UK', 'DE', 'NO'],
    ARRAY['desktop', 'tablet'],
    NOW() - INTERVAL '12 days',
    NOW() + INTERVAL '75 days',
    'active'
  );

  -- Netflix campaigns
  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices,
    start_date, end_date, status
  ) VALUES
  (
    netflix_id, 'Netflix Original Series Promo', 8.5, 0.36, 0.066,
    'dynamic',
    ARRAY['buzzfeed.com', 'reddit.com', 'medium.com', 'theguardian.com'],
    ARRAY['video_pre_roll', 'native_feed', 'banner_top'],
    ARRAY['US', 'UK', 'CA', 'AU', 'BR', 'MX'],
    ARRAY['mobile', 'desktop', 'tablet'],
    NOW() - INTERVAL '9 days',
    NOW() + INTERVAL '21 days',
    'active'
  );

  -- Spotify campaigns
  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices,
    start_date, end_date, status
  ) VALUES
  (
    spotify_id, 'Spotify Premium Trial', 4.5, 0.22, 0.054,
    'target_cpm',
    ARRAY['reddit.com', 'medium.com', 'buzzfeed.com'],
    ARRAY['native_feed', 'banner_top', 'sidebar_right'],
    ARRAY['US', 'UK', 'SE', 'DE'],
    ARRAY['mobile', 'desktop'],
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '30 days',
    'active'
  );

END $$;

-- Log the seeding
SELECT log_audit('system', NULL, 'seed_campaigns', 'campaigns', NULL, 'Seeded 14 active campaigns', NULL);

ANALYZE campaigns;
