#!/bin/bash

# ============================================================================
# RESEED DATABASE SCRIPT
# This script resets auction data and seeds the database with realistic data
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database connection (modify as needed or set via environment variables)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-adexchange}"
DB_USER="${DB_USER:-$USER}"  # Default to current system user
DB_PASSWORD="${DB_PASSWORD:-}"

# Export for psql (only if password is set)
if [ -n "$DB_PASSWORD" ]; then
    export PGPASSWORD="$DB_PASSWORD"
fi

# Base directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SEEDS_DIR="$SCRIPT_DIR/../seeds"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}     AdExchange Database Reseed Script     ${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Function to run SQL file
run_sql() {
    local file=$1
    local name=$(basename "$file")
    echo -e "${YELLOW}Running: ${name}${NC}"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file" -q
    echo -e "${GREEN}✓ Completed: ${name}${NC}"
}

# Step 1: Reset auctions table
echo -e "\n${BLUE}Step 1: Resetting auctions and related tables...${NC}"
run_sql "$SCRIPT_DIR/reset_auctions.sql"

# Step 2: Seed demo accounts (predictable IDs for frontend)
echo -e "\n${BLUE}Step 2: Seeding demo accounts...${NC}"
if [ -f "$SEEDS_DIR/00_seed_demo_accounts.sql" ]; then
    run_sql "$SEEDS_DIR/00_seed_demo_accounts.sql"
fi

# Step 3: Seed publishers (if not already seeded)
echo -e "\n${BLUE}Step 3: Seeding publishers...${NC}"
run_sql "$SEEDS_DIR/01_seed_publishers.sql"

# Step 4: Seed advertisers
echo -e "\n${BLUE}Step 4: Seeding advertisers...${NC}"
run_sql "$SEEDS_DIR/02_seed_advertisers.sql"

# Step 5: Seed campaigns (expanded version for more data)
echo -e "\n${BLUE}Step 5: Seeding campaigns...${NC}"
if [ -f "$SEEDS_DIR/03_seed_campaigns_expanded.sql" ]; then
    run_sql "$SEEDS_DIR/03_seed_campaigns_expanded.sql"
else
    run_sql "$SEEDS_DIR/03_seed_campaigns.sql"
fi

# Step 6: Seed creatives (expanded version for more data)
echo -e "\n${BLUE}Step 6: Seeding creatives...${NC}"
if [ -f "$SEEDS_DIR/06_seed_creatives_expanded.sql" ]; then
    run_sql "$SEEDS_DIR/06_seed_creatives_expanded.sql"
else
    run_sql "$SEEDS_DIR/04_seed_creatives.sql"
fi

# Step 7: Seed enhanced data (additional publishers, advertisers, campaigns)
echo -e "\n${BLUE}Step 7: Seeding enhanced data...${NC}"
if [ -f "$SEEDS_DIR/10_seed_enhanced_data.sql" ]; then
    run_sql "$SEEDS_DIR/10_seed_enhanced_data.sql"
fi

# Step 8: Get demo IDs for reference
echo -e "\n${BLUE}Step 8: Getting demo IDs...${NC}"
run_sql "$SCRIPT_DIR/get_demo_ids.sql"

echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}     Database Reseed Complete!             ${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${YELLOW}Demo IDs for frontend config:${NC}"
echo -e "  DEMO_PUBLISHER_ID:  b0000001-0000-0000-0000-000000000001"
echo -e "  DEMO_ADVERTISER_ID: a0000001-0000-0000-0000-000000000001"
echo ""
echo -e "${YELLOW}These IDs are already configured in:${NC}"
echo -e "  lib/config.ts"
echo ""
