-- ============================================================================
-- SEED DATA: CAMPAIGNS OPTIMIZED FOR SIMULATED USER TRAFFIC
-- ============================================================================
-- These campaigns are specifically designed to match the simulated-user.js
-- Publishers: cnn.com, nytimes.com, techcrunch.com, reddit.com, medium.com
-- Ad Slots: banner_top, sidebar_right, in_article_video, native_feed, interstitial, video_pre_roll
-- Geos: US, GB, DE, FR, JP (note: simulated user uses GB, not UK)
-- Devices: desktop, mobile, tablet
-- OS: Windows, macOS, iOS, Android
-- Browsers: Chrome, Firefox, Safari
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

  -- Simulated user publishers (EXACT MATCH)
  sim_publishers TEXT[] := ARRAY['cnn.com', 'nytimes.com', 'techcrunch.com', 'reddit.com', 'medium.com'];
  
  -- Simulated user ad slots (EXACT MATCH)
  sim_ad_slots TEXT[] := ARRAY['banner_top', 'sidebar_right', 'in_article_video', 'native_feed', 'interstitial', 'video_pre_roll'];
  
  -- Simulated user geos (EXACT MATCH - note GB not UK)
  sim_geos TEXT[] := ARRAY['US', 'GB', 'DE', 'FR', 'JP'];
  
  -- Simulated user devices
  sim_devices TEXT[] := ARRAY['desktop', 'mobile', 'tablet'];
  
  -- Simulated user OS
  sim_os TEXT[] := ARRAY['Windows', 'macOS', 'iOS', 'Android'];
  
  -- Simulated user browsers
  sim_browsers TEXT[] := ARRAY['Chrome', 'Firefox', 'Safari'];

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
  -- NIKE: High-Bid Aggressive Campaigns (3 campaigns)
  -- ========================================================================
  
  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status
  ) VALUES
  (
    nike_id, 'Nike Global Domination', 50.0, 5.0, 0.10, 'highest',
    sim_publishers, sim_ad_slots, sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days', 'active'
  ),
  (
    nike_id, 'Nike Video Blitz', 30.0, 3.0, 0.08, 'dynamic',
    sim_publishers, ARRAY['video_pre_roll', 'in_article_video', 'interstitial'],
    sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '180 days', 'active'
  ),
  (
    nike_id, 'Nike Banner Everywhere', 25.0, 2.5, 0.075, 'highest',
    sim_publishers, ARRAY['banner_top', 'sidebar_right', 'native_feed'],
    sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 'active'
  );

  -- ========================================================================
  -- ADIDAS: Competitive Bidding (3 campaigns)
  -- ========================================================================
  
  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status
  ) VALUES
  (
    adidas_id, 'Adidas All Publishers Rush', 40.0, 4.0, 0.095, 'highest',
    sim_publishers, sim_ad_slots, sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days', 'active'
  ),
  (
    adidas_id, 'Adidas Mobile First', 20.0, 2.0, 0.085, 'dynamic',
    sim_publishers, sim_ad_slots, sim_geos, ARRAY['mobile', 'tablet'],
    ARRAY['iOS', 'Android'], sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '180 days', 'active'
  ),
  (
    adidas_id, 'Adidas Desktop Premium', 25.0, 2.5, 0.09, 'target_cpm',
    sim_publishers, ARRAY['banner_top', 'sidebar_right'],
    sim_geos, ARRAY['desktop'], ARRAY['Windows', 'macOS'], sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '120 days', 'active'
  );

  -- ========================================================================
  -- AMAZON: Maximum Coverage (4 campaigns)
  -- ========================================================================
  
  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status
  ) VALUES
  (
    amazon_id, 'Amazon Prime Everywhere', 100.0, 10.0, 0.12, 'highest',
    sim_publishers, sim_ad_slots, sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days', 'active'
  ),
  (
    amazon_id, 'Amazon Tech News Takeover', 50.0, 5.0, 0.11, 'dynamic',
    ARRAY['techcrunch.com', 'reddit.com', 'medium.com'],
    sim_ad_slots, sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '180 days', 'active'
  ),
  (
    amazon_id, 'Amazon News Display', 40.0, 4.0, 0.095, 'highest',
    ARRAY['cnn.com', 'nytimes.com'],
    ARRAY['banner_top', 'sidebar_right', 'native_feed'],
    sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '120 days', 'active'
  ),
  (
    amazon_id, 'Amazon Video Ads Global', 60.0, 6.0, 0.10, 'dynamic',
    sim_publishers, ARRAY['video_pre_roll', 'in_article_video'],
    sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 'active'
  );

  -- ========================================================================
  -- GOOGLE: Tech-Focused (4 campaigns)
  -- ========================================================================
  
  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status
  ) VALUES
  (
    google_id, 'Google Cloud Blitz', 80.0, 8.0, 0.115, 'highest',
    sim_publishers, sim_ad_slots, sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days', 'active'
  ),
  (
    google_id, 'Google Search Ads', 60.0, 6.0, 0.105, 'dynamic',
    sim_publishers, sim_ad_slots, sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '180 days', 'active'
  ),
  (
    google_id, 'Google Pixel Promo', 45.0, 4.5, 0.10, 'highest',
    ARRAY['techcrunch.com', 'reddit.com'],
    sim_ad_slots, sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '120 days', 'active'
  ),
  (
    google_id, 'Google YouTube Premium', 35.0, 3.5, 0.09, 'target_cpm',
    sim_publishers, ARRAY['video_pre_roll', 'in_article_video', 'interstitial'],
    sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 'active'
  );

  -- ========================================================================
  -- META: Social & VR Push (4 campaigns)
  -- ========================================================================
  
  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status
  ) VALUES
  (
    meta_id, 'Meta Quest 3 Launch', 70.0, 7.0, 0.11, 'highest',
    sim_publishers, sim_ad_slots, sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days', 'active'
  ),
  (
    meta_id, 'Instagram Reels Blast', 50.0, 5.0, 0.10, 'dynamic',
    sim_publishers, sim_ad_slots, sim_geos, ARRAY['mobile', 'tablet'],
    ARRAY['iOS', 'Android'], sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '180 days', 'active'
  ),
  (
    meta_id, 'Facebook Ads Manager', 40.0, 4.0, 0.095, 'highest',
    sim_publishers, ARRAY['banner_top', 'sidebar_right', 'native_feed'],
    sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '120 days', 'active'
  ),
  (
    meta_id, 'WhatsApp Business Reach', 30.0, 3.0, 0.085, 'dynamic',
    sim_publishers, sim_ad_slots, sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 'active'
  );

  -- ========================================================================
  -- COCA-COLA: Brand Awareness (3 campaigns)
  -- ========================================================================
  
  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status
  ) VALUES
  (
    coke_id, 'Coke Everywhere Campaign', 60.0, 6.0, 0.105, 'highest',
    sim_publishers, sim_ad_slots, sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days', 'active'
  ),
  (
    coke_id, 'Coke Zero Sugar Push', 40.0, 4.0, 0.095, 'dynamic',
    sim_publishers, sim_ad_slots, sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '180 days', 'active'
  ),
  (
    coke_id, 'Coke Video Refresh', 35.0, 3.5, 0.09, 'highest',
    sim_publishers, ARRAY['video_pre_roll', 'in_article_video'],
    sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '120 days', 'active'
  );

  -- ========================================================================
  -- APPLE: Premium Positioning (4 campaigns)
  -- ========================================================================
  
  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status
  ) VALUES
  (
    apple_id, 'iPhone 16 Pro Max Launch', 120.0, 12.0, 0.15, 'highest',
    sim_publishers, sim_ad_slots, sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days', 'active'
  ),
  (
    apple_id, 'Apple Watch Ultra Fitness', 70.0, 7.0, 0.12, 'dynamic',
    sim_publishers, sim_ad_slots, sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '180 days', 'active'
  ),
  (
    apple_id, 'MacBook M4 Creative Pro', 80.0, 8.0, 0.13, 'highest',
    sim_publishers, ARRAY['banner_top', 'sidebar_right', 'native_feed'],
    sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '120 days', 'active'
  ),
  (
    apple_id, 'Apple TV+ Originals Video', 50.0, 5.0, 0.11, 'dynamic',
    sim_publishers, ARRAY['video_pre_roll', 'in_article_video', 'interstitial'],
    sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 'active'
  );

  -- ========================================================================
  -- TESLA: EV Revolution (3 campaigns)
  -- ========================================================================
  
  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status
  ) VALUES
  (
    tesla_id, 'Tesla Model S Plaid', 90.0, 9.0, 0.125, 'highest',
    sim_publishers, sim_ad_slots, sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days', 'active'
  ),
  (
    tesla_id, 'Tesla Cybertruck Reveal', 100.0, 10.0, 0.14, 'dynamic',
    sim_publishers, sim_ad_slots, sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '180 days', 'active'
  ),
  (
    tesla_id, 'Tesla Energy Solutions', 50.0, 5.0, 0.10, 'target_cpm',
    sim_publishers, ARRAY['banner_top', 'sidebar_right', 'native_feed'],
    sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '120 days', 'active'
  );

  -- ========================================================================
  -- NETFLIX: Streaming Domination (3 campaigns)
  -- ========================================================================
  
  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status
  ) VALUES
  (
    netflix_id, 'Netflix Originals Blitz', 80.0, 8.0, 0.115, 'highest',
    sim_publishers, sim_ad_slots, sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days', 'active'
  ),
  (
    netflix_id, 'Netflix Games Launch', 45.0, 4.5, 0.10, 'dynamic',
    sim_publishers, sim_ad_slots, sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '180 days', 'active'
  ),
  (
    netflix_id, 'Netflix Video Ads', 60.0, 6.0, 0.11, 'highest',
    sim_publishers, ARRAY['video_pre_roll', 'in_article_video', 'interstitial'],
    sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '120 days', 'active'
  );

  -- ========================================================================
  -- SPOTIFY: Audio & Beyond (3 campaigns)
  -- ========================================================================
  
  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status
  ) VALUES
  (
    spotify_id, 'Spotify Premium Worldwide', 55.0, 5.5, 0.105, 'highest',
    sim_publishers, sim_ad_slots, sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days', 'active'
  ),
  (
    spotify_id, 'Spotify Podcasts Push', 40.0, 4.0, 0.095, 'dynamic',
    sim_publishers, sim_ad_slots, sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '180 days', 'active'
  ),
  (
    spotify_id, 'Spotify Wrapped Promo', 50.0, 5.0, 0.10, 'highest',
    sim_publishers, ARRAY['banner_top', 'native_feed', 'interstitial'],
    sim_geos, sim_devices, sim_os, sim_browsers,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 'active'
  );

END $$;

-- ============================================================================
-- CREATE CREATIVES FOR THE NEW CAMPAIGNS
-- ============================================================================

DO $$
DECLARE
  campaign_record RECORD;
BEGIN
  -- For each of the newly created campaigns, create creatives
  FOR campaign_record IN 
    SELECT id, name, advertiser_id FROM campaigns 
    WHERE name LIKE '%Global Domination%'
       OR name LIKE '%Video Blitz%'
       OR name LIKE '%Banner Everywhere%'
       OR name LIKE '%All Publishers Rush%'
       OR name LIKE '%Mobile First%'
       OR name LIKE '%Desktop Premium%'
       OR name LIKE '%Prime Everywhere%'
       OR name LIKE '%Tech News Takeover%'
       OR name LIKE '%News Display%'
       OR name LIKE '%Video Ads Global%'
       OR name LIKE '%Cloud Blitz%'
       OR name LIKE '%Search Ads%'
       OR name LIKE '%Pixel Promo%'
       OR name LIKE '%YouTube Premium%'
       OR name LIKE '%Quest 3 Launch%'
       OR name LIKE '%Reels Blast%'
       OR name LIKE '%Ads Manager%'
       OR name LIKE '%Business Reach%'
       OR name LIKE '%Everywhere Campaign%'
       OR name LIKE '%Zero Sugar Push%'
       OR name LIKE '%Video Refresh%'
       OR name LIKE '%Pro Max Launch%'
       OR name LIKE '%Ultra Fitness%'
       OR name LIKE '%Creative Pro%'
       OR name LIKE '%Originals Video%'
       OR name LIKE '%Model S Plaid%'
       OR name LIKE '%Cybertruck Reveal%'
       OR name LIKE '%Energy Solutions%'
       OR name LIKE '%Originals Blitz%'
       OR name LIKE '%Games Launch%'
       OR name LIKE '%Video Ads%'
       OR name LIKE '%Premium Worldwide%'
       OR name LIKE '%Podcasts Push%'
       OR name LIKE '%Wrapped Promo%'
  LOOP
    -- Banner Creative (for banner_top, sidebar_right, native_feed)
    INSERT INTO ad_creatives (
      campaign_id, name, format, assets, headline, description, cta_text, landing_url,
      width, height, review_status, status
    ) VALUES (
      campaign_record.id,
      campaign_record.name || ' - Banner 728x90',
      'banner',
      jsonb_build_object(
        'image_url', 'https://via.placeholder.com/728x90?text=' || replace(campaign_record.name, ' ', '+'),
        'thumbnail_url', 'https://via.placeholder.com/150x150?text=Thumb'
      ),
      'Discover ' || split_part(campaign_record.name, ' ', 1),
      'Amazing deals await. Click to explore now!',
      'Shop Now',
      'https://example.com/campaign/' || lower(replace(campaign_record.name, ' ', '-')),
      728, 90, 'approved', 'active'
    );

    -- Video Creative (for video_pre_roll, in_article_video)
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

    -- Native Creative (for native_feed)
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

    -- Interstitial Creative (for interstitial)
    INSERT INTO ad_creatives (
      campaign_id, name, format, assets, headline, description, cta_text, landing_url,
      width, height, review_status, status
    ) VALUES (
      campaign_record.id,
      campaign_record.name || ' - Interstitial',
      'interstitial',
      jsonb_build_object(
        'image_url', 'https://via.placeholder.com/1080x1920?text=Interstitial',
        'close_button', true
      ),
      'Special Offer from ' || split_part(campaign_record.name, ' ', 1),
      'Limited time offer! Don''t miss out.',
      'Get Started',
      'https://example.com/campaign/' || lower(replace(campaign_record.name, ' ', '-')) || '/promo',
      1080, 1920, 'approved', 'active'
    );

  END LOOP;
END $$;

-- Log the seeding
SELECT log_audit('system', NULL, 'seed_campaigns_simulated_user', 'campaigns', NULL, 
  'Seeded 34 campaigns optimized for simulated-user.js traffic with full targeting match', NULL);

ANALYZE campaigns;
ANALYZE ad_creatives;

