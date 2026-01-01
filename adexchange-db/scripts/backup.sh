#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    export DB_NAME=${DB_NAME:-adexchange}
fi

# Create backups directory if it doesn't exist
mkdir -p backups

# Generate backup filename with timestamp
BACKUP_FILE="backups/${DB_NAME}_$(date +%Y%m%d_%H%M%S).sql"

echo -e "${BLUE}Creating backup of '${DB_NAME}'...${NC}"
pg_dump ${DB_NAME} > ${BACKUP_FILE}

# Compress the backup
echo -e "${BLUE}Compressing backup...${NC}"
gzip ${BACKUP_FILE}

echo -e "${GREEN}✓ Backup created: ${BACKUP_FILE}.gz${NC}"
echo ""
echo -e "To restore this backup:"
echo -e "${BLUE}  gunzip -c ${BACKUP_FILE}.gz | psql ${DB_NAME}${NC}"
