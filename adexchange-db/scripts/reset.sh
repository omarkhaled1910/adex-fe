#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    export DB_NAME=${DB_NAME:-adexchange}
fi

echo -e "${RED}========================================${NC}"
echo -e "${RED}   WARNING: Database Reset${NC}"
echo -e "${RED}========================================${NC}"
echo ""
echo -e "${YELLOW}This will DELETE all data in '${DB_NAME}'${NC}"
echo ""
read -p "Are you sure? Type 'DELETE' to confirm: " -r
echo

if [[ $REPLY != "DELETE" ]]; then
    echo -e "${GREEN}✓ Reset cancelled${NC}"
    exit 0
fi

echo -e "${RED}Dropping database...${NC}"
dropdb ${DB_NAME} 2>/dev/null || true

echo -e "${YELLOW}Recreating database...${NC}"
./scripts/setup.sh
