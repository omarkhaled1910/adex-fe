-- ============================================================================
-- SEED DATA: CAMPAIGNS COMPATIBLE WITH MEDIUM.COM + GLOBAL TARGETING
-- ============================================================================
-- These campaigns are designed to match test traffic from:
--   - Publisher: medium.com (domain)
--   - AdSlotType: banner
--   - CountryCode: EG (Egypt) and others
--   - Device: desktop, mobile, tablet
--   - OS: macOS, Windows, iOS, Android
--   - Browser: Chrome, Safari, Firefox
-- 
-- GOAL: Create 40+ campaigns that will compete in auctions, making them more
-- interesting and eliminating the need for fallback bots.
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

  -- Global geo targeting (includes EG = Egypt and many others)
  geos_global TEXT[] := ARRAY['US', 'UK', 'DE', 'FR', 'EG', 'SA', 'AE', 'JP', 'IN', 'BR', 'CA', 'AU', 'MX', 'NG', 'ZA', 'KE', 'PH', 'ID', 'TH', 'MY'];
  geos_mena TEXT[] := ARRAY['EG', 'SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'JO', 'LB', 'MA', 'TN', 'DZ'];
  geos_all_devices TEXT[] := ARRAY['desktop', 'mobile', 'tablet'];
  geos_desktop TEXT[] := ARRAY['desktop'];
  
  -- OS and browser targeting (broad)
  os_all TEXT[] := ARRAY['Windows', 'macOS', 'iOS', 'Android', 'Linux'];
  browsers_all TEXT[] := ARRAY['Chrome', 'Safari', 'Firefox', 'Edge', 'Brave', 'Opera'];
  
  -- Publisher targeting including medium.com
  pub_medium TEXT[] := ARRAY['medium.com'];
  pub_tech_blogs TEXT[] := ARRAY['medium.com', 'techcrunch.com', 'wired.com', 'theverge.com'];
  pub_content TEXT[] := ARRAY['medium.com', 'reddit.com', 'buzzfeed.com', 'theguardian.com'];
  pub_broad TEXT[] := ARRAY['medium.com', 'cnn.com', 'nytimes.com', 'forbes.com', 'espn.com', 'reddit.com', 'buzzfeed.com'];

  -- Ad slot targeting (includes banner)
  slots_banner TEXT[] := ARRAY['banner', 'banner_top', 'sidebar_right', 'article_top', 'article_bottom'];
  slots_all TEXT[] := ARRAY['banner', 'banner_top', 'sidebar_right', 'video_pre_roll', 'native_feed', 'interstitial'];

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

  -- ========================================================================
  -- NIKE: 5 Global Campaigns (No targeting restrictions)
  -- ========================================================================

  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status, category
  ) VALUES
  (
    nike_id, 'Nike Global Reach - Banner Focus', 100.0, 10.0, 0.12, 'highest',
    NULL, -- No publisher restriction = matches all
    NULL, -- No ad slot restriction = matches all
    NULL, -- No geo restriction = matches all countries including EG
    NULL, NULL, NULL, -- No device/OS/browser restriction
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days', 'active', 'sports'
  ),
  (
    nike_id, 'Nike MENA Region Campaign', 80.0, 8.0, 0.11, 'highest',
    pub_content, slots_all, geos_mena,
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '180 days', 'active', 'sports'
  ),
  (
    nike_id, 'Nike Medium Blog Readers', 60.0, 6.0, 0.095, 'dynamic',
    pub_medium, slots_banner, geos_global,
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '120 days', 'active', 'sports'
  ),
  (
    nike_id, 'Nike Desktop Premium Banners', 50.0, 5.0, 0.088, 'highest',
    pub_tech_blogs, slots_banner, geos_global,
    geos_desktop, ARRAY['Windows', 'macOS'], ARRAY['Chrome', 'Safari', 'Edge'],
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 'active', 'sports'
  ),
  (
    nike_id, 'Nike Emerging Markets Push', 70.0, 7.0, 0.10, 'dynamic',
    pub_broad, slots_all, ARRAY['EG', 'NG', 'ZA', 'KE', 'IN', 'PH', 'ID', 'BR', 'MX'],
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '150 days', 'active', 'sports'
  );

  -- ========================================================================
  -- ADIDAS: 4 Competitive Campaigns
  -- ========================================================================

  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status, category
  ) VALUES
  (
    adidas_id, 'Adidas Worldwide Banner Blitz', 90.0, 9.0, 0.115, 'highest',
    NULL, NULL, NULL, NULL, NULL, NULL, -- No restrictions
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days', 'active', 'sports'
  ),
  (
    adidas_id, 'Adidas Content Platform Strategy', 75.0, 7.5, 0.105, 'dynamic',
    pub_content, slots_banner, geos_global,
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '180 days', 'active', 'sports'
  ),
  (
    adidas_id, 'Adidas Middle East Focus', 55.0, 5.5, 0.092, 'highest',
    pub_broad, slots_all, geos_mena,
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '120 days', 'active', 'sports'
  ),
  (
    adidas_id, 'Adidas Tech Reader Engagement', 45.0, 4.5, 0.085, 'target_cpm',
    pub_tech_blogs, slots_banner, geos_global,
    geos_desktop, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 'active', 'sports'
  );

  -- ========================================================================
  -- AMAZON: 5 Maximum Coverage Campaigns
  -- ========================================================================

  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status, category
  ) VALUES
  (
    amazon_id, 'Amazon Global Prime Push', 150.0, 15.0, 0.14, 'highest',
    NULL, NULL, NULL, NULL, NULL, NULL, -- No restrictions
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days', 'active', 'ecommerce'
  ),
  (
    amazon_id, 'Amazon Medium Readers Deal', 100.0, 10.0, 0.125, 'dynamic',
    pub_medium, slots_all, geos_global,
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '180 days', 'active', 'ecommerce'
  ),
  (
    amazon_id, 'Amazon MENA Expansion', 85.0, 8.5, 0.11, 'highest',
    pub_broad, slots_all, geos_mena,
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '150 days', 'active', 'ecommerce'
  ),
  (
    amazon_id, 'Amazon Desktop Banner Network', 65.0, 6.5, 0.098, 'target_cpm',
    pub_tech_blogs, slots_banner, geos_global,
    geos_desktop, ARRAY['Windows', 'macOS'], browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '120 days', 'active', 'ecommerce'
  ),
  (
    amazon_id, 'Amazon Emerging E-commerce', 80.0, 8.0, 0.108, 'dynamic',
    pub_content, slots_all, ARRAY['EG', 'SA', 'AE', 'IN', 'PH', 'ID', 'BR', 'MX', 'NG'],
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 'active', 'ecommerce'
  );

  -- ========================================================================
  -- GOOGLE: 5 Tech-Focused Global Campaigns
  -- ========================================================================

  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status, category
  ) VALUES
  (
    google_id, 'Google Cloud Unlimited Reach', 120.0, 12.0, 0.135, 'highest',
    NULL, NULL, NULL, NULL, NULL, NULL, -- No restrictions
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days', 'active', 'tech'
  ),
  (
    google_id, 'Google Workspace Global Banner', 95.0, 9.5, 0.12, 'dynamic',
    pub_tech_blogs, slots_banner, geos_global,
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '180 days', 'active', 'tech'
  ),
  (
    google_id, 'Google Pixel MENA Launch', 70.0, 7.0, 0.105, 'highest',
    pub_content, slots_all, geos_mena,
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '120 days', 'active', 'tech'
  ),
  (
    google_id, 'Google Chrome Promotion', 55.0, 5.5, 0.09, 'dynamic',
    pub_medium, slots_banner, geos_global,
    geos_desktop, os_all, ARRAY['Chrome'],
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 'active', 'tech'
  ),
  (
    google_id, 'Google AI Products Global', 85.0, 8.5, 0.115, 'highest',
    pub_broad, slots_all, geos_global,
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '150 days', 'active', 'tech'
  );

  -- ========================================================================
  -- META: 4 Social Platform Campaigns
  -- ========================================================================

  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status, category
  ) VALUES
  (
    meta_id, 'Meta Global Awareness', 110.0, 11.0, 0.13, 'highest',
    NULL, NULL, NULL, NULL, NULL, NULL, -- No restrictions
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days', 'active', 'tech'
  ),
  (
    meta_id, 'Meta Content Platform Ads', 80.0, 8.0, 0.11, 'dynamic',
    pub_content, slots_all, geos_global,
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '180 days', 'active', 'tech'
  ),
  (
    meta_id, 'Meta Quest MENA Gaming', 60.0, 6.0, 0.095, 'highest',
    pub_tech_blogs, slots_banner, geos_mena,
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '120 days', 'active', 'tech'
  ),
  (
    meta_id, 'Instagram Business Global', 75.0, 7.5, 0.108, 'dynamic',
    pub_medium, slots_all, geos_global,
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 'active', 'tech'
  );

  -- ========================================================================
  -- COCA-COLA: 4 Brand Awareness Campaigns
  -- ========================================================================

  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status, category
  ) VALUES
  (
    coke_id, 'Coca-Cola Global Happiness', 95.0, 9.5, 0.118, 'highest',
    NULL, NULL, NULL, NULL, NULL, NULL, -- No restrictions
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days', 'active', 'food_bev'
  ),
  (
    coke_id, 'Coca-Cola MENA Ramadan', 70.0, 7.0, 0.10, 'dynamic',
    pub_broad, slots_all, geos_mena,
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '180 days', 'active', 'food_bev'
  ),
  (
    coke_id, 'Coca-Cola Medium Readers', 50.0, 5.0, 0.088, 'highest',
    pub_medium, slots_banner, geos_global,
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '120 days', 'active', 'food_bev'
  ),
  (
    coke_id, 'Coca-Cola Desktop Display', 45.0, 4.5, 0.082, 'target_cpm',
    pub_content, slots_banner, geos_global,
    geos_desktop, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 'active', 'food_bev'
  );

  -- ========================================================================
  -- APPLE: 5 Premium Tech Campaigns
  -- ========================================================================

  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status, category
  ) VALUES
  (
    apple_id, 'Apple Global Premium Banner', 130.0, 13.0, 0.16, 'highest',
    NULL, NULL, NULL, NULL, NULL, NULL, -- No restrictions
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days', 'active', 'tech'
  ),
  (
    apple_id, 'Apple Medium Creative Audience', 90.0, 9.0, 0.13, 'dynamic',
    pub_medium, slots_all, geos_global,
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '180 days', 'active', 'tech'
  ),
  (
    apple_id, 'Apple MENA Premium Launch', 75.0, 7.5, 0.115, 'highest',
    pub_tech_blogs, slots_banner, geos_mena,
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '120 days', 'active', 'tech'
  ),
  (
    apple_id, 'Apple macOS Safari Users', 60.0, 6.0, 0.10, 'dynamic',
    pub_content, slots_banner, geos_global,
    geos_desktop, ARRAY['macOS'], ARRAY['Safari', 'Chrome'],
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 'active', 'tech'
  ),
  (
    apple_id, 'Apple Services Emerging Markets', 85.0, 8.5, 0.12, 'highest',
    pub_broad, slots_all, ARRAY['EG', 'SA', 'AE', 'IN', 'PH', 'ID', 'BR', 'MX', 'NG', 'ZA'],
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '150 days', 'active', 'tech'
  );

  -- ========================================================================
  -- TESLA: 4 EV Revolution Campaigns
  -- ========================================================================

  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status, category
  ) VALUES
  (
    tesla_id, 'Tesla Global Electric Future', 100.0, 10.0, 0.14, 'highest',
    NULL, NULL, NULL, NULL, NULL, NULL, -- No restrictions
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days', 'active', 'automotive'
  ),
  (
    tesla_id, 'Tesla Tech Blog Readers', 70.0, 7.0, 0.11, 'dynamic',
    pub_tech_blogs, slots_banner, geos_global,
    geos_desktop, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '180 days', 'active', 'automotive'
  ),
  (
    tesla_id, 'Tesla MENA Expansion', 55.0, 5.5, 0.095, 'highest',
    pub_content, slots_all, geos_mena,
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '120 days', 'active', 'automotive'
  ),
  (
    tesla_id, 'Tesla Medium Innovators', 45.0, 4.5, 0.088, 'dynamic',
    pub_medium, slots_banner, geos_global,
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 'active', 'automotive'
  );

  -- ========================================================================
  -- NETFLIX: 4 Streaming Entertainment Campaigns
  -- ========================================================================

  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status, category
  ) VALUES
  (
    netflix_id, 'Netflix Global Streaming Banner', 105.0, 10.5, 0.13, 'highest',
    NULL, NULL, NULL, NULL, NULL, NULL, -- No restrictions
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days', 'active', 'entertainment'
  ),
  (
    netflix_id, 'Netflix Content Platform Push', 80.0, 8.0, 0.115, 'dynamic',
    pub_content, slots_all, geos_global,
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '180 days', 'active', 'entertainment'
  ),
  (
    netflix_id, 'Netflix MENA Arabic Content', 65.0, 6.5, 0.10, 'highest',
    pub_broad, slots_banner, geos_mena,
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '120 days', 'active', 'entertainment'
  ),
  (
    netflix_id, 'Netflix Medium Film Lovers', 50.0, 5.0, 0.09, 'dynamic',
    pub_medium, slots_banner, geos_global,
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 'active', 'entertainment'
  );

  -- ========================================================================
  -- SPOTIFY: 4 Audio Streaming Campaigns
  -- ========================================================================

  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status, category
  ) VALUES
  (
    spotify_id, 'Spotify Global Premium Banner', 85.0, 8.5, 0.12, 'highest',
    NULL, NULL, NULL, NULL, NULL, NULL, -- No restrictions
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days', 'active', 'entertainment'
  ),
  (
    spotify_id, 'Spotify Medium Music Lovers', 65.0, 6.5, 0.105, 'dynamic',
    pub_medium, slots_all, geos_global,
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '180 days', 'active', 'entertainment'
  ),
  (
    spotify_id, 'Spotify MENA Arabic Music', 50.0, 5.0, 0.09, 'highest',
    pub_content, slots_banner, geos_mena,
    geos_all_devices, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '120 days', 'active', 'entertainment'
  ),
  (
    spotify_id, 'Spotify Desktop Chrome Users', 40.0, 4.0, 0.082, 'target_cpm',
    pub_tech_blogs, slots_banner, geos_global,
    geos_desktop, os_all, ARRAY['Chrome'],
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 'active', 'entertainment'
  );

END $$;

-- ============================================================================
-- CREATE CREATIVES FOR ALL NEW CAMPAIGNS
-- ============================================================================

DO $$
DECLARE
  campaign_record RECORD;
BEGIN
  -- For each newly created campaign, create multiple creatives
  FOR campaign_record IN 
    SELECT id, name, advertiser_id FROM campaigns 
    WHERE name LIKE '%Global%' 
       OR name LIKE '%MENA%'
       OR name LIKE '%Medium%'
       OR name LIKE '%Emerging%'
       OR name LIKE '%Worldwide%'
       OR name LIKE '%Desktop%'
       OR name LIKE '%Unlimited%'
       OR name LIKE '%Chrome%'
       OR name LIKE '%Premium Banner%'
       OR name LIKE '%Content Platform%'
       OR name LIKE '%macOS%'
       OR name LIKE '%Safari%'
       OR name LIKE '%Arabic%'
       OR name LIKE '%Happiness%'
       OR name LIKE '%Ramadan%'
       OR name LIKE '%Electric Future%'
       OR name LIKE '%Innovators%'
       OR name LIKE '%Film Lovers%'
       OR name LIKE '%Music Lovers%'
  LOOP
    -- Only add creatives if they don't already exist for this campaign
    IF NOT EXISTS (SELECT 1 FROM ad_creatives WHERE campaign_id = campaign_record.id AND format = 'banner' AND name LIKE '%Global Banner%') THEN
      -- Banner Creative 728x90 (leaderboard)
      INSERT INTO ad_creatives (
        campaign_id, name, format, assets, headline, description, cta_text, landing_url,
        width, height, review_status, status
      ) VALUES (
        campaign_record.id,
        campaign_record.name || ' - Global Banner 728x90',
        'banner',
        jsonb_build_object(
          'image_url', 'https://via.placeholder.com/728x90?text=' || replace(split_part(campaign_record.name, ' ', 1), ' ', '+'),
          'thumbnail_url', 'https://via.placeholder.com/150x150?text=Thumb'
        ),
        'Discover ' || split_part(campaign_record.name, ' ', 1),
        'Amazing offers await. Click to explore now!',
        'Shop Now',
        'https://example.com/campaign/' || lower(replace(campaign_record.name, ' ', '-')),
        728, 90, 'approved', 'active'
      );

      -- Banner Creative 300x250 (medium rectangle)
      INSERT INTO ad_creatives (
        campaign_id, name, format, assets, headline, description, cta_text, landing_url,
        width, height, review_status, status
      ) VALUES (
        campaign_record.id,
        campaign_record.name || ' - Rectangle 300x250',
        'banner',
        jsonb_build_object(
          'image_url', 'https://via.placeholder.com/300x250?text=' || replace(split_part(campaign_record.name, ' ', 1), ' ', '+'),
          'thumbnail_url', 'https://via.placeholder.com/150x150?text=Rect'
        ),
        'Special: ' || split_part(campaign_record.name, ' ', 1),
        'Limited time offer. Act now!',
        'Learn More',
        'https://example.com/campaign/' || lower(replace(campaign_record.name, ' ', '-')) || '/rect',
        300, 250, 'approved', 'active'
      );

      -- Banner Creative 320x50 (mobile leaderboard)
      INSERT INTO ad_creatives (
        campaign_id, name, format, assets, headline, description, cta_text, landing_url,
        width, height, review_status, status
      ) VALUES (
        campaign_record.id,
        campaign_record.name || ' - Mobile 320x50',
        'banner',
        jsonb_build_object(
          'image_url', 'https://via.placeholder.com/320x50?text=' || replace(split_part(campaign_record.name, ' ', 1), ' ', '+'),
          'thumbnail_url', 'https://via.placeholder.com/100x50?text=Mobile'
        ),
        split_part(campaign_record.name, ' ', 1) || ' Deals',
        'Tap to explore',
        'Tap Here',
        'https://example.com/campaign/' || lower(replace(campaign_record.name, ' ', '-')) || '/mobile',
        320, 50, 'approved', 'active'
      );

      -- Video Creative
      INSERT INTO ad_creatives (
        campaign_id, name, format, assets, headline, description, cta_text, landing_url,
        width, height, duration, review_status, status
      ) VALUES (
        campaign_record.id,
        campaign_record.name || ' - Video 1080p',
        'video',
        jsonb_build_object(
          'video_url', 'https://example.com/videos/' || lower(replace(campaign_record.name, ' ', '-')) || '.mp4',
          'thumbnail_url', 'https://via.placeholder.com/1280x720?text=Video',
          'poster_url', 'https://via.placeholder.com/1920x1080?text=Poster'
        ),
        'Watch: ' || split_part(campaign_record.name, ' ', 1) || ' Story',
        'Experience the difference in full HD.',
        'Watch Now',
        'https://example.com/campaign/' || lower(replace(campaign_record.name, ' ', '-')) || '/video',
        1920, 1080, 30, 'approved', 'active'
      );

      -- Native Creative
      INSERT INTO ad_creatives (
        campaign_id, name, format, assets, headline, description, cta_text, landing_url,
        review_status, status
      ) VALUES (
        campaign_record.id,
        campaign_record.name || ' - Native Content',
        'native',
        jsonb_build_object(
          'image_url', 'https://via.placeholder.com/600x400?text=Native',
          'logo_url', 'https://via.placeholder.com/100x100?text=Logo'
        ),
        'Exclusive: ' || split_part(campaign_record.name, ' ', 1) || ' Announcement',
        'Click to discover our latest innovations and exclusive offers.',
        'Learn More',
        'https://example.com/campaign/' || lower(replace(campaign_record.name, ' ', '-')) || '/native',
        'approved', 'active'
      );
    END IF;
  END LOOP;
END $$;

-- Log the seeding
SELECT log_audit('system', NULL, 'seed_campaigns_medium_compatible', 'campaigns', NULL, 
  'Seeded 43 campaigns with global/MENA targeting optimized for medium.com and EG traffic with 215+ creatives', NULL);

ANALYZE campaigns;
ANALYZE ad_creatives;

-- Show summary
DO $$
DECLARE
  campaign_count INTEGER;
  creative_count INTEGER;
  global_campaign_count INTEGER;
  mena_campaign_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO campaign_count FROM campaigns WHERE status = 'active';
  SELECT COUNT(*) INTO creative_count FROM ad_creatives WHERE status = 'active';
  SELECT COUNT(*) INTO global_campaign_count FROM campaigns WHERE target_geos IS NULL AND status = 'active';
  SELECT COUNT(*) INTO mena_campaign_count FROM campaigns WHERE 'EG' = ANY(target_geos) AND status = 'active';
  
  RAISE NOTICE '=== SEED SUMMARY ===';
  RAISE NOTICE 'Total Active Campaigns: %', campaign_count;
  RAISE NOTICE 'Total Active Creatives: %', creative_count;
  RAISE NOTICE 'Global Campaigns (no geo restriction): %', global_campaign_count;
  RAISE NOTICE 'MENA/EG-targeted Campaigns: %', mena_campaign_count;
  RAISE NOTICE '====================';
END $$;
