-- ============================================================================
-- Add target_categories for campaign category targeting
-- Corresponds to publishers.website_category for targeting publishers by category
-- ============================================================================

-- Add target_categories array for multi-select category targeting
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS target_categories TEXT[];

-- Create GIN index for efficient array queries
CREATE INDEX IF NOT EXISTS idx_campaigns_target_categories ON campaigns USING GIN(target_categories);

-- Add comment for documentation
COMMENT ON COLUMN campaigns.target_categories IS 'Array of publisher website categories to target - corresponds to publishers.website_category field';
