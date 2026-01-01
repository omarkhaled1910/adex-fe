# AdExchange Database Setup

Complete PostgreSQL 18 database schema for the AdExchange platform.

## Quick Start

### 1. Install PostgreSQL 18

```bash
# Using Homebrew
brew install postgresql@18

# Add to PATH
echo 'export PATH="/opt/homebrew/opt/postgresql@18/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Start PostgreSQL
brew services start postgresql@18

# Verify installation
psql --version
```

### 2. Setup Database

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run setup
./scripts/setup.sh
```

This will:
- Create the `adexchange` database
- Run all migrations (22 tables)
- Seed with sample data (optional)

### 3. Connect to Database

```bash
psql adexchange
```

## Database Schema Overview

### Tables by Phase

#### Phase 1: Publisher SDK (6 tables)
- `publishers` - Publisher accounts and verification
- `ad_slots` - Ad placements on publisher sites
- `admin_users` - Platform administrators
- `audit_logs` - Action tracking
- `platform_config` - System settings
- `ip_reputation` - IP fraud tracking

#### Phase 2: Advertiser Dashboard (6 tables)
- `advertisers` - Advertiser accounts
- `campaigns` - Ad campaigns with targeting
- `ad_creatives` - Ad content and assets
- `transactions` - Money movements
- `daily_budget_tracking` - Daily spend tracking
- `user_fingerprints` - Frequency capping

#### Phase 3: Proof of Attention (6 tables)
- `auctions` - Real-time bidding auctions
- `bids` - Bid submissions
- `impressions` - Actual ad views
- `attention_events` - User engagement tracking
- `attention_proofs` - Aggregated proofs
- (Enhanced transactions for settlements)

#### Phase 4: Fraud & Analytics (4 tables)
- `fraud_rules` - Detection rules
- `fraud_incidents` - Detected fraud
- `daily_stats` - Aggregated analytics
- `dashboard_stats` - Real-time materialized view

**Total: 22 tables**

## Sample Data Included

After seeding, you'll have:
- 10 publishers (CNN, NYTimes, TechCrunch, etc.)
- 40+ ad slots across publishers
- 10 advertisers (Nike, Amazon, Google, etc.)
- 14 active campaigns
- 35+ ad creatives
- 3,500+ historical auctions (past 7 days)
- 15,000+ bids
- ~3,000 impressions

## Useful Queries

### View Dashboard Stats
```sql
SELECT * FROM dashboard_stats;
```

### Top Campaigns by Spend
```sql
SELECT 
  c.name,
  a.company_name,
  c.spent_amount,
  c.impressions_won,
  c.clicks,
  c.avg_ctr
FROM campaigns c
JOIN advertisers a ON c.advertiser_id = a.id
WHERE c.status = 'active'
ORDER BY c.spent_amount DESC
LIMIT 10;
```

### Publisher Revenue
```sql
SELECT 
  domain,
  company_name,
  total_earnings,
  pending_earnings,
  (SELECT COUNT(*) FROM ad_slots WHERE publisher_id = p.id) as slots
FROM publishers p
ORDER BY total_earnings DESC;
```

### Recent Auctions
```sql
SELECT 
  a.id,
  p.domain,
  s.slot_name,
  a.floor_price,
  a.winning_amount,
  a.total_bids,
  a.created_at
FROM auctions a
JOIN publishers p ON a.publisher_id = p.id
JOIN ad_slots s ON a.ad_slot_id = s.id
ORDER BY a.created_at DESC
LIMIT 20;
```

### Fraud Detection
```sql
SELECT 
  fraud_type,
  COUNT(*) as incidents,
  AVG(confidence_score) as avg_confidence
FROM fraud_incidents
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY fraud_type
ORDER BY incidents DESC;
```

### Daily Performance
```sql
SELECT 
  date,
  auctions,
  impressions,
  clicks,
  total_spent,
  (clicks::DECIMAL / NULLIF(impressions, 0)) * 100 as ctr
FROM daily_stats
WHERE entity_type = 'platform'
ORDER BY date DESC
LIMIT 7;
```

## Scripts

### Setup
```bash
./scripts/setup.sh
```
Creates database and runs migrations. Optionally seeds data.

### Reset
```bash
./scripts/reset.sh
```
**WARNING:** Deletes all data and recreates database.

### Backup
```bash
./scripts/backup.sh
```
Creates compressed backup in `backups/` directory.

### Restore
```bash
gunzip -c backups/adexchange_20260101_120000.sql.gz | psql adexchange
```

## Connection from Node.js

```javascript
// Using pg library
const { Pool } = require('pg');

const pool = new Pool({
  user: 'your_username',
  host: 'localhost',
  database: 'adexchange',
  password: 'your_password',
  port: 5432,
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  console.log(err, res);
  pool.end();
});
```

## Environment Variables

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Then edit `.env`:
```
DB_NAME=adexchange
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

## Maintenance

### Vacuum Database
```bash
psql adexchange -c "VACUUM ANALYZE;"
```

### Refresh Dashboard Stats
```sql
SELECT refresh_dashboard_stats();
```

### View Table Sizes
```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Troubleshooting

### PostgreSQL not running
```bash
brew services start postgresql@18
```

### Can't connect
```bash
# Check if PostgreSQL is listening
pg_isready

# Check service status
brew services list | grep postgresql
```

### Permission denied
```bash
# Create user with superuser privileges
createuser -s your_username
```

### Database already exists
```bash
# Drop and recreate
dropdb adexchange
./scripts/setup.sh
```

## Production Considerations

1. **Indexes**: All critical indexes are included
2. **Constraints**: Foreign keys and unique constraints enforced
3. **Triggers**: Auto-updating `updated_at` timestamps
4. **Materialized Views**: `dashboard_stats` for fast analytics
5. **Partitioning**: Consider partitioning large tables:
   - `auctions` by created_at (monthly)
   - `impressions` by served_at (monthly)
   - `transactions` by created_at (monthly)

6. **Backups**: Schedule daily backups with cron
7. **Monitoring**: Use `pg_stat_statements` extension
8. **Replication**: Setup read replicas for analytics queries

## Next Steps

1. Connect your Node.js backend to this database
2. Implement API endpoints for CRUD operations
3. Setup Redis for auction state caching
4. Configure automated backups
5. Setup monitoring and alerting

## Support

For issues or questions, refer to:
- [PostgreSQL 18 Documentation](https://www.postgresql.org/docs/18/)
- [pg (node-postgres) Documentation](https://node-postgres.com/)
