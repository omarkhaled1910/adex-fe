-- ============================================================================
-- Add category and subcategory to campaigns for bot spawner chunking
-- ============================================================================

-- Add category column to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS category VARCHAR(50);

-- Add subcategory column for more granular categorization
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS subcategory VARCHAR(50);

-- Create index on category for efficient bot spawner queries
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category);

-- Create index on subcategory
CREATE INDEX IF NOT EXISTS idx_campaigns_subcategory ON campaigns(subcategory);

-- Add comment for documentation
COMMENT ON COLUMN campaigns.category IS 'Primary category for campaign - used by bot spawner to assign campaigns to specialized bots';
COMMENT ON COLUMN campaigns.subcategory IS 'Secondary category for more granular bot assignment';
