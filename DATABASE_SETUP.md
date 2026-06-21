# 🗄️ POSTGRESQL DATABASE SETUP - SENTINELAI

## Database Configuration

**Database Name:** `sentinel`
**Username:** `postgres`
**Password:** `postgres`
**Host:** `localhost`
**Port:** `5432`

---

## Quick Setup (3 Steps)

### Step 1: Create Database

Open PostgreSQL command line (psql) or pgAdmin and run:

```sql
CREATE DATABASE sentinel;
```

### Step 2: Create Admin User (Optional - if not using default postgres)

```sql
CREATE USER sentinel_admin WITH PASSWORD 'sentinel123';
GRANT ALL PRIVILEGES ON DATABASE sentinel TO sentinel_admin;
```

### Step 3: Verify Connection

```bash
psql -h localhost -p 5432 -U postgres -d sentinel
```

---

## Option A: Using Docker (EASIEST)

The backend already has Docker Compose configured! Just run:

```bash
cd C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel\backend
docker-compose up -d
```

This will automatically:
- ✅ Start PostgreSQL on port 5432
- ✅ Start Redis on port 6379
- ✅ Start Kafka + Zookeeper
- ✅ Create the `sentinel` database
- ✅ Configure admin user

**Then verify:**
```bash
docker ps
```

You should see:
- `sentinel-postgres`
- `sentinel-redis`
- `kafka`
- `zookeeper`

---

## Option B: Manual PostgreSQL Installation

### Windows Installation:

1. **Download PostgreSQL:**
   - Go to: https://www.postgresql.org/download/windows/
   - Download PostgreSQL 15 or 16
   - Run installer

2. **During Installation:**
   - Set password: `postgres`
   - Port: `5432`
   - Keep defaults

3. **After Installation:**
   - Open pgAdmin 4 (installed with PostgreSQL)
   - Connect to local server
   - Right-click "Databases" → Create → Database
   - Name: `sentinel`
   - Owner: `postgres`
   - Click Save

4. **Or use Command Line:**
```bash
# Open Command Prompt
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres

# In psql:
CREATE DATABASE sentinel;
\c sentinel
\q
```

---

## Step 3: Start Backend (It will auto-migrate)

The backend uses Flyway migrations that will automatically create all tables on first run!

```bash
cd C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel\backend

# If using Docker (recommended):
docker-compose up -d
mvn spring-boot:run

# Or just backend (if you have PostgreSQL installed):
mvn spring-boot:run
```

**What happens:**
1. Backend connects to PostgreSQL
2. Flyway runs 6 migrations (V1 to V6)
3. Creates 40+ tables
4. Inserts seed data
5. Creates admin user

---

## Step 4: Verify Database Tables

Connect to database and check:

```sql
-- Connect
\c sentinel

-- List all tables (should see 40+)
\dt

-- Check users table
SELECT * FROM users;

-- Check admin user exists
SELECT username, email, role FROM users WHERE role = 'ADMIN';
```

You should see:
```
username | email              | role
---------|-------------------|------
admin    | admin@sentinel.ai | ADMIN
```

---

## Step 5: Test Login

### Option A: Use Frontend
1. Start frontend: `npm run dev`
2. Go to http://localhost:3000/login
3. Login with:
   - Email: `admin@sentinel.ai`
   - Password: `Admin@123`

### Option B: Test API Directly
```bash
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@sentinel.ai\",\"password\":\"Admin@123\"}"
```

Should return:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "...",
      "email": "admin@sentinel.ai",
      "name": "Admin User",
      "role": "ADMIN"
    }
  }
}
```

---

## Connection Strings

### Java (Backend - already configured):
```yaml
spring.datasource.url=jdbc:postgresql://localhost:5432/sentinel
spring.datasource.username=postgres
spring.datasource.password=postgres
```

### Node.js (if needed):
```javascript
const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'sentinel',
  user: 'postgres',
  password: 'postgres',
});
```

### Connection URL:
```
postgresql://postgres:postgres@localhost:5432/sentinel
```

---

## All Tables Created by Migrations

After backend starts, you'll have:

### Phase 1 (V1__initial_schema.sql):
- users, roles, permissions
- transactions, transaction_metadata
- fraud_rules, fraud_scores, fraud_patterns
- alerts, alert_actions, alert_notes
- merchants, customers
- audit_logs

### Phase 2 (V2__behavioral_intelligence.sql):
- behavioral_profiles
- device_fingerprints
- velocity_checks
- location_history

### Phase 3 (V3__case_management.sql):
- cases, case_notes, case_evidence
- case_workflows, workflow_steps
- case_assignments

### Phase 4 (V4__analytics.sql):
- transaction_summary_mv (materialized view)
- merchant_risk_profiles
- country_risk_profiles

### Phase 5 (V5__ai_agents.sql):
- ai_agents, agent_executions
- agent_decisions, agent_feedback
- llm_prompts, llm_responses

### Phase 6 (V6__event_driven.sql):
- event_store
- kafka_event_log
- agent_tracking

**Total: 40+ tables**

---

## Troubleshooting

### Issue: "Connection refused"
**Solution:** PostgreSQL not running
```bash
# Check if running:
docker ps
# Or on Windows:
services.msc (look for postgresql-x64-15)
```

### Issue: "Database does not exist"
**Solution:** Create it:
```sql
CREATE DATABASE sentinel;
```

### Issue: "Password authentication failed"
**Solution:** Update password:
```sql
ALTER USER postgres WITH PASSWORD 'postgres';
```

### Issue: "Port 5432 already in use"
**Solution:** Stop other PostgreSQL instances:
```bash
docker stop $(docker ps -aq)
```

### Issue: "Backend won't start"
**Solution:** Check logs:
```bash
mvn spring-boot:run
# Look for error messages
```

Common issues:
- PostgreSQL not running → Start it
- Database doesn't exist → Create it
- Wrong password → Fix in application.yaml

---

## What Gets Created

### Default Admin User:
- **Email:** admin@sentinel.ai
- **Password:** Admin@123
- **Role:** ADMIN
- **Name:** Admin User

### Sample Data (from migrations):
- 5 fraud rules
- 3 AI agents
- Seed merchants & customers
- Test transactions

---

## Next Steps After Database Setup

1. ✅ Database created
2. ✅ Backend started (migrations run automatically)
3. ✅ Tables created
4. ✅ Admin user created
5. 🚀 **Go to http://localhost:3000/login**
6. 🚀 **Login and see the dashboard!**

---

## Quick Reference

| What | Value |
|------|-------|
| Database | `sentinel` |
| Host | `localhost` |
| Port | `5432` |
| Username | `postgres` |
| Password | `postgres` |
| Admin Email | `admin@sentinel.ai` |
| Admin Password | `Admin@123` |
| Backend URL | `http://localhost:8081` |
| Frontend URL | `http://localhost:3000` |

---

## TLDR - Fastest Setup

```bash
# 1. Start everything with Docker
cd C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel\backend
docker-compose up -d

# 2. Start backend (migrations auto-run)
mvn spring-boot:run

# 3. Start frontend
cd ..\sentinel-frontend
npm run dev

# 4. Login
# Go to http://localhost:3000/login
# Email: admin@sentinel.ai
# Password: Admin@123
```

**Done! 🚀**

