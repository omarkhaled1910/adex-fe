-- ============================================================================
-- SEED DATA: HISTORICAL AUCTIONS, BIDS, AND IMPRESSIONS
-- ============================================================================
-- This creates realistic historical data for the past 7 days

DO $$
DECLARE
  day_offset INTEGER;
  auctions_per_day INTEGER := 500; -- 500 auctions per day
  publisher_record RECORD;
  slot_record RECORD;
  campaign_record RECORD;
  creative_record RECORD;
  auction_id UUID;
  bid_id UUID;
  impression_id UUID;
  winning_bid_record RECORD;
  bid_amount DECIMAL(18, 8);
  win_probability DECIMAL(3, 2);
  total_auctions_created INTEGER := 0;
  total_bids_created INTEGER := 0;
  total_impressions_created INTEGER := 0;
BEGIN
  -- Generate data for the past 7 days
  FOR day_offset IN 0..6 LOOP
    RAISE NOTICE 'Generating data for day % (% auctions)', day_offset + 1, auctions_per_day;
    
    -- Create auctions for this day
    FOR i IN 1..auctions_per_day LOOP
      -- Pick random publisher and ad slot
      SELECT p.id, p.domain INTO publisher_record
      FROM publishers p
      WHERE p.status = 'active'
      ORDER BY random()
      LIMIT 1;
      
      SELECT s.id, s.floor_price, s.slot_type INTO slot_record
      FROM ad_slots s
      WHERE s.publisher_id = publisher_record.id AND s.status = 'active'
      ORDER BY random()
      LIMIT 1;
      
      -- Create auction
      INSERT INTO auctions (
        publisher_id,
        ad_slot_id,
        floor_price,
        auction_type,
        user_context,
        ip_address,
        user_agent,
        started_at,
        closed_at,
        duration_ms,
        status
      ) VALUES (
        publisher_record.id,
        slot_record.id,
        slot_record.floor_price,
        'first_price',
        jsonb_build_object(
          'device', (ARRAY['mobile', 'desktop', 'tablet'])[floor(random() * 3 + 1)],
          'os', (ARRAY['iOS', 'Android', 'Windows', 'macOS'])[floor(random() * 4 + 1)],
          'browser', (ARRAY['Chrome', 'Safari', 'Firefox', 'Edge'])[floor(random() * 4 + 1)],
          'geo', (ARRAY['US', 'UK', 'CA', 'DE', 'FR', 'JP'])[floor(random() * 6 + 1)]
        ),
        ('192.168.' || floor(random() * 255) || '.' || floor(random() * 255))::INET,
        'Mozilla/5.0 (compatible; AdExchange/1.0)',
        NOW() - (day_offset || ' days')::INTERVAL + (random() * 86400 || ' seconds')::INTERVAL,
        NOW() - (day_offset || ' days')::INTERVAL + (random() * 86400 || ' seconds')::INTERVAL + (150 + random() * 100 || ' milliseconds')::INTERVAL,
        (150 + random() * 100)::INTEGER,
        'closed'
      ) RETURNING id INTO auction_id;
      
      total_auctions_created := total_auctions_created + 1;
      
      -- Create 3-7 bids for this auction
      FOR j IN 1..(3 + floor(random() * 5))::INTEGER LOOP
        -- Pick random active campaign that matches the ad slot type
        SELECT c.id, c.advertiser_id, c.max_bid INTO campaign_record
        FROM campaigns c
        WHERE c.status = 'active'
          AND c.start_date <= NOW() - (day_offset || ' days')::INTERVAL
          AND (c.end_date IS NULL OR c.end_date >= NOW() - (day_offset || ' days')::INTERVAL)
        ORDER BY random()
        LIMIT 1;
        
        IF campaign_record.id IS NOT NULL THEN
          -- Pick random creative from this campaign
          SELECT id INTO creative_record
          FROM ad_creatives
          WHERE campaign_id = campaign_record.id AND status = 'active'
          ORDER BY random()
          LIMIT 1;
          
          IF creative_record.id IS NOT NULL THEN
            -- Calculate bid amount (floor price + random amount up to max_bid)
            bid_amount := slot_record.floor_price + (random() * (campaign_record.max_bid - slot_record.floor_price));
            
            -- Create bid
            INSERT INTO bids (
              auction_id,
              campaign_id,
              advertiser_id,
              creative_id,
              amount,
              status,
              submitted_at,
              response_time_ms
            ) VALUES (
              auction_id,
              campaign_record.id,
              campaign_record.advertiser_id,
              creative_record.id,
              bid_amount,
              'submitted',
              NOW() - (day_offset || ' days')::INTERVAL + (random() * 86400 || ' seconds')::INTERVAL,
              (50 + random() * 150)::INTEGER
            ) RETURNING id INTO bid_id;
            
            total_bids_created := total_bids_created + 1;
          END IF;
        END IF;
      END LOOP;
      
      -- Determine winning bid (highest bid)
      SELECT b.id, b.amount, b.campaign_id, b.advertiser_id, b.creative_id
      INTO winning_bid_record
      FROM bids b
      WHERE b.auction_id = auction_id
      ORDER BY b.amount DESC
      LIMIT 1;
      
      IF winning_bid_record.id IS NOT NULL THEN
        -- Update auction with winner
        UPDATE auctions
        SET winning_bid_id = winning_bid_record.id,
            winning_amount = winning_bid_record.amount,
            total_bids = (SELECT COUNT(*) FROM bids WHERE auction_id = auctions.id)
        WHERE id = auction_id;
        
        -- Mark winning bid
        UPDATE bids
        SET won = true, status = 'won'
        WHERE id = winning_bid_record.id;
        
        -- Mark losing bids
        UPDATE bids
        SET status = 'lost'
        WHERE auction_id = auction_id AND id != winning_bid_record.id;
        
        -- Create impression (85% chance the ad was actually served)
        IF random() < 0.85 THEN
          INSERT INTO impressions (
            auction_id,
            bid_id,
            campaign_id,
            publisher_id,
            ad_slot_id,
            creative_id,
            user_fingerprint,
            ip_address,
            user_agent,
            device_type,
            os,
            browser,
            country_code,
            served_at,
            viewable,
            time_in_view,
            viewport_percentage,
            clicked,
            clicked_at,
            bot_score,
            flagged_as_fraud
          ) VALUES (
            auction_id,
            winning_bid_record.id,
            winning_bid_record.campaign_id,
            publisher_record.id,
            slot_record.id,
            winning_bid_record.creative_id,
            md5(random()::TEXT || clock_timestamp()::TEXT),
            ('192.168.' || floor(random() * 255) || '.' || floor(random() * 255))::INET,
            'Mozilla/5.0 (compatible; AdExchange/1.0)',
            (ARRAY['mobile', 'desktop', 'tablet'])[floor(random() * 3 + 1)],
            (ARRAY['iOS', 'Android', 'Windows', 'macOS'])[floor(random() * 4 + 1)],
            (ARRAY['Chrome', 'Safari', 'Firefox', 'Edge'])[floor(random() * 4 + 1)],
            (ARRAY['US', 'UK', 'CA', 'DE', 'FR', 'JP'])[floor(random() * 6 + 1)],
            NOW() - (day_offset || ' days')::INTERVAL + (random() * 86400 || ' seconds')::INTERVAL,
            random() > 0.15, -- 85% viewable
            (1000 + random() * 5000)::INTEGER, -- 1-6 seconds in view
            (50 + random() * 50)::INTEGER, -- 50-100% visible
            random() < 0.05, -- 5% click rate
            CASE WHEN random() < 0.05 THEN NOW() - (day_offset || ' days')::INTERVAL + (random() * 86400 || ' seconds')::INTERVAL + '2 seconds'::INTERVAL ELSE NULL END,
            random() * 0.3, -- Bot score 0-0.3 (mostly legitimate)
            random() < 0.02 -- 2% flagged as fraud
          ) RETURNING id INTO impression_id;
          
          total_impressions_created := total_impressions_created + 1;
          
          -- Update campaign metrics
          UPDATE campaigns
          SET impressions_won = impressions_won + 1,
              impressions_served = impressions_served + 1,
              spent_amount = spent_amount + winning_bid_record.amount,
              clicks = clicks + CASE WHEN random() < 0.05 THEN 1 ELSE 0 END
          WHERE id = winning_bid_record.campaign_id;
          
          -- Update creative metrics
          UPDATE ad_creatives
          SET impressions = impressions + 1,
              clicks = clicks + CASE WHEN random() < 0.05 THEN 1 ELSE 0 END
          WHERE id = winning_bid_record.creative_id;
          
          -- Update publisher earnings
          UPDATE publishers
          SET total_earnings = total_earnings + (winning_bid_record.amount * 0.95), -- 95% to publisher
              pending_earnings = pending_earnings + (winning_bid_record.amount * 0.95)
          WHERE id = publisher_record.id;
          
          -- Update ad slot metrics
          UPDATE ad_slots
          SET impressions_served = impressions_served + 1,
              clicks = clicks + CASE WHEN random() < 0.05 THEN 1 ELSE 0 END,
              total_revenue = total_revenue + (winning_bid_record.amount * 0.95)
          WHERE id = slot_record.id;
          
          -- Record transaction
          INSERT INTO transactions (
            advertiser_id,
            publisher_id,
            campaign_id,
            type,
            amount,
            tx_hash,
            auction_id,
            impression_id,
            status,
            created_at,
            confirmed_at
          ) VALUES (
            winning_bid_record.advertiser_id,
            publisher_record.id,
            winning_bid_record.campaign_id,
            'bid_win',
            winning_bid_record.amount,
            '0x' || md5(random()::TEXT || clock_timestamp()::TEXT),
            auction_id,
            impression_id,
            'confirmed',
            NOW() - (day_offset || ' days')::INTERVAL + (random() * 86400 || ' seconds')::INTERVAL,
            NOW() - (day_offset || ' days')::INTERVAL + (random() * 86400 || ' seconds')::INTERVAL + '5 seconds'::INTERVAL
          );
          
          -- For video ads, create attention events (30% chance)
          IF slot_record.slot_type = 'video' AND random() < 0.3 THEN
            -- Create 5-15 attention events
            FOR k IN 1..(5 + floor(random() * 10))::INTEGER LOOP
              INSERT INTO attention_events (
                impression_id,
                event_type,
                event_data,
                timestamp,
                relative_time,
                tab_visible,
                browser_focused
              ) VALUES (
                impression_id,
                (ARRAY['play', 'pause', 'quartile', 'complete', 'mute', 'unmute'])[floor(random() * 6 + 1)],
                jsonb_build_object('position', random() * 30),
                extract(epoch from NOW() - (day_offset || ' days')::INTERVAL + (random() * 86400 || ' seconds')::INTERVAL) * 1000,
                (random() * 30000)::INTEGER,
                random() > 0.1,
                random() > 0.2
              );
            END LOOP;
          END IF;
        END IF;
      END IF;
      
      -- Commit every 100 auctions to avoid long transactions
      IF total_auctions_created % 100 = 0 THEN
        COMMIT;
      END IF;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Historical data generation complete:';
  RAISE NOTICE '  - Auctions: %', total_auctions_created;
  RAISE NOTICE '  - Bids: %', total_bids_created;
  RAISE NOTICE '  - Impressions: %', total_impressions_created;
  
END $$;

-- Update campaign performance metrics
UPDATE campaigns
SET avg_cpm = CASE WHEN impressions_served > 0 THEN (spent_amount / impressions_served) * 1000 ELSE NULL END,
    avg_cpc = CASE WHEN clicks > 0 THEN spent_amount / clicks ELSE NULL END,
    avg_ctr = CASE WHEN impressions_served > 0 THEN (clicks::DECIMAL / impressions_served) ELSE NULL END;

-- Update creative performance metrics
UPDATE ad_creatives
SET ctr = CASE WHEN impressions > 0 THEN (clicks::DECIMAL / impressions) ELSE NULL END;

-- Populate daily_stats for the past 7 days
INSERT INTO daily_stats (date, entity_type, entity_id, auctions, bids, impressions, clicks, total_spent, platform_fees)
SELECT
  DATE(a.created_at) as date,
  'platform' as entity_type,
  NULL as entity_id,
  COUNT(DISTINCT a.id) as auctions,
  COUNT(DISTINCT b.id) as bids,
  COUNT(DISTINCT i.id) as impressions,
  SUM(CASE WHEN i.clicked THEN 1 ELSE 0 END) as clicks,
  COALESCE(SUM(a.winning_amount), 0) as total_spent,
  COALESCE(SUM(a.winning_amount * 0.05), 0) as platform_fees
FROM auctions a
LEFT JOIN bids b ON a.id = b.auction_id
LEFT JOIN impressions i ON a.id = i.auction_id
GROUP BY DATE(a.created_at);

-- Refresh dashboard stats
SELECT refresh_dashboard_stats();

-- Log the seeding
SELECT log_audit('system', NULL, 'seed_historical_data', 'auctions', NULL, 'Seeded 7 days of historical auction data', NULL);

ANALYZE auctions;
ANALYZE bids;
ANALYZE impressions;
ANALYZE transactions;
ANALYZE attention_events;
ANALYZE daily_stats;
