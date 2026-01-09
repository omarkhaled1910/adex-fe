-- ============================================================================
-- GET BEST DEMO IDS FOR TESTING
-- Run this to find the best publisher and advertiser IDs with the most data
-- ============================================================================

-- Get the publisher with the most ad slots (good for testing)
SELECT 'DEMO_PUBLISHER_ID' as config_key, p.id as value, p.domain, p.company_name, 
       COUNT(DISTINCT s.id) as ad_slots_count,
       p.monthly_pageviews
FROM publishers p
LEFT JOIN ad_slots s ON s.publisher_id = p.id
WHERE p.status = 'active'
GROUP BY p.id, p.domain, p.company_name, p.monthly_pageviews
ORDER BY ad_slots_count DESC, p.monthly_pageviews DESC
LIMIT 1;

-- Get the advertiser with the most campaigns and creatives (good for testing)
SELECT 'DEMO_ADVERTISER_ID' as config_key, a.id as value, a.company_name, a.email,
       COUNT(DISTINCT c.id) as campaigns_count,
       COUNT(DISTINCT cr.id) as creatives_count,
       a.on_chain_balance
FROM advertisers a
LEFT JOIN campaigns c ON c.advertiser_id = a.id AND c.status = 'active'
LEFT JOIN ad_creatives cr ON cr.campaign_id = c.id AND cr.status = 'active'
WHERE a.status = 'active'
GROUP BY a.id, a.company_name, a.email, a.on_chain_balance
ORDER BY campaigns_count DESC, creatives_count DESC, a.on_chain_balance DESC
LIMIT 1;

-- Show all publishers with their data counts for reference
SELECT 
  p.id,
  p.domain,
  p.company_name,
  p.tier,
  COUNT(DISTINCT s.id) as ad_slots,
  p.monthly_pageviews,
  p.total_earnings
FROM publishers p
LEFT JOIN ad_slots s ON s.publisher_id = p.id
WHERE p.status = 'active'
GROUP BY p.id, p.domain, p.company_name, p.tier, p.monthly_pageviews, p.total_earnings
ORDER BY ad_slots DESC, p.monthly_pageviews DESC
LIMIT 10;

-- Show all advertisers with their data counts for reference
SELECT 
  a.id,
  a.company_name,
  a.email,
  COUNT(DISTINCT c.id) as campaigns,
  COUNT(DISTINCT cr.id) as creatives,
  a.on_chain_balance,
  a.total_spent
FROM advertisers a
LEFT JOIN campaigns c ON c.advertiser_id = a.id AND c.status = 'active'
LEFT JOIN ad_creatives cr ON cr.campaign_id = c.id AND cr.status = 'active'
WHERE a.status = 'active'
GROUP BY a.id, a.company_name, a.email, a.on_chain_balance, a.total_spent
ORDER BY campaigns DESC, creatives DESC, a.on_chain_balance DESC
LIMIT 10;
