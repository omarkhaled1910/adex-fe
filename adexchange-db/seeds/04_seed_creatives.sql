-- ============================================================================
-- SEED DATA: AD CREATIVES
-- ============================================================================

DO $$
DECLARE
  campaign_record RECORD;
BEGIN
  -- For each campaign, create 2-3 ad creatives
  FOR campaign_record IN SELECT id, name, advertiser_id FROM campaigns LOOP
    -- Creative 1: Banner
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
      campaign_record.name || ' - Banner Creative A',
      'banner',
      jsonb_build_object(
        'image_url', 'https://via.placeholder.com/728x90?text=' || replace(campaign_record.name, ' ', '+'),
        'thumbnail_url', 'https://via.placeholder.com/150x150?text=Thumb'
      ),
      'Discover ' || split_part(campaign_record.name, ' ', 1),
      'Limited time offer. Shop now and save big!',
      'Shop Now',
      'https://example.com/campaign/' || lower(replace(campaign_record.name, ' ', '-')),
      728,
      90,
      'approved',
      'active'
    );

    -- Creative 2: Video
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
      campaign_record.name || ' - Video Creative',
      'video',
      jsonb_build_object(
        'video_url', 'https://example.com/videos/' || lower(replace(campaign_record.name, ' ', '-')) || '.mp4',
        'thumbnail_url', 'https://via.placeholder.com/1280x720?text=Video+Thumbnail',
        'poster_url', 'https://via.placeholder.com/1920x1080?text=Video+Poster'
      ),
      'Watch: ' || split_part(campaign_record.name, ' ', 1) || ' in Action',
      'Experience the difference. Watch our latest video.',
      'Watch Now',
      'https://example.com/campaign/' || lower(replace(campaign_record.name, ' ', '-')) || '/video',
      1920,
      1080,
      30,
      'approved',
      'active'
    );

    -- Creative 3: Native (for some campaigns)
    IF random() > 0.3 THEN
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
        campaign_record.name || ' - Native Creative',
        'native',
        jsonb_build_object(
          'image_url', 'https://via.placeholder.com/600x400?text=Native+Ad',
          'logo_url', 'https://via.placeholder.com/100x100?text=Logo'
        ),
        'Exclusive: ' || split_part(campaign_record.name, ' ', 1) || ' Announcement',
        'Learn more about our latest innovation and how it can benefit you. Click to explore exclusive content.',
        'Learn More',
        'https://example.com/campaign/' || lower(replace(campaign_record.name, ' ', '-')) || '/native',
        'approved',
        'active'
      );
    END IF;
  END LOOP;

END $$;

-- Log the seeding
SELECT log_audit('system', NULL, 'seed_creatives', 'ad_creatives', NULL, 'Seeded ad creatives for all campaigns', NULL);

ANALYZE ad_creatives;
