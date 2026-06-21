# 🚀 SENTINELAI - COMPLETE SETUP & LOGIN GUIDE

## ✅ QUICK START (3 Commands)

```powershell
# 1. Start everything (runs database setup, backend, frontend)
cd C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel
.\start-all.ps1

# 2. Wait 2 minutes for services to start

# 3. Open browser and login
# Go to: http://localhost:3000/login
# Email: admin@sentinel.ai
# Password: Admin@123
```

**That's it! You're done! 🎉**

---

## 📋 WHAT THE SCRIPT DOES AUTOMATICALLY

### Step 1: Infrastructure (Docker Compose)
- ✅ Starts PostgreSQL database on port 5432
- ✅ Starts Redis cache on port 6379
- ✅ Starts Kafka message broker on port 9092
- ✅ Starts Zookeeper for Kafka
- ✅ Starts Kafka UI (http://localhost:8090)
- ✅ Starts pgAdmin (http://localhost:5050)
- ✅ Starts RedisInsight (http://localhost:8001)

### Step 2: Backend (Spring Boot + Flyway)
- ✅ Connects to PostgreSQL
- ✅ Runs 6 Flyway migrations (V1-V6)
- ✅ Creates 40+ tables
- ✅ Creates admin user (admin@sentinel.ai)
- ✅ Inserts seed data
- ✅ Starts REST API on port 8081

### Step 3: Frontend (Next.js)
- ✅ Starts development server
- ✅ Available on port 3000
- ✅ Login page ready
- ✅ Dashboard ready

---

## 🔐 LOGIN CREDENTIALS

**First Time Login:**
- URL: http://localhost:3000/login
- Email: `admin@sentinel.ai`
- Password: `Admin@123`
- Role: ADMIN

---

## 📊 WHAT YOU'LL SEE AFTER LOGIN

### Dashboard (http://localhost:3000/dashboard)
1. **6 KPI Cards:**
   - Total Transactions
   - Transaction Volume ($)
   - Fraud Detected
   - Fraud Rate (%)
   - Active Alerts
   - Active Cases

2. **2 Real-time Charts:**
   - Transaction Volume (Last 24h)
   - Fraud Detection (Last 24h)

3. **AI Chat:**
   - ChatGPT-style interface
   - Ask about fraud patterns
   - Get system insights

4. **Activity Feed:**
   - Recent fraud alerts
   - System events
   - Case updates

---

## 🗄️ DATABASE INFO (Auto-Created)

**Connection Details:**
- Database Name: `sentinel`
- Host: `localhost`
- Port: `5432`
- Username: `postgres`
- Password: `postgres`

**Access via pgAdmin:**
1. Go to http://localhost:5050
2. Login: admin@sentinel.com / admin
3. Add server:
   - Host: postgres
   - Port: 5432
   - Database: sentinel
   - Username: postgres
   - Password: postgres

**What's in the Database:**
- 40+ tables (all auto-created)
- Admin user
- 5 fraud rules
- 3 AI agents
- Sample merchants & customers
- Test transactions

---

## 🌐 ALL ACCESS URLS

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | admin@sentinel.ai / Admin@123 |
| **Login Page** | http://localhost:3000/login | ⬆️ |
| **Dashboard** | http://localhost:3000/dashboard | ⬆️ |
| **Backend API** | http://localhost:8081/api/v1 | - |
| **Health Check** | http://localhost:8081/actuator/health | - |
| **Kafka UI** | http://localhost:8090 | - |
| **pgAdmin** | http://localhost:5050 | admin@sentinel.com / admin |
| **RedisInsight** | http://localhost:8001 | - |

---

## 🧪 TEST THE LOGIN (API)

If you want to test the backend API directly:

```powershell
# Test login
curl -X POST http://localhost:8081/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@sentinel.ai\",\"password\":\"Admin@123\"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "email": "admin@sentinel.ai",
      "name": "Admin User",
      "role": "ADMIN"
    }
  }
}
```

---

## 🔍 VERIFY EVERYTHING IS RUNNING

```powershell
# Check Docker containers
docker ps

# Should show:
# sentinel-postgres
# sentinel-redis
# sentinel-kafka
# sentinel-zookeeper
# sentinel-kafka-ui
# sentinel-pgadmin
# sentinel-redis-insight

# Check backend health
curl http://localhost:8081/actuator/health

# Check frontend
curl http://localhost:3000
```

---

## 🛠️ TROUBLESHOOTING

### Issue: "Cannot connect to database"

**Solution:**
```powershell
# Check if PostgreSQL is running
docker ps | Select-String "postgres"

# If not, start it
cd C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel\backend
docker-compose up -d postgres

# Wait 30 seconds, then start backend again
```

### Issue: "Port 3000/8081 already in use"

**Solution:**
```powershell
# Find and kill processes
Get-Process -Name "node" | Stop-Process -Force
Get-Process -Name "java" | Stop-Process -Force

# Restart
.\start-all.ps1
```

### Issue: "404 Not Found" on frontend

**Solution:**
```powershell
# Rebuild frontend
cd C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel\sentinel-frontend
npm run build
npm run dev
```

### Issue: "Login fails with 401"

**Reasons:**
1. Backend not running → Check http://localhost:8081/actuator/health
2. Database not migrated → Check backend logs for Flyway errors
3. Wrong credentials → Use admin@sentinel.ai / Admin@123

**Fix:**
```powershell
# Restart backend to run migrations
cd C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel\backend
mvn spring-boot:run
```

### Issue: "Docker not running"

**Solution:**
1. Start Docker Desktop
2. Wait for it to be ready (green icon in system tray)
3. Run `.\start-all.ps1` again

---

## 🎯 WHAT'S CURRENTLY WORKING

### ✅ **Fully Functional:**
1. Login/Logout
2. Dashboard with KPIs
3. Real-time charts
4. AI Chat interface
5. Activity feed
6. Responsive sidebar
7. User menu

### ⚠️ **Mock Data (Not Real API):**
- Chart data (uses demo data)
- Activity feed (static demo)
- AI responses (demo mode)

### ❌ **Not Yet Implemented:**
- Transactions page
- Alerts page
- Cases page
- Analytics page
- Settings page

**Progress:** 30% (Phase 1-3 of 8 complete)

---

## 🔄 BACKEND API STATUS

### ✅ **Available APIs (50+ endpoints):**
- Authentication (login, logout, me)
- Transactions (CRUD)
- Alerts (CRUD, assign, resolve)
- Cases (CRUD, workflows)
- Fraud Detection (rules, scoring)
- AI Agents (chat, analysis)
- Behavioral Profiling
- Analytics
- Search

### ⚠️ **Frontend Using:**
- Login API ✅
- Dashboard stats API ✅ (with mock fallback)
- Everything else ❌ (not used yet)

---

## 📈 NEXT STEPS (Optional)

### To Complete Frontend:

**Week 1:** Transactions Page
- List with filters
- Detail modal
- Status updates

**Week 2:** Alerts & Fraud
- Alert dashboard
- Workflow management
- Real-time notifications

**Week 3:** Cases
- Kanban board
- Investigation tools
- Resolution workflow

**Week 4-5:** Analytics & Settings
- Advanced reports
- Admin panel
- System configuration

---

## 🛑 STOP ALL SERVICES

```powershell
# Easy way
.\stop-all.ps1

# Or manually
docker-compose down
# Then Ctrl+C in backend and frontend terminals
```

---

## 🎉 YOU'RE READY!

1. ✅ Database auto-created
2. ✅ Backend auto-configured
3. ✅ Frontend auto-configured
4. ✅ Admin user auto-created
5. ✅ All migrations auto-run

**Just run `.\start-all.ps1` and login!**

---

## 📞 SUPPORT

If something doesn't work:

1. Check logs in terminal windows
2. Verify Docker is running: `docker ps`
3. Verify backend: http://localhost:8081/actuator/health
4. Verify frontend: http://localhost:3000
5. Check database: Use pgAdmin at http://localhost:5050

**Most common fix:** Restart everything
```powershell
.\stop-all.ps1
.\start-all.ps1
```

---

## 🚀 READY TO LOGIN!

**URL:** http://localhost:3000/login
**Email:** admin@sentinel.ai
**Password:** Admin@123

**Enjoy exploring SentinelAI! 🎊**

