# 🚀 Quick Setup Instructions

## Step-by-Step Installation on Mac

### 1️⃣ Install PostgreSQL 18

Open Terminal and run:

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL 18
brew install postgresql@18

# Add to PATH
echo 'export PATH="/opt/homebrew/opt/postgresql@18/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Start PostgreSQL service
brew services start postgresql@18

# Verify it's working
psql --version
# Should show: psql (PostgreSQL) 18.x
```

### 2️⃣ Download and Setup Database

```bash
# Navigate to your database directory
cd /path/to/adexchange-db

# Make scripts executable (already done)
chmod +x scripts/*.sh

# Copy environment template
cp .env.example .env

# Edit .env if needed (optional for local development)
nano .env
```

### 3️⃣ Run Setup Script

```bash
./scripts/setup.sh
```

**This will:**
- ✅ Create `adexchange` database
- ✅ Run all 8 migration files (22 tables)
- ✅ Ask if you want sample data
- ✅ If yes, seed 10 publishers, 10 advertisers, 14 campaigns, 3,500+ auctions

**Expected output:**
```
========================================
   AdExchange Database Setup
========================================

✓ PostgreSQL is running

Creating database 'adexchange'...
✓ Database created

Running migrations...
  → 001_publishers.sql
    ✓ Applied
  → 002_advertisers.sql
    ✓ Applied
  ...

✓ All migrations applied

Do you want to seed the database with sample data? (Y/n): Y

Seeding database...
  → 01_seed_publishers.sql
    ✓ Seeded
  ...

========================================
   Setup Complete!
========================================
```

### 4️⃣ Verify Installation

```bash
# Connect to database
psql adexchange

# Inside psql, run:
\dt                          # List all tables (should show 22 tables)
SELECT * FROM dashboard_stats;  # View platform stats
\q                          # Exit
```

### 5️⃣ Test with Sample Queries

```bash
psql adexchange -c "SELECT COUNT(*) FROM publishers;"
# Should return: 10

psql adexchange -c "SELECT COUNT(*) FROM campaigns WHERE status = 'active';"
# Should return: 14

psql adexchange -c "SELECT COUNT(*) FROM auctions;"
# Should return: ~3500
```

## 🎯 What You Get

After setup, your database contains:

| Entity | Count |
|--------|-------|
| Publishers | 10 major sites (CNN, NYTimes, etc.) |
| Ad Slots | 40+ across all publishers |
| Advertisers | 10 brands (Nike, Amazon, Google, etc.) |
| Campaigns | 14 active campaigns |
| Ad Creatives | 35+ banner/video/native ads |
| Historical Auctions | ~3,500 (past 7 days) |
| Bids | ~15,000 |
| Impressions | ~3,000 |

## 🔧 Common Commands

```bash
# Connect to database
psql adexchange

# Backup database
./scripts/backup.sh

# Reset database (DANGER: deletes all data)
./scripts/reset.sh

# Check PostgreSQL status
brew services list | grep postgresql

# Stop PostgreSQL
brew services stop postgresql@18

# Start PostgreSQL
brew services start postgresql@18
```

## 📊 Useful SQL Queries

### View all publishers
```sql
SELECT domain, company_name, total_earnings, status 
FROM publishers 
ORDER BY total_earnings DESC;
```

### View active campaigns
```sql
SELECT c.name, a.company_name, c.spent_amount, c.impressions_won, c.status
FROM campaigns c
JOIN advertisers a ON c.advertiser_id = a.id
WHERE c.status = 'active'
ORDER BY c.spent_amount DESC;
```

### Recent auctions
```sql
SELECT 
  a.id,
  p.domain as publisher,
  s.slot_name,
  a.floor_price,
  a.winning_amount,
  a.total_bids
FROM auctions a
JOIN publishers p ON a.publisher_id = p.id
JOIN ad_slots s ON a.ad_slot_id = s.id
ORDER BY a.created_at DESC
LIMIT 10;
```

## 🐛 Troubleshooting

### "PostgreSQL is not running"
```bash
brew services start postgresql@18
```

### "Database already exists"
```bash
dropdb adexchange
./scripts/setup.sh
```

### "Permission denied"
```bash
# Make sure you have createdb privileges
createuser -s $(whoami)
```

### Can't connect from Node.js
Make sure your connection string matches:
```javascript
const connectionString = 'postgresql://localhost:5432/adexchange';
```

## 🔌 Connect from Node.js

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'adexchange',
  user: process.env.DB_USER || 'your_username',
  password: process.env.DB_PASSWORD || '',
});

// Test query
async function test() {
  const result = await pool.query('SELECT * FROM dashboard_stats');
  console.log(result.rows[0]);
}

test();
```

## ✅ Next Steps

1. ✅ PostgreSQL 18 installed
2. ✅ Database created and seeded
3. 🔲 Connect your Node.js backend
4. 🔲 Build API endpoints
5. 🔲 Integrate with Socket.io server
6. 🔲 Add Redis for caching

## 📚 Additional Resources

- Full documentation: `README.md`
- Migration files: `migrations/`
- Seed data: `seeds/`
- Schema details: See README.md

## 🆘 Need Help?

1. Check `README.md` for detailed documentation
2. Verify PostgreSQL is running: `pg_isready`
3. Check logs: `tail -f /opt/homebrew/var/log/postgresql@18.log`
4. PostgreSQL docs: https://www.postgresql.org/docs/18/
