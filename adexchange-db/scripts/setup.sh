#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   AdExchange Database Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Add PostgreSQL 18 to PATH (Homebrew on Apple Silicon)
if [ -d "/opt/homebrew/opt/postgresql@18/bin" ]; then
    export PATH="/opt/homebrew/opt/postgresql@18/bin:$PATH"
    echo -e "${GREEN}✓ Found PostgreSQL 18 at /opt/homebrew/opt/postgresql@18${NC}"
# Homebrew on Intel Macs
elif [ -d "/usr/local/opt/postgresql@18/bin" ]; then
    export PATH="/usr/local/opt/postgresql@18/bin:$PATH"
    echo -e "${GREEN}✓ Found PostgreSQL 18 at /usr/local/opt/postgresql@18${NC}"
fi

# Load environment variables if .env exists
if [ -f .env ]; then
    echo -e "${GREEN}✓ Loading environment variables from .env${NC}"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}⚠ No .env file found, using defaults${NC}"
    export DB_NAME=${DB_NAME:-adexchange}
    export DB_USER=${DB_USER:-$(whoami)}
fi

echo -e "${BLUE}Database: ${DB_NAME}${NC}"
echo -e "${BLUE}User: ${DB_USER}${NC}"
echo ""

# Check if PostgreSQL is running (try Unix socket first, then TCP)
PG_READY=false
if pg_isready -q 2>/dev/null; then
    PG_READY=true
elif pg_isready -h /tmp -q 2>/dev/null; then
    PG_READY=true
elif [ -S /tmp/.s.PGSQL.5432 ]; then
    # Socket exists, PostgreSQL should be running
    PG_READY=true
fi

if [ "$PG_READY" = false ]; then
    echo -e "${RED}✗ PostgreSQL is not running or not accessible!${NC}"
    echo -e "${YELLOW}  Start it with: brew services start postgresql@18${NC}"
    echo -e "${YELLOW}  Or check: brew services list${NC}"
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL is running${NC}"
echo ""

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw ${DB_NAME}; then
    echo -e "${YELLOW}⚠ Database '${DB_NAME}' already exists${NC}"
    read -p "Do you want to DROP and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Terminating existing connections...${NC}"
        psql -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();" -q 2>/dev/null || true
        echo -e "${YELLOW}Dropping database...${NC}"
        dropdb ${DB_NAME}
        echo -e "${GREEN}✓ Database dropped${NC}"
    else
        echo -e "${RED}✗ Setup cancelled${NC}"
        exit 1
    fi
fi

# Create database
echo -e "${BLUE}Creating database '${DB_NAME}'...${NC}"
createdb ${DB_NAME}
echo -e "${GREEN}✓ Database created${NC}"
echo ""

# Run migrations
echo -e "${BLUE}Running migrations...${NC}"
for migration in migrations/*.sql; do
    if [ -f "$migration" ]; then
        echo -e "${BLUE}  → $(basename $migration)${NC}"
        psql -d ${DB_NAME} -f "$migration" -q
        echo -e "${GREEN}    ✓ Applied${NC}"
    fi
done
echo -e "${GREEN}✓ All migrations applied${NC}"
echo ""

# Ask if user wants to seed data
read -p "Do you want to seed the database with sample data? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    echo -e "${BLUE}Seeding database...${NC}"
    for seed in seeds/*.sql; do
        if [ -f "$seed" ]; then
            echo -e "${BLUE}  → $(basename $seed)${NC}"
            psql -d ${DB_NAME} -f "$seed" -q
            echo -e "${GREEN}    ✓ Seeded${NC}"
        fi
    done
    echo -e "${GREEN}✓ Database seeded with sample data${NC}"
else
    echo -e "${YELLOW}⚠ Skipping seed data${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Connect to your database with:"
echo -e "${BLUE}  psql ${DB_NAME}${NC}"
echo ""
echo -e "Useful queries:"
echo -e "${BLUE}  \\dt${NC}                  - List all tables"
echo -e "${BLUE}  \\d publishers${NC}        - Describe publishers table"
echo -e "${BLUE}  SELECT * FROM dashboard_stats;${NC}  - View dashboard stats"
echo ""
