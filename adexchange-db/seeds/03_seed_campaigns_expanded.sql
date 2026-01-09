-- ============================================================================
-- SEED DATA: CAMPAIGNS (EXPANDED TO 50 CAMPAIGNS)
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

  -- Geo targeting arrays
  geos_americas TEXT[] := ARRAY['US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO'];
  geos_europe TEXT[] := ARRAY['UK', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'NO', 'CH', 'AT'];
  geos_asia TEXT[] := ARRAY['JP', 'KR', 'CN', 'IN', 'SG', 'TH', 'MY', 'PH', 'ID', 'TW'];
  geos_all TEXT[] := geos_americas || geos_europe || geos_asia;

  -- Device targeting
  devices_all TEXT[] := ARRAY['mobile', 'desktop', 'tablet'];
  devices_mobile_desktop TEXT[] := ARRAY['mobile', 'desktop'];
  devices_desktop TEXT[] := ARRAY['desktop'];

  -- OS targeting
  os_ios_android TEXT[] := ARRAY['iOS', 'Android'];
  os_all TEXT[] := ARRAY['iOS', 'Android', 'Windows', 'macOS', 'Linux'];
  os_desktop TEXT[] := ARRAY['Windows', 'macOS', 'Linux'];

  -- Browser targeting
  browsers_all TEXT[] := ARRAY['Chrome', 'Safari', 'Firefox', 'Edge', 'Brave', 'Opera'];
  browsers_major TEXT[] := ARRAY['Chrome', 'Safari', 'Edge'];

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
  -- NIKE: 5 Campaigns
  -- ========================================================================

  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status, category
  ) VALUES
  (
    nike_id, 'Nike Air Max Spring 2026', 5.0, 0.2, 0.055, 'highest',
    ARRAY['espn.com', 'reddit.com', 'buzzfeed.com'],
    ARRAY['banner_top', 'video_pre_roll', 'native_feed'],
    ARRAY['US', 'UK', 'CA'],
    devices_mobile_desktop, os_all, browsers_all,
    NOW() - INTERVAL '7 days', NOW() + INTERVAL '30 days', 'active', 'sports'
  ),
  (
    nike_id, 'Nike Running Holiday Sale', 3.0, 0.15, 0.048, 'dynamic',
    ARRAY['espn.com', 'theguardian.com'],
    ARRAY['banner_top', 'sidebar_right'],
    ARRAY['US', 'DE', 'FR'],
    devices_all, os_all, browsers_all,
    NOW() - INTERVAL '3 days', NOW() + INTERVAL '14 days', 'active', 'sports'
  ),
  (
    nike_id, 'Nike Basketball Championship', 4.5, 0.22, 0.058, 'target_cpm',
    ARRAY['espn.com', 'bleacherreport.com', 'sportsillustrated.com'],
    ARRAY['video_pre_roll', 'banner_top', 'native_feed'],
    ARRAY['US', 'CA', 'UK'],
    devices_all, os_all, browsers_major,
    NOW() - INTERVAL '10 days', NOW() + INTERVAL '45 days', 'active', 'sports'
  ),
  (
    nike_id, 'Nike Women''s Collection EU', 3.8, 0.18, 0.052, 'dynamic',
    ARRAY['vogue.com', 'elle.com', 'theguardian.com'],
    ARRAY['banner_top', 'native_feed', 'sidebar_right'],
    geos_europe,
    devices_mobile_desktop, os_all, browsers_all,
    NOW() - INTERVAL '5 days', NOW() + INTERVAL '60 days', 'active', 'sports'
  ),
  (
    nike_id, 'Nike SNKRS Limited Drops', 6.0, 0.35, 0.075, 'highest',
    ARRAY['complex.com', 'hypebeast.com', 'highsnobiety.com', 'reddit.com'],
    ARRAY['banner_top', 'video_pre_roll', 'native_sponsored', 'interstitial'],
    ARRAY['US', 'JP', 'UK'],
    devices_mobile_desktop, os_ios_android, browsers_all,
    NOW() - INTERVAL '2 days', NOW() + INTERVAL '21 days', 'active', 'sports'
  );

  -- ========================================================================
  -- ADIDAS: 4 Campaigns
  -- ========================================================================

  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status, category
  ) VALUES
  (
    adidas_id, 'Adidas Originals Collection', 4.0, 0.18, 0.052, 'highest',
    ARRAY['espn.com', 'buzzfeed.com', 'medium.com'],
    ARRAY['video_pre_roll', 'native_feed'],
    ARRAY['US', 'UK', 'JP'],
    devices_mobile_desktop, os_all, browsers_all,
    NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', 'active', 'sports'
  ),
  (
    adidas_id, 'Adidas x Parley Sustainability', 3.5, 0.16, 0.050, 'dynamic',
    ARRAY['nationalgeographic.com', 'theguardian.com', 'greenpeace.org'],
    ARRAY['banner_top', 'native_feed', 'video_pre_roll'],
    geos_europe,
    devices_all, os_all, browsers_major,
    NOW() - INTERVAL '8 days', NOW() + INTERVAL '90 days', 'active', 'sports'
  ),
  (
    adidas_id, 'Adidas Football Champions League', 5.5, 0.28, 0.062, 'highest',
    ARRAY['uefa.com', 'espn.com', 'goal.com', 'bleacherreport.com'],
    ARRAY['banner_top', 'video_pre_roll', 'homepage_takeover'],
    ARRAY['US', 'UK', 'DE', 'FR', 'ES', 'IT'],
    devices_all, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', 'active', 'sports'
  ),
  (
    adidas_id, 'Adidas TERREX Outdoor', 2.8, 0.14, 0.046, 'target_cpm',
    ARRAY['outsideonline.com', 'backpacker.com', 'reddit.com/r/hiking'],
    ARRAY['banner_top', 'native_feed'],
    ARRAY['US', 'CA', 'DE', 'NO'],
    devices_mobile_desktop, os_all, browsers_major,
    NOW() - INTERVAL '12 days', NOW() + INTERVAL '60 days', 'active', 'sports'
  );

  -- ========================================================================
  -- AMAZON: 6 Campaigns
  -- ========================================================================

  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status, category
  ) VALUES
  (
    amazon_id, 'Amazon Prime Day 2026', 8.0, 0.35, 0.065, 'highest',
    ARRAY['cnn.com', 'nytimes.com', 'techcrunch.com', 'forbes.com'],
    ARRAY['homepage_banner_top', 'video_pre_roll', 'native_feed'],
    ARRAY['US', 'CA', 'UK', 'DE'],
    devices_all, os_all, browsers_all,
    NOW() - INTERVAL '2 days', NOW() + INTERVAL '60 days', 'active', 'ecommerce'
  ),
  (
    amazon_id, 'Amazon Web Services B2B', 5.0, 0.25, 0.058, 'target_cpm',
    ARRAY['techcrunch.com', 'forbes.com', 'wired.com'],
    ARRAY['banner_top', 'sidebar_right', 'native_sponsored'],
    ARRAY['US', 'UK', 'IN'],
    devices_desktop, os_desktop, browsers_all,
    NOW() - INTERVAL '10 days', NOW() + INTERVAL '90 days', 'active', 'tech'
  ),
  (
    amazon_id, 'Amazon Fresh Grocery Delivery', 4.2, 0.20, 0.054, 'dynamic',
    ARRAY['foodnetwork.com', 'allrecipes.com', 'yummly.com'],
    ARRAY['banner_top', 'native_feed', 'sidebar_right'],
    ARRAY['US', 'UK', 'JP'],
    devices_mobile_desktop, os_ios_android, browsers_major,
    NOW() - INTERVAL '6 days', NOW() + INTERVAL '45 days', 'active', 'ecommerce'
  ),
  (
    amazon_id, 'Amazon Music Unlimited', 3.5, 0.17, 0.051, 'dynamic',
    ARRAY['billboard.com', 'pitchfork.com', 'rollingstone.com', 'spotify.com'],
    ARRAY['audio_pre_roll', 'banner_top', 'native_feed'],
    ARRAY['US', 'CA', 'UK', 'DE', 'JP'],
    devices_all, os_all, browsers_all,
    NOW() - INTERVAL '4 days', NOW() + INTERVAL '120 days', 'active', 'entertainment'
  ),
  (
    amazon_id, 'Amazon Devices Holiday Sale', 7.5, 0.40, 0.070, 'highest',
    ARRAY['theverge.com', 'cnet.com', 'engadget.com', 'macrumors.com'],
    ARRAY['banner_top', 'video_pre_roll', 'homepage_takeover'],
    geos_all,
    devices_all, os_all, browsers_all,
    NOW() - INTERVAL '15 days', NOW() + INTERVAL '75 days', 'active', 'ecommerce'
  ),
  (
    amazon_id, 'Amazon Fashion Week', 4.8, 0.24, 0.056, 'highest',
    ARRAY['vogue.com', 'harperbazaar.com', 'elle.com', 'gq.com'],
    ARRAY['banner_top', 'native_feed', 'video_pre_roll'],
    ARRAY['US', 'UK', 'FR', 'IT'],
    devices_all, os_all, browsers_major,
    NOW() - INTERVAL '7 days', NOW() + INTERVAL '30 days', 'active', 'fashion'
  );

  -- ========================================================================
  -- GOOGLE: 5 Campaigns
  -- ========================================================================

  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status, category
  ) VALUES
  (
    google_id, 'Google Workspace Campaign', 10.0, 0.4, 0.070, 'highest',
    ARRAY['techcrunch.com', 'forbes.com', 'washingtonpost.com'],
    ARRAY['banner_top', 'video_pre_roll', 'native_content'],
    ARRAY['US', 'UK', 'CA', 'AU'],
    devices_desktop, os_desktop, browsers_all,
    NOW() - INTERVAL '15 days', NOW() + INTERVAL '45 days', 'active', 'tech'
  ),
  (
    google_id, 'Google Cloud Platform', 8.5, 0.38, 0.068, 'target_cpm',
    ARRAY['techcrunch.com', 'wired.com', 'arstechnica.com', 'hackernews.com'],
    ARRAY['banner_top', 'native_sponsored', 'sidebar_right'],
    ARRAY['US', 'IN', 'DE', 'JP'],
    devices_desktop, os_desktop, browsers_all,
    NOW() - INTERVAL '20 days', NOW() + INTERVAL '90 days', 'active', 'tech'
  ),
  (
    google_id, 'Google Pixel 7 Launch', 6.5, 0.32, 0.064, 'highest',
    ARRAY['theverge.com', 'androidcentral.com', 'xda-developers.com'],
    ARRAY['banner_top', 'video_pre_roll', 'homepage_takeover'],
    ARRAY['US', 'UK', 'DE', 'FR', 'IN'],
    devices_mobile_desktop, os_all, browsers_all,
    NOW() - INTERVAL '3 days', NOW() + INTERVAL '60 days', 'active', 'tech'
  ),
  (
    google_id, 'YouTube Premium', 5.5, 0.28, 0.060, 'dynamic',
    ARRAY['pewdiepie.com', 'mrbeast.com', 'variety.com'],
    ARRAY['video_pre_roll', 'video_mid_roll', 'banner_top'],
    geos_all,
    devices_all, os_all, browsers_all,
    NOW() - INTERVAL '8 days', NOW() + INTERVAL '180 days', 'active', 'entertainment'
  ),
  (
    google_id, 'Google AI Bard', 7.0, 0.35, 0.066, 'highest',
    ARRAY['openai.com', 'techcrunch.com', 'wired.com', 'nature.com'],
    ARRAY['banner_top', 'native_feed', 'sidebar_right'],
    ARRAY['US', 'UK', 'CA', 'DE', 'JP', 'IN'],
    devices_all, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '120 days', 'active', 'tech'
  );

  -- ========================================================================
  -- META: 5 Campaigns
  -- ========================================================================

  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status, category
  ) VALUES
  (
    meta_id, 'Meta Quest VR Launch', 9.0, 0.38, 0.068, 'dynamic',
    ARRAY['techcrunch.com', 'reddit.com', 'buzzfeed.com'],
    ARRAY['video_pre_roll', 'native_feed', 'banner_top'],
    ARRAY['US', 'UK', 'JP', 'KR'],
    devices_all, os_all, browsers_all,
    NOW() - INTERVAL '4 days', NOW() + INTERVAL '30 days', 'active', 'tech'
  ),
  (
    meta_id, 'Instagram Reels Ads', 6.0, 0.30, 0.062, 'highest',
    ARRAY['influencermarketinghub.com', 'socialmediaexaminer.com'],
    ARRAY['banner_top', 'native_feed', 'video_pre_roll'],
    geos_all,
    devices_mobile_desktop, os_ios_android, browsers_major,
    NOW() - INTERVAL '11 days', NOW() + INTERVAL '90 days', 'active', 'tech'
  ),
  (
    meta_id, 'Facebook Business Suite', 4.5, 0.22, 0.056, 'target_cpm',
    ARRAY['entrepreneur.com', 'forbes.com', 'businessinsider.com'],
    ARRAY['banner_top', 'sidebar_right', 'native_sponsored'],
    ARRAY['US', 'CA', 'UK', 'BR'],
    devices_desktop, os_all, browsers_all,
    NOW() - INTERVAL '9 days', NOW() + INTERVAL '60 days', 'active', 'tech'
  ),
  (
    meta_id, 'WhatsApp Business Platform', 5.2, 0.26, 0.059, 'dynamic',
    ARRAY['techcrunch.com', 'venturesbeat.com', 'crunchbase.com'],
    ARRAY['banner_top', 'native_feed', 'video_pre_roll'],
    ARRAY['US', 'BR', 'IN', 'ID', 'MX'],
    devices_mobile_desktop, os_ios_android, browsers_all,
    NOW() - INTERVAL '14 days', NOW() + INTERVAL '75 days', 'active', 'tech'
  ),
  (
    meta_id, 'Meta Horizon Worlds', 4.0, 0.20, 0.054, 'highest',
    ARRAY['roadtovr.com', 'uploadvr.com', 'tomsguide.com'],
    ARRAY['banner_top', 'video_pre_roll', 'native_feed'],
    ARRAY['US', 'UK', 'CA', 'AU'],
    devices_all, os_all, browsers_all,
    NOW() - INTERVAL '6 days', NOW() + INTERVAL '45 days', 'active', 'tech'
  );

  -- ========================================================================
  -- COCA-COLA: 4 Campaigns
  -- ========================================================================

  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status, category
  ) VALUES
  (
    coke_id, 'Coca-Cola Summer Refresh', 6.0, 0.28, 0.060, 'highest',
    ARRAY['cnn.com', 'espn.com', 'buzzfeed.com'],
    ARRAY['video_pre_roll', 'banner_top', 'native_feed'],
    ARRAY['US', 'MX', 'BR', 'CA'],
    devices_all, os_all, browsers_all,
    NOW() - INTERVAL '8 days', NOW() + INTERVAL '60 days', 'active', 'food_bev'
  ),
  (
    coke_id, 'Coca-Cola Zero Sugar', 4.5, 0.21, 0.057, 'dynamic',
    ARRAY['menshealth.com', 'fitness.com', 'myfitnesspal.com'],
    ARRAY['banner_top', 'native_feed', 'sidebar_right'],
    ARRAY['US', 'UK', 'DE', 'AU'],
    devices_all, os_all, browsers_major,
    NOW() - INTERVAL '5 days', NOW() + INTERVAL '90 days', 'active', 'food_bev'
  ),
  (
    coke_id, 'Coca-Cola Holiday Classics', 5.5, 0.30, 0.063, 'highest',
    ARRAY['foodandwine.com', 'delish.com', 'tasteofhome.com'],
    ARRAY['video_pre_roll', 'banner_top', 'homepage_takeover'],
    ARRAY['US', 'CA', 'UK', 'FR'],
    devices_all, os_all, browsers_all,
    NOW() - INTERVAL '18 days', NOW() + INTERVAL '30 days', 'active', 'food_bev'
  ),
  (
    coke_id, 'Coca-Cola Creations Limited', 3.8, 0.19, 0.053, 'dynamic',
    ARRAY['buzzfeed.com', 'tasty.co', 'walmart.com'],
    ARRAY['banner_top', 'native_feed', 'sidebar_right'],
    ARRAY['US', 'MX', 'JP'],
    devices_mobile_desktop, os_ios_android, browsers_major,
    NOW() - INTERVAL '2 days', NOW() + INTERVAL '45 days', 'active', 'food_bev'
  );

  -- ========================================================================
  -- APPLE: 6 Campaigns
  -- ========================================================================

  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status, category
  ) VALUES
  (
    apple_id, 'iPhone 16 Launch Campaign', 12.0, 0.5, 0.075, 'highest',
    ARRAY['cnn.com', 'nytimes.com', 'techcrunch.com', 'forbes.com', 'theguardian.com'],
    ARRAY['homepage_banner_top', 'video_pre_roll', 'native_content'],
    ARRAY['US', 'UK', 'CA', 'AU', 'JP', 'DE', 'FR'],
    devices_all, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 'active', 'tech'
  ),
  (
    apple_id, 'Apple Watch Fitness Challenge', 7.0, 0.3, 0.062, 'target_cpm',
    ARRAY['espn.com', 'reddit.com', 'medium.com'],
    ARRAY['banner_top', 'native_feed', 'sidebar_right'],
    ARRAY['US', 'UK', 'CA'],
    devices_mobile_desktop, os_ios_android, browsers_major,
    NOW() - INTERVAL '6 days', NOW() + INTERVAL '45 days', 'active', 'tech'
  ),
  (
    apple_id, 'MacBook Pro M4', 8.5, 0.40, 0.072, 'highest',
    ARRAY['theverge.com', 'wired.com', 'arstechnica.com', 'creativereview.com'],
    ARRAY['banner_top', 'video_pre_roll', 'homepage_takeover'],
    ARRAY['US', 'UK', 'DE', 'JP', 'CA'],
    devices_desktop, os_all, browsers_all,
    NOW() - INTERVAL '10 days', NOW() + INTERVAL '60 days', 'active', 'tech'
  ),
  (
    apple_id, 'Apple TV+ Originals', 6.5, 0.32, 0.065, 'dynamic',
    ARRAY['variety.com', 'hollywoodreporter.com', 'indiewire.com'],
    ARRAY['video_pre_roll', 'banner_top', 'native_feed'],
    geos_all,
    devices_all, os_all, browsers_all,
    NOW() - INTERVAL '7 days', NOW() + INTERVAL '120 days', 'active', 'entertainment'
  ),
  (
    apple_id, 'Apple Music Spatial Audio', 4.2, 0.20, 0.055, 'dynamic',
    ARRAY['billboard.com', 'pitchfork.com', 'rollingstone.com', 'grammy.com'],
    ARRAY['audio_pre_roll', 'banner_top', 'native_feed'],
    ARRAY['US', 'UK', 'DE', 'JP', 'AU'],
    devices_all, os_all, browsers_all,
    NOW() - INTERVAL '13 days', NOW() + INTERVAL '180 days', 'active', 'entertainment'
  ),
  (
    apple_id, 'Apple iPad Pro Creative', 5.8, 0.28, 0.061, 'highest',
    ARRAY['behance.net', 'dribbble.com', 'adesignawards.com'],
    ARRAY['banner_top', 'native_feed', 'video_pre_roll'],
    ARRAY['US', 'UK', 'DE', 'FR', 'JP'],
    devices_all, os_all, browsers_major,
    NOW() - INTERVAL '4 days', NOW() + INTERVAL '75 days', 'active', 'tech'
  );

  -- ========================================================================
  -- TESLA: 5 Campaigns
  -- ========================================================================

  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status, category
  ) VALUES
  (
    tesla_id, 'Tesla Model 3 Highland', 7.5, 0.32, 0.064, 'highest',
    ARRAY['techcrunch.com', 'forbes.com', 'cnn.com'],
    ARRAY['video_pre_roll', 'banner_top', 'native_content'],
    ARRAY['US', 'CA', 'UK', 'DE', 'NO'],
    devices_desktop, os_desktop, browsers_all,
    NOW() - INTERVAL '12 days', NOW() + INTERVAL '75 days', 'active', 'automotive'
  ),
  (
    tesla_id, 'Tesla Model Y Global', 8.0, 0.35, 0.066, 'dynamic',
    ARRAY['theverge.com', 'wired.com', 'roadandtrack.com', 'caranddriver.com'],
    ARRAY['banner_top', 'video_pre_roll', 'homepage_takeover'],
    ARRAY['US', 'CA', 'UK', 'DE', 'FR', 'CN', 'AU'],
    devices_all, os_all, browsers_all,
    NOW() - INTERVAL '3 days', NOW() + INTERVAL '90 days', 'active', 'automotive'
  ),
  (
    tesla_id, 'Tesla Cybertruck Launch', 10.0, 0.50, 0.080, 'highest',
    ARRAY['techcrunch.com', 'motortrend.com', 'autoblog.com', 'topgear.com'],
    ARRAY['video_pre_roll', 'homepage_banner_top', 'native_feed'],
    ARRAY['US', 'CA', 'MX'],
    devices_all, os_all, browsers_all,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '45 days', 'active', 'automotive'
  ),
  (
    tesla_id, 'Tesla Solar Roof', 4.5, 0.22, 0.057, 'target_cpm',
    ARRAY['greenbuildingadvisor.com', 'solarpower.com', 'energy.gov'],
    ARRAY['banner_top', 'native_feed', 'sidebar_right'],
    ARRAY['US', 'CA', 'AU'],
    devices_desktop, os_desktop, browsers_all,
    NOW() - INTERVAL '16 days', NOW() + INTERVAL '120 days', 'active', 'automotive'
  ),
  (
    tesla_id, 'Tesla Powerwall Home Energy', 3.8, 0.18, 0.053, 'dynamic',
    ARRAY['popsci.com', 'thisoldhouse.com', 'houzz.com'],
    ARRAY['banner_top', 'native_feed', 'video_pre_roll'],
    ARRAY['US', 'CA', 'DE', 'AU'],
    devices_all, os_all, browsers_major,
    NOW() - INTERVAL '8 days', NOW() + INTERVAL '90 days', 'active', 'automotive'
  );

  -- ========================================================================
  -- NETFLIX: 5 Campaigns
  -- ========================================================================

  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status, category
  ) VALUES
  (
    netflix_id, 'Netflix Original Series Promo', 8.5, 0.36, 0.066, 'dynamic',
    ARRAY['buzzfeed.com', 'reddit.com', 'medium.com', 'theguardian.com'],
    ARRAY['video_pre_roll', 'native_feed', 'banner_top'],
    ARRAY['US', 'UK', 'CA', 'AU', 'BR', 'MX'],
    devices_all, os_all, browsers_all,
    NOW() - INTERVAL '9 days', NOW() + INTERVAL '21 days', 'active', 'entertainment'
  ),
  (
    netflix_id, 'Netflix Movies Weekend', 6.0, 0.28, 0.061, 'highest',
    ARRAY['rottentomatoes.com', 'imdb.com', 'metacritic.com'],
    ARRAY['banner_top', 'video_pre_roll', 'native_feed'],
    geos_all,
    devices_all, os_all, browsers_all,
    NOW() - INTERVAL '5 days', NOW() + INTERVAL '60 days', 'active', 'entertainment'
  ),
  (
    netflix_id, 'Netflix Anime Collection', 4.5, 0.22, 0.056, 'dynamic',
    ARRAY['crunchyroll.com', 'myanimelist.net', 'animenewsnetwork.com'],
    ARRAY['banner_top', 'native_feed', 'sidebar_right'],
    ARRAY['US', 'JP', 'KR', 'PH', 'ID'],
    devices_all, os_all, browsers_major,
    NOW() - INTERVAL '11 days', NOW() + INTERVAL '90 days', 'active', 'entertainment'
  ),
  (
    netflix_id, 'Netflix K-Dramas', 5.2, 0.25, 0.059, 'highest',
    ARRAY['soompi.com', 'koreaherald.com', 'koreatimes.co.kr'],
    ARRAY['banner_top', 'video_pre_roll', 'native_feed'],
    ARRAY['US', 'JP', 'KR', 'ID', 'MY', 'TH'],
    devices_mobile_desktop, os_all, browsers_all,
    NOW() - INTERVAL '7 days', NOW() + INTERVAL '75 days', 'active', 'entertainment'
  ),
  (
    netflix_id, 'Netflix Games Launch', 3.5, 0.17, 0.052, 'dynamic',
    ARRAY['ign.com', 'gamespot.com', 'polygon.com', 'kotaku.com'],
    ARRAY['banner_top', 'native_feed', 'video_pre_roll'],
    ARRAY['US', 'UK', 'CA', 'BR', 'PL'],
    devices_all, os_all, browsers_all,
    NOW() - INTERVAL '14 days', NOW() + INTERVAL '45 days', 'active', 'gaming'
  );

  -- ========================================================================
  -- SPOTIFY: 5 Campaigns
  -- ========================================================================

  INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status, category
  ) VALUES
  (
    spotify_id, 'Spotify Premium Trial', 4.5, 0.22, 0.054, 'target_cpm',
    ARRAY['reddit.com', 'medium.com', 'buzzfeed.com'],
    ARRAY['native_feed', 'banner_top', 'sidebar_right'],
    ARRAY['US', 'UK', 'SE', 'DE'],
    devices_mobile_desktop, os_all, browsers_all,
    NOW() - INTERVAL '5 days', NOW() + INTERVAL '30 days', 'active', 'entertainment'
  ),
  (
    spotify_id, 'Spotify Wrapped Campaign', 6.5, 0.35, 0.067, 'highest',
    ARRAY['billboard.com', 'variety.com', 'rollingstone.com'],
    ARRAY['banner_top', 'video_pre_roll', 'homepage_takeover'],
    ARRAY['US', 'UK', 'DE', 'FR', 'BR', 'MX'],
    devices_all, os_all, browsers_all,
    NOW() - INTERVAL '20 days', NOW() + INTERVAL '15 days', 'active', 'entertainment'
  ),
  (
    spotify_id, 'Spotify Podcast Originals', 4.0, 0.19, 0.055, 'dynamic',
    ARRAY['theverge.com', 'wired.com', 'niemanlab.org'],
    ARRAY['audio_pre_roll', 'banner_top', 'native_feed'],
    ARRAY['US', 'UK', 'CA', 'AU'],
    devices_all, os_all, browsers_major,
    NOW() - INTERVAL '8 days', NOW() + INTERVAL '90 days', 'active', 'entertainment'
  ),
  (
    spotify_id, 'Spotify Duo & Family', 3.8, 0.18, 0.053, 'dynamic',
    ARRAY['parents.com', 'familycircle.com', 'goodhousekeeping.com'],
    ARRAY['banner_top', 'native_feed', 'sidebar_right'],
    ARRAY['US', 'UK', 'DE', 'FR', 'IT'],
    devices_all, os_all, browsers_all,
    NOW() - INTERVAL '6 days', NOW() + INTERVAL '60 days', 'active', 'entertainment'
  ),
  (
    spotify_id, 'Spotify Artists Platform', 3.2, 0.15, 0.050, 'target_cpm',
    ARRAY['billboard.com', 'musicbusinessworldwide.com', 'soundonsound.com'],
    ARRAY['banner_top', 'native_feed', 'sidebar_right'],
    ARRAY['US', 'UK', 'SE', 'DE'],
    devices_desktop, os_desktop, browsers_all,
    NOW() - INTERVAL '12 days', NOW() + INTERVAL '120 days', 'active', 'entertainment'
  );

END $$;

-- Log the seeding
SELECT log_audit('system', NULL, 'seed_campaigns_expanded', 'campaigns', NULL, 'Seeded 50 expanded campaigns with OS and browser targeting', NULL);

ANALYZE campaigns;
