-- ============================================================================
-- SEED DATA: AD CREATIVES (EXPANDED TO 1000+ CREATIVES)
-- ============================================================================

DO $$
DECLARE
  campaign_record RECORD;
  creative_count INTEGER := 0;

  -- Creative configurations
  headlines TEXT[] := ARRAY[
    'Shop Now and Save', 'Limited Time Offer', 'Exclusive Deal',
    'Discover More', 'Get Started Today', 'Don''t Miss Out',
    'Best Prices of the Year', 'Premium Quality', 'Free Shipping',
    'New Arrival', 'Top Rated', 'Customer Favorite',
    'Shop Exclusive', 'Flash Sale', 'Member Benefits',
    'Shop Premium', 'Shop Limited', 'Shop Featured',
    'Discover Now', 'Explore Today', 'Save Big',
    'Limited Stock', 'Special Offer', 'Huge Selection',
    'Best Value', 'Shop Smart', 'Get Yours',
    'Order Now', 'Buy Online', 'Free Returns'
  ];

  descriptions TEXT[] := ARRAY[
    'Limited time offer. Shop now and save big on your favorite products!',
    'Experience the difference. Premium quality at unbeatable prices.',
    'Discover our latest collection and find your perfect match.',
    'Join thousands of satisfied customers. Shop with confidence today.',
    'Get exclusive access to deals and promotions. Sign up now!',
    'Don''t miss out on these amazing offers. Available for a limited time.',
    'Shop the latest trends with free shipping on all orders.',
    'Premium products, premium service. Experience excellence today.',
    'New arrivals just in. Be the first to shop our latest collection.',
    'Top-rated products you can trust. Shop with confidence.',
    'Customer favorite picks. See what everyone is talking about.',
    'Exclusive deals you won''t find anywhere else. Shop now!',
    'Limited stock available. Don''t miss your chance to save.',
    'Special member benefits. Join today and start saving.',
    'Huge selection of products to choose from. Find your perfect match.',
    'Best value for your money. Quality products at great prices.',
    'Shop smart with our curated collection. Find exactly what you need.',
    'Get yours today before they''re gone. Limited quantities available.',
    'Order online for fast, convenient delivery to your door.',
    'Free returns on all orders. Shop risk-free today.'
  ];

  ctas TEXT[] := ARRAY[
    'Shop Now', 'Learn More', 'Sign Up', 'Get Started',
    'Watch Now', 'Explore', 'Discover', 'Shop Today',
    'Buy Now', 'Order Now', 'View Details', 'See More',
    'Get Deal', 'Claim Offer', 'Start Free', 'Try Free',
    'Download', 'Subscribe', 'Join Now', 'Get Access'
  ];

  -- Banner dimensions
  banner_sizes TEXT[][] := ARRAY[
    ARRAY[728, 90],    -- leaderboard
    ARRAY[300, 250],   -- medium rectangle
    ARRAY[320, 50],    -- mobile banner
    ARRAY[970, 90],    -- large leaderboard
    ARRAY[300, 600],   -- half page
    ARRAY[160, 600],   -- skyscraper
    ARRAY[728, 250],   -- large banner
    ARRAY[320, 100],   -- large mobile banner
    ARRAY[336, 280],   -- large rectangle
    ARRAY[250, 250],   -- square
    ARRAY[200, 200],   -- small square
    ARRAY[468, 60]     -- full banner
  ];

  -- Video dimensions
  video_sizes TEXT[][] := ARRAY[
    ARRAY[1920, 1080], -- HD 1080p
    ARRAY[1280, 720],  -- HD 720p
    ARRAY[640, 360],   -- 360p
    ARRAY[854, 480]    -- 480p
  ];

  -- Native logo sizes
  logo_sizes TEXT[][] := ARRAY[
    ARRAY[100, 100],
    ARRAY[150, 150],
    ARRAY[200, 200],
    ARRAY[120, 60],
    ARRAY[180, 80]
  ];

  -- Get total campaigns for reference
  total_campaigns INTEGER;

  function get_random_item(arr TEXT[]) RETURNS TEXT AS $$
    DECLARE
      idx INTEGER;
    BEGIN
      idx := floor(random() * array_length(arr, 1))::INTEGER + 1;
      RETURN arr[idx];
    END;
  $$ LANGUAGE plpgsql;

  function get_banner_size_index(arr TEXT[][], idx INTEGER) RETURNS TEXT AS $$
    DECLARE
      size_idx INTEGER;
    BEGIN
      size_idx := ((idx - 1) % array_length(arr, 1)) + 1;
      RETURN arr[size_idx][1] || 'x' || arr[size_idx][2];
    END;
  $$ LANGUAGE plpgsql;

BEGIN
  SELECT COUNT(*) INTO total_campaigns FROM campaigns;

  RAISE NOTICE 'Starting creatives expansion for % campaigns', total_campaigns;

  -- Loop through all campaigns
  FOR campaign_record IN
    SELECT c.id, c.name, c.advertiser_id, a.company_name
    FROM campaigns c
    JOIN advertisers a ON c.advertiser_id = a.id
    WHERE c.status = 'active'
    ORDER BY c.created_at
  LOOP
    DECLARE
      num_banners INTEGER := 8 + floor(random() * 5)::INTEGER; -- 8-12 banners
      num_videos INTEGER := 4 + floor(random() * 3)::INTEGER;  -- 4-6 videos
      num_natives INTEGER := 6 + floor(random() * 3)::INTEGER; -- 6-8 natives
      i INTEGER;
      brand_name TEXT;
      size_idx INTEGER;
      headline_idx INTEGER;
      cta_idx INTEGER;
    BEGIN
      brand_name := split_part(campaign_record.company_name, ' ', 1);

      -- ==================================================================
      -- BANNER CREATIVES
      -- ==================================================================
      FOR i IN 1..num_banners LOOP
        size_idx := ((i - 1) % array_length(banner_sizes, 1)) + 1;
        headline_idx := ((i + creative_count) % array_length(headlines, 1)) + 1;
        cta_idx := ((i + creative_count) % array_length(ctas, 1)) + 1;

        INSERT INTO ad_creatives (
          campaign_id,
          name,
          format,
          assets,
          headline,
          description,
          cta_text,
          landing_url,
          width,
          height,
          review_status,
          status
        ) VALUES (
          campaign_record.id,
          campaign_record.name || ' - Banner ' || i || ' (' || banner_sizes[size_idx][1] || 'x' || banner_sizes[size_idx][2] || ')',
          'banner',
          jsonb_build_object(
            'image_url', 'https://via.placeholder.com/' || banner_sizes[size_idx][1] || 'x' || banner_sizes[size_idx][2] || '?text=' || replace(brand_name, ' ', '+') || '+Banner',
            'thumbnail_url', 'https://via.placeholder.com/150x150?text=' || replace(brand_name, ' ', '+')
          ),
          headlines[headline_idx],
          get_random_item(descriptions),
          ctas[cta_idx],
          'https://example.com/click/' || encode(gen_random_bytes(16), 'hex'),
          banner_sizes[size_idx][1]::INTEGER,
          banner_sizes[size_idx][2]::INTEGER,
          'approved',
          'active'
        );

        creative_count := creative_count + 1;
      END LOOP;

      -- ==================================================================
      -- VIDEO CREATIVES
      -- ==================================================================
      FOR i IN 1..num_videos LOOP
        size_idx := ((i - 1) % array_length(video_sizes, 1)) + 1;
        headline_idx := ((i + creative_count) % array_length(headlines, 1)) + 1;
        cta_idx := ((i + creative_count) % array_length(ctas, 1)) + 1;

        INSERT INTO ad_creatives (
          campaign_id,
          name,
          format,
          assets,
          headline,
          description,
          cta_text,
          landing_url,
          width,
          height,
          duration,
          review_status,
          status
        ) VALUES (
          campaign_record.id,
          campaign_record.name || ' - Video ' || i || ' (' || video_sizes[size_idx][1] || 'x' || video_sizes[size_idx][2] || ')',
          'video',
          jsonb_build_object(
            'video_url', 'https://example.com/videos/' || encode(gen_random_bytes(16), 'hex') || '.mp4',
            'thumbnail_url', 'https://via.placeholder.com/' || video_sizes[size_idx][1] || 'x' || video_sizes[size_idx][2] || '?text=' || replace(brand_name, ' ', '+') || '+Video',
            'poster_url', 'https://via.placeholder.com/' || video_sizes[size_idx][1] || 'x' || video_sizes[size_idx][2] || '?text=Video+Poster'
          ),
          'Watch: ' || brand_name || ' in Action',
          get_random_item(descriptions),
          'Watch Now',
          'https://example.com/video/' || encode(gen_random_bytes(16), 'hex'),
          video_sizes[size_idx][1]::INTEGER,
          video_sizes[size_idx][2]::INTEGER,
          (15 + floor(random() * 31))::INTEGER, -- 15-45 seconds
          'approved',
          'active'
        );

        creative_count := creative_count + 1;
      END LOOP;

      -- ==================================================================
      -- NATIVE CREATIVES
      -- ==================================================================
      FOR i IN 1..num_natives LOOP
        size_idx := ((i - 1) % array_length(logo_sizes, 1)) + 1;
        headline_idx := ((i + creative_count) % array_length(headlines, 1)) + 1;
        cta_idx := ((i + creative_count) % array_length(ctas, 1)) + 1;

        INSERT INTO ad_creatives (
          campaign_id,
          name,
          format,
          assets,
          headline,
          description,
          cta_text,
          landing_url,
          review_status,
          status
        ) VALUES (
          campaign_record.id,
          campaign_record.name || ' - Native ' || i,
          'native',
          jsonb_build_object(
            'image_url', 'https://via.placeholder.com/600x400?text=' || replace(brand_name, ' ', '+') || '+Native',
            'logo_url', 'https://via.placeholder.com/' || logo_sizes[size_idx][1] || 'x' || logo_sizes[size_idx][2] || '?text=' || substring(brand_name, 1, 3)
          ),
          'Sponsored: ' || brand_name,
          'Discover why everyone is talking about ' || brand_name || '. Learn more about our latest innovation and how it can benefit you.',
          ctas[cta_idx],
          'https://example.com/native/' || encode(gen_random_bytes(16), 'hex'),
          'approved',
          'active'
        );

        creative_count := creative_count + 1;
      END LOOP;

      RAISE NOTICE 'Campaign % (%): Created % banners, % videos, % natives',
        campaign_record.name, brand_name, num_banners, num_videos, num_natives;
    END;
  END LOOP;

  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Total creatives created: %', creative_count;
  RAISE NOTICE 'Approximate per campaign: %', creative_count::FLOAT / total_campaigns;
  RAISE NOTICE '=================================================';

END $$;

-- Verify the seed
SELECT
  COUNT(*) as total_creatives,
  COUNT(DISTINCT campaign_id) as campaigns_with_creatives,
  format,
  COUNT(*) as count_by_format
FROM ad_creatives
GROUP BY format
ORDER BY format;

-- Get campaign breakdown
SELECT
  c.name as campaign_name,
  a.company_name as advertiser,
  COUNT(cr.id) as creative_count,
  COUNT(*) FILTER (WHERE cr.format = 'banner') as banners,
  COUNT(*) FILTER (WHERE cr.format = 'video') as videos,
  COUNT(*) FILTER (WHERE cr.format = 'native') as natives
FROM campaigns c
JOIN advertisers a ON c.advertiser_id = a.id
LEFT JOIN ad_creatives cr ON cr.campaign_id = c.id
WHERE c.status = 'active'
GROUP BY c.id, c.name, a.company_name
ORDER BY creative_count DESC;

-- Log the seeding
SELECT log_audit('system', NULL, 'seed_creatives_expanded', 'ad_creatives', NULL, 'Seeded 1000+ expanded creatives with multiple formats and sizes', NULL);

ANALYZE ad_creatives;
