-- ============================================================================
-- DEMO ACCOUNTS FOR NEXT.JS APP TESTING
-- Run this FIRST before other seeds
-- These accounts have predictable UUIDs for frontend integration
-- ============================================================================

-- ============================================================================
-- DEMO PUBLISHER
-- ID: b0000001-0000-0000-0000-000000000001
-- ============================================================================

INSERT INTO publishers (
    id,
    domain,
    company_name,
    email,
    api_key,
    api_secret_hash,
    wallet_address,
    status,
    tier,
    website_category,
    monthly_pageviews,
    domain_verified,
    total_earnings,
    pending_earnings
) VALUES (
    'b0000001-0000-0000-0000-000000000001',
    'demo-publisher.adexch.io',
    'Demo Publisher Inc.',
    'demo-publisher@adexch.io',
    'pub_demo_1234567890abcdef',
    '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG',
    '0xDemoPublisher00000000000000000000001',
    'active',
    'premium',
    'technology',
    500000000,
    true,
    0,
    0
) ON CONFLICT (id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    email = EXCLUDED.email,
    status = 'active',
    domain_verified = true;

-- Create ad slots for demo publisher
INSERT INTO ad_slots (publisher_id, slot_name, slot_type, width, height, floor_price, status)
SELECT 'b0000001-0000-0000-0000-000000000001', slot_name, slot_type, width, height, floor_price, 'active'
FROM (VALUES
    ('homepage_banner_top', 'banner', 970, 90, 0.025),
    ('homepage_leaderboard', 'banner', 728, 90, 0.022),
    ('article_sidebar_right', 'banner', 300, 250, 0.018),
    ('article_sidebar_skyscraper', 'banner', 160, 600, 0.020),
    ('article_inline', 'banner', 300, 600, 0.024),
    ('video_pre_roll', 'video', 1920, 1080, 0.045),
    ('video_mid_roll', 'video', 1280, 720, 0.038),
    ('native_feed', 'native', NULL, NULL, 0.032),
    ('native_recommendation', 'native', NULL, NULL, 0.028),
    ('mobile_banner', 'banner', 320, 50, 0.012),
    ('mobile_interstitial', 'banner', 320, 480, 0.035),
    ('tablet_leaderboard', 'banner', 728, 90, 0.020)
) AS slots(slot_name, slot_type, width, height, floor_price)
WHERE NOT EXISTS (
    SELECT 1 FROM ad_slots 
    WHERE publisher_id = 'b0000001-0000-0000-0000-000000000001' 
    AND ad_slots.slot_name = slots.slot_name
);

-- ============================================================================
-- DEMO ADVERTISER
-- ID: a0000001-0000-0000-0000-000000000001
-- ============================================================================

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
    'a0000001-0000-0000-0000-000000000001',
    '0xDemoAdvertiser0000000000000000000001',
    'Demo Advertiser Corp.',
    'demo-advertiser@adexch.io',
    '$2a$10$rKvlHqZQhjlLzEn8KyR4hOxZ8mY5YxBMXGJXJxGKJXPzTqHqQnQgG', -- password: password123
    50000.00000000,
    0.00000000,
    0.00000000,
    'verified',
    'active'
) ON CONFLICT (id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    email = EXCLUDED.email,
    on_chain_balance = EXCLUDED.on_chain_balance,
    status = 'active';

-- ============================================================================
-- DEMO CAMPAIGNS (for the demo advertiser)
-- ============================================================================

-- Delete existing demo campaigns to avoid duplicates
DELETE FROM ad_creatives WHERE campaign_id IN (
    SELECT id FROM campaigns WHERE advertiser_id = 'a0000001-0000-0000-0000-000000000001'
);
DELETE FROM campaigns WHERE advertiser_id = 'a0000001-0000-0000-0000-000000000001';

-- Insert demo campaigns
INSERT INTO campaigns (
    advertiser_id, name, total_budget, daily_budget, max_bid, bid_strategy,
    target_publishers, target_ad_slots, target_geos, target_devices, target_os, target_browsers,
    start_date, end_date, status, category
) VALUES
-- Campaign 1: Brand Awareness
(
    'a0000001-0000-0000-0000-000000000001',
    'Demo Brand Awareness Campaign',
    25.0, 1.0, 0.085, 'highest',
    ARRAY['cnn.com', 'nytimes.com', 'techcrunch.com', 'forbes.com', 'theverge.com'],
    ARRAY['homepage_banner_top', 'video_pre_roll', 'native_feed'],
    ARRAY['US', 'UK', 'CA', 'AU', 'DE', 'FR'],
    ARRAY['desktop', 'mobile', 'tablet'],
    ARRAY['iOS', 'Android', 'Windows', 'macOS'],
    ARRAY['Chrome', 'Safari', 'Firefox', 'Edge'],
    NOW() - INTERVAL '14 days',
    NOW() + INTERVAL '180 days',
    'active',
    'tech'
),
-- Campaign 2: Product Launch
(
    'a0000001-0000-0000-0000-000000000001',
    'Demo Product Launch Campaign',
    15.0, 0.6, 0.072, 'dynamic',
    ARRAY['techcrunch.com', 'wired.com', 'engadget.com', 'cnet.com'],
    ARRAY['video_pre_roll', 'native_feed', 'banner_top'],
    ARRAY['US', 'UK', 'DE', 'JP'],
    ARRAY['desktop', 'mobile'],
    ARRAY['iOS', 'Android', 'Windows', 'macOS'],
    ARRAY['Chrome', 'Safari', 'Firefox'],
    NOW() - INTERVAL '7 days',
    NOW() + INTERVAL '90 days',
    'active',
    'tech'
),
-- Campaign 3: Lead Generation
(
    'a0000001-0000-0000-0000-000000000001',
    'Demo Lead Generation Campaign',
    10.0, 0.4, 0.065, 'target_cpm',
    ARRAY['forbes.com', 'wsj.com', 'bloomberg.com'],
    ARRAY['banner_top', 'sidebar_right', 'native_sponsored'],
    ARRAY['US', 'UK', 'CA'],
    ARRAY['desktop'],
    ARRAY['Windows', 'macOS'],
    ARRAY['Chrome', 'Safari', 'Edge'],
    NOW() - INTERVAL '10 days',
    NOW() + INTERVAL '120 days',
    'active',
    'business'
),
-- Campaign 4: Retargeting
(
    'a0000001-0000-0000-0000-000000000001',
    'Demo Retargeting Campaign',
    8.0, 0.35, 0.058, 'dynamic',
    ARRAY['reddit.com', 'medium.com', 'buzzfeed.com'],
    ARRAY['native_feed', 'sidebar_banner'],
    ARRAY['US', 'CA', 'UK'],
    ARRAY['mobile', 'desktop'],
    ARRAY['iOS', 'Android'],
    ARRAY['Chrome', 'Safari'],
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '60 days',
    'active',
    'ecommerce'
),
-- Campaign 5: Video Campaign
(
    'a0000001-0000-0000-0000-000000000001',
    'Demo Video Engagement Campaign',
    12.0, 0.5, 0.078, 'highest',
    ARRAY['variety.com', 'ign.com', 'gamespot.com'],
    ARRAY['video_pre_roll', 'video_mid_roll'],
    ARRAY['US', 'UK', 'JP', 'KR'],
    ARRAY['desktop', 'mobile', 'tablet'],
    ARRAY['iOS', 'Android', 'Windows', 'macOS'],
    ARRAY['Chrome', 'Safari', 'Firefox', 'Edge'],
    NOW() - INTERVAL '3 days',
    NOW() + INTERVAL '45 days',
    'active',
    'entertainment'
),
-- Campaign 6: Mobile App Install
(
    'a0000001-0000-0000-0000-000000000001',
    'Demo Mobile App Install Campaign',
    6.0, 0.28, 0.052, 'target_cpm',
    ARRAY['techcrunch.com', 'engadget.com', 'theverge.com'],
    ARRAY['mobile_banner', 'mobile_interstitial'],
    ARRAY['US', 'UK', 'CA', 'AU'],
    ARRAY['mobile'],
    ARRAY['iOS', 'Android'],
    ARRAY['Chrome', 'Safari'],
    NOW() - INTERVAL '8 days',
    NOW() + INTERVAL '75 days',
    'active',
    'tech'
);

-- ============================================================================
-- DEMO CREATIVES (for demo campaigns)
-- ============================================================================

DO $$
DECLARE
    campaign_rec RECORD;
BEGIN
    FOR campaign_rec IN 
        SELECT id, name FROM campaigns 
        WHERE advertiser_id = 'a0000001-0000-0000-0000-000000000001'
    LOOP
        -- Banner 728x90
        INSERT INTO ad_creatives (campaign_id, name, format, assets, headline, description, cta_text, landing_url, width, height, review_status, status)
        VALUES (
            campaign_rec.id,
            campaign_rec.name || ' - Leaderboard 728x90',
            'banner',
            '{"image_url": "https://via.placeholder.com/728x90?text=Demo+Banner+728x90"}'::jsonb,
            'Discover Demo Products',
            'Experience the future with our innovative solutions. Shop now!',
            'Shop Now',
            'https://demo.adexch.io/click/' || encode(gen_random_bytes(8), 'hex'),
            728, 90, 'approved', 'active'
        );

        -- Banner 300x250
        INSERT INTO ad_creatives (campaign_id, name, format, assets, headline, description, cta_text, landing_url, width, height, review_status, status)
        VALUES (
            campaign_rec.id,
            campaign_rec.name || ' - Medium Rectangle 300x250',
            'banner',
            '{"image_url": "https://via.placeholder.com/300x250?text=Demo+Banner+300x250"}'::jsonb,
            'Demo Special Offer',
            'Limited time offer! Don''t miss out on this exclusive deal.',
            'Get Offer',
            'https://demo.adexch.io/click/' || encode(gen_random_bytes(8), 'hex'),
            300, 250, 'approved', 'active'
        );

        -- Banner 970x90
        INSERT INTO ad_creatives (campaign_id, name, format, assets, headline, description, cta_text, landing_url, width, height, review_status, status)
        VALUES (
            campaign_rec.id,
            campaign_rec.name || ' - Large Leaderboard 970x90',
            'banner',
            '{"image_url": "https://via.placeholder.com/970x90?text=Demo+Banner+970x90"}'::jsonb,
            'Premium Demo Experience',
            'Elevate your experience with our premium solutions.',
            'Explore Now',
            'https://demo.adexch.io/click/' || encode(gen_random_bytes(8), 'hex'),
            970, 90, 'approved', 'active'
        );

        -- Banner 300x600
        INSERT INTO ad_creatives (campaign_id, name, format, assets, headline, description, cta_text, landing_url, width, height, review_status, status)
        VALUES (
            campaign_rec.id,
            campaign_rec.name || ' - Half Page 300x600',
            'banner',
            '{"image_url": "https://via.placeholder.com/300x600?text=Demo+Banner+300x600"}'::jsonb,
            'Demo Solutions',
            'Transform your business with our cutting-edge solutions.',
            'Learn More',
            'https://demo.adexch.io/click/' || encode(gen_random_bytes(8), 'hex'),
            300, 600, 'approved', 'active'
        );

        -- Mobile Banner 320x50
        INSERT INTO ad_creatives (campaign_id, name, format, assets, headline, description, cta_text, landing_url, width, height, review_status, status)
        VALUES (
            campaign_rec.id,
            campaign_rec.name || ' - Mobile Banner 320x50',
            'banner',
            '{"image_url": "https://via.placeholder.com/320x50?text=Demo+Mobile"}'::jsonb,
            'Demo Mobile',
            'Tap to discover!',
            'Tap Here',
            'https://demo.adexch.io/click/' || encode(gen_random_bytes(8), 'hex'),
            320, 50, 'approved', 'active'
        );

        -- Video 1920x1080
        INSERT INTO ad_creatives (campaign_id, name, format, assets, headline, description, cta_text, landing_url, width, height, duration, review_status, status)
        VALUES (
            campaign_rec.id,
            campaign_rec.name || ' - HD Video 1080p',
            'video',
            '{"video_url": "https://demo.adexch.io/videos/demo-hd.mp4", "thumbnail_url": "https://via.placeholder.com/1920x1080?text=Demo+Video"}'::jsonb,
            'Watch: Demo in Action',
            'See why millions choose our solutions. Watch now!',
            'Watch Now',
            'https://demo.adexch.io/video/' || encode(gen_random_bytes(8), 'hex'),
            1920, 1080, 30, 'approved', 'active'
        );

        -- Video 1280x720
        INSERT INTO ad_creatives (campaign_id, name, format, assets, headline, description, cta_text, landing_url, width, height, duration, review_status, status)
        VALUES (
            campaign_rec.id,
            campaign_rec.name || ' - Video 720p',
            'video',
            '{"video_url": "https://demo.adexch.io/videos/demo-720.mp4", "thumbnail_url": "https://via.placeholder.com/1280x720?text=Demo+Video"}'::jsonb,
            'Demo Story',
            'Our story of innovation and excellence.',
            'Play Video',
            'https://demo.adexch.io/video/' || encode(gen_random_bytes(8), 'hex'),
            1280, 720, 15, 'approved', 'active'
        );

        -- Native
        INSERT INTO ad_creatives (campaign_id, name, format, assets, headline, description, cta_text, landing_url, review_status, status)
        VALUES (
            campaign_rec.id,
            campaign_rec.name || ' - Native Ad',
            'native',
            '{"image_url": "https://via.placeholder.com/600x400?text=Native+Ad", "logo_url": "https://via.placeholder.com/100x100?text=Logo"}'::jsonb,
            'Sponsored: Demo Advertiser',
            'Discover how our innovative solutions are changing the game. Learn more about our story and see what we can do for you.',
            'Learn More',
            'https://demo.adexch.io/native/' || encode(gen_random_bytes(8), 'hex'),
            'approved', 'active'
        );

    END LOOP;
END $$;

-- ============================================================================
-- RECORD TRANSACTIONS
-- ============================================================================

-- Record demo advertiser deposit
INSERT INTO transactions (advertiser_id, type, amount, status, notes)
VALUES ('a0000001-0000-0000-0000-000000000001', 'deposit', 50000.00, 'confirmed', 'Initial demo deposit')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify demo publisher
SELECT 'Demo Publisher' as entity, id, domain, company_name, status
FROM publishers WHERE id = 'b0000001-0000-0000-0000-000000000001';

-- Verify demo publisher ad slots
SELECT 'Demo Publisher Ad Slots' as entity, COUNT(*) as count
FROM ad_slots WHERE publisher_id = 'b0000001-0000-0000-0000-000000000001';

-- Verify demo advertiser
SELECT 'Demo Advertiser' as entity, id, company_name, email, on_chain_balance, status
FROM advertisers WHERE id = 'a0000001-0000-0000-0000-000000000001';

-- Verify demo campaigns
SELECT 'Demo Campaigns' as entity, COUNT(*) as count
FROM campaigns WHERE advertiser_id = 'a0000001-0000-0000-0000-000000000001';

-- Verify demo creatives
SELECT 'Demo Creatives' as entity, COUNT(*) as count
FROM ad_creatives WHERE campaign_id IN (
    SELECT id FROM campaigns WHERE advertiser_id = 'a0000001-0000-0000-0000-000000000001'
);

-- Log the seeding
SELECT log_audit('system', NULL, 'seed_demo_accounts', 'multiple', NULL, 'Seeded demo publisher and advertiser accounts with campaigns and creatives', NULL);
