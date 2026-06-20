# 🚀 SentinelAI - Quick Reference & Setup Guide

---

## 📚 Documentation Overview

### Comprehensive Docs
1. **SENTINELAI_MASTER_ARCHITECTURE.md** ⭐ START HERE
   - Complete 6-phase overview
   - Architecture diagrams
   - Technology decisions
   - Success criteria

2. **PHASE1_DETAILED_IMPLEMENTATION.md**
   - Stages 1-3 with code examples
   - Stage 4-10 overview
   - Database schema
   - Progress tracking

3. **PHASES2-6_COMPREHENSIVE_ROADMAP.md**
   - Detailed Phase 2-6 plans
   - Feature breakdowns
   - Database changes
   - Implementation tasks

---

## 🏗️ Architecture Summary

### Hexagonal (Ports & Adapters)
```
REST API (Input)
    ↓
Application Services (Orchestration)
    ↓
Domain Layer (Pure Business Logic)
    ↓
Output Adapters (Database, AI, Cache)
```

### Package Structure
```
com.sentinelai/
├── common/          # Shared DTOs, exceptions, config
├── auth/           # Authentication (JWT)
├── transaction/    # Transaction ingestion
├── fraud/          # Rules + Risk scoring
├── alert/          # Alert management
├── ai/             # AI explanations + Agents
├── analytics/      # Dashboard & reports
├── audit/          # Audit trail
└── profile/        # User behavior (Phase 2+)
```

---

## 🛠️ Tech Stack

### Core
- **Java**: 21
- **Framework**: Spring Boot 3.2.6
- **Build**: Maven (Single module)

### Database
- **PostgreSQL**: 16
- **Migrations**: Flyway
- **ORM**: Spring Data JPA + Hibernate

### Security
- **Auth**: JWT (HS256)
- **Password**: BCrypt (strength 12)
- **RBAC**: Role-based access control

### AI (Phase 5+)
- **Phase 1-4**: Rule-based explanations
- **Phase 5**: OpenAI GPT-4 or Claude
- **Phase 6**: Advanced LLM agents

### Caching (Phased)
- **Phase 1-3**: No cache
- **Phase 4**: Caffeine (L1 local cache)
- **Phase 6**: Redis (L2 distributed cache)

### Async & Messaging (Phase 6)
- **Queue**: Kafka (event streaming)
- **Format**: JSON (structured events)

---

## 📊 Performance Targets

| Phase | TPS | P95 Latency | Key Addition |
|-------|-----|-------------|--------------|
| 1 | 1k | <100ms | Rules + Risk scoring |
| 2 | 1k | <100ms | Behavioral intelligence |
| 3 | 2k | <150ms | Case management |
| 4 | 2k | <200ms | Caffeine caching |
| 5 | 5k | <200ms | Real AI + Agents |
| 6 | 10k+ | <150ms | Kafka + Redis scale |

---

## 🔄 6-Phase Timeline

### Phase 1: Core Engine (Week 1-2)
✅ Foundation + DB
✅ Authentication
✅ Transaction ingestion
✅ Fraud rules (5+)
✅ Risk scoring
✅ Alert generation
✅ Rule-based AI
✅ Dashboard

### Phase 2: Behavior (Week 3)
✅ User profiling
✅ Device tracking
✅ Velocity analysis
✅ Anomaly detection

### Phase 3: Cases (Week 4)
✅ Case management
✅ Workflow engine
✅ Collaboration
✅ Notifications

### Phase 4: Analytics (Week 5)
✅ Advanced reports
✅ Trend analysis
✅ Caffeine caching
✅ Business intelligence

### Phase 5: AI Agents (Week 6)
✅ OpenAI/Claude integration
✅ Investigation agent
✅ Recommendation agent
✅ Pattern discovery

### Phase 6: Event-Driven Scale (Week 7-8)
✅ Kafka streaming
✅ Redis caching
✅ Event sourcing
✅ Autonomous agents

---

## 📂 File Structure

After setup, your project should look like:

```
sentinelai/
├── sentinelai-backend/
│   ├── pom.xml                           # Maven POM
│   ├── docker-compose.yml                # Local dev environment
│   ├── mvnw / mvnw.cmd                   # Maven wrapper
│   │
│   ├── src/main/java/com/sentinelai/
│   │   ├── SentinelAiApplication.java
│   │   ├── common/
│   │   │   ├── dto/
│   │   │   ├── exception/
│   │   │   ├── util/
│   │   │   └── config/
│   │   ├── auth/
│   │   ├── transaction/
│   │   ├── fraud/
│   │   ├── alert/
│   │   ├── ai/
│   │   ├── analytics/
│   │   ├── audit/
│   │   └── profile/        (Phase 2+)
│   │
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── application-dev.yml
│   │   ├── application-prod.yml
│   │   └── db/migration/
│   │       └── V1__initial_schema.sql
│   │
│   ├── src/test/java/com/sentinelai/
│   │   ├── {module}/
│   │   └── integration/
│   │
│   └── README.md
│
├── sentinelai-frontend/                 (After Phase 1 backend)
│   ├── package.json
│   ├── src/
│   ├── public/
│   └── ...
│
└── documentation/
    ├── SENTINELAI_MASTER_ARCHITECTURE.md
    ├── PHASE1_DETAILED_IMPLEMENTATION.md
    └── PHASES2-6_COMPREHENSIVE_ROADMAP.md
```

---

## 🎯 Getting Started (Phase 1)

### Prerequisites
- Java 21+
- Maven 3.8+
- PostgreSQL 14+ (or Docker)
- Git

### Step 1: Project Setup

**Option A: From Spring Initializr** (Recommended)
1. Go to https://start.spring.io/
2. Settings:
   - Project: Maven
   - Language: Java
   - Spring Boot: 3.2.6
   - Packaging: Jar
   - Java: 21

3. Dependencies:
   ```
   Spring Web
   Spring Data JPA
   PostgreSQL Driver
   Flyway Migration
   Spring Security
   Lombok
   Validation
   ```

4. Generate and extract

**Option B: Manual Maven Setup**
```bash
mvn archetype:generate \
  -DgroupId=com.sentinelai \
  -DartifactId=sentinelai-backend \
  -Dversion=1.0.0 \
  -DarchetypeArtifactId=maven-archetype-quickstart
```

### Step 2: Add Dependencies

Update `pom.xml`:

```xml
<dependencies>
    <!-- Spring Boot -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    
    <!-- Database -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
    </dependency>
    
    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.3</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>
    
    <!-- Utilities -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    <dependency>
        <groupId>org.apache.commons</groupId>
        <artifactId>commons-csv</artifactId>
        <version>1.10.0</version>
    </dependency>
    
    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### Step 3: Docker Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: sentinelai-postgres
    environment:
      POSTGRES_USER: sentinelai
      POSTGRES_PASSWORD: sentinelai
      POSTGRES_DB: sentinelai
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: sentinelai-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@sentinelai.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### Step 4: Application Configuration

Create `src/main/resources/application.yml`:

```yaml
spring:
  application:
    name: sentinelai-backend
  
  datasource:
    url: jdbc:postgresql://localhost:5432/sentinelai
    username: sentinelai
    password: sentinelai
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 10000
  
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
        jdbc:
          batch_size: 20
  
  flyway:
    enabled: true
    locations: classpath:db/migration
    out-of-order: false

jwt:
  secret: your-256-bit-secret-key-here-change-in-production
  access-token-expiration: 3600
  refresh-token-expiration: 604800

logging:
  level:
    root: INFO
    com.sentinelai: DEBUG
  pattern:
    console: "%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
```

### Step 5: Start Development

```bash
# Start database
docker-compose up -d

# Build project
mvn clean install -DskipTests

# Run application
mvn spring-boot:run

# Or run JAR
java -jar target/sentinelai-backend-1.0.0.jar
```

### Step 6: Verify Setup

```bash
# Health check
curl http://localhost:8080/actuator/health

# Create test organization (if migration runs)
curl -X POST http://localhost:5432 \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Org", "planType": "BASIC"}'
```

---

## 🧪 Testing Strategy

### Unit Tests
```java
// Test domain logic (no Spring, no DB)
@Test
void testRiskScoringCalculation() {
    // Create test transaction
    // Calculate risk score
    // Assert result
}
```

### Integration Tests
```java
@SpringBootTest
@AutoConfigureMockMvc
class TransactionIntegrationTest {
    // Test full workflows
    // Test database operations
    // Test API endpoints
}
```

### Load Tests (Phase 1+)
```bash
# Using JMeter or Gatling
# Target: 1000 TPS
# Monitor: latency, throughput, errors
```

---

## 📋 Checklist: Before You Start Phase 1

### Setup ✅
- [ ] Java 21 installed
- [ ] Maven 3.8+ installed
- [ ] PostgreSQL or Docker ready
- [ ] Git repository initialized

### Documentation ✅
- [ ] Read SENTINELAI_MASTER_ARCHITECTURE.md
- [ ] Understand hexagonal architecture
- [ ] Review fraud detection pipeline
- [ ] Review risk scoring formula

### Project ✅
- [ ] Maven project created
- [ ] pom.xml with dependencies
- [ ] Application.yml configured
- [ ] Package structure created
- [ ] Database setup (Docker or local)

### Database ✅
- [ ] PostgreSQL running
- [ ] Database created
- [ ] Flyway configured
- [ ] V1__initial_schema.sql ready

### Ready to Code ✅
- [ ] IDE open (IntelliJ/VS Code)
- [ ] Project builds successfully
- [ ] No errors on startup
- [ ] Health endpoint working

---

## 🚀 Phase 1 Implementation Order

### Week 1
**Day 1-2: Foundation**
- [ ] Stage 1: Common DTOs, exceptions, config
- [ ] Database migrations
- [ ] Application startup

**Day 3: Authentication**
- [ ] Stage 2: Auth module
- [ ] JWT implementation
- [ ] User registration/login

**Day 4: Transactions**
- [ ] Stage 3: Transaction ingestion
- [ ] CSV upload
- [ ] Idempotency

**Day 5: Rules & Risk**
- [ ] Stage 4: Fraud rules engine
- [ ] Stage 5: Risk scoring

### Week 2
**Day 6: Alerts & AI**
- [ ] Stage 6: Alert system
- [ ] Stage 7: Rule-based AI explanations

**Day 7: Analytics**
- [ ] Stage 8: Dashboard APIs

**Day 8-10: Integration & Optimization**
- [ ] Stage 9: Integration tests
- [ ] Stage 10: Performance tuning
- [ ] Load testing

---

## 📞 Key Files to Review First

1. **SENTINELAI_MASTER_ARCHITECTURE.md**
   - Read this first!
   - Understand all 6 phases
   - Review architecture diagrams

2. **PHASE1_DETAILED_IMPLEMENTATION.md**
   - Stages 1-3 with code
   - Database schema
   - DTOs and services

3. **PHASES2-6_COMPREHENSIVE_ROADMAP.md**
   - What comes after Phase 1
   - Agent architecture
   - Event-driven scale

---

## 🔗 ReconIQ Reference

If you need examples of production patterns, check:
- `C:\Users\Sufyan\Downloads\MVP\reconai\reconiq-backend\`
- Domain layer patterns
- Hexagonal architecture implementation
- Exception handling strategies
- JWT/Security configuration

---

## 🎯 Success Criteria Summary

### Phase 1 Complete When:
- [ ] User can register/login
- [ ] Transactions can be uploaded (API + CSV)
- [ ] Fraud detection running
- [ ] Alerts created automatically
- [ ] AI explanations provided
- [ ] Dashboard APIs working
- [ ] **1,000 TPS achieved**
- [ ] **P95 latency <100ms**

### Code Quality:
- [ ] Hexagonal architecture maintained
- [ ] Domain layer has ZERO Spring dependencies
- [ ] All APIs documented (Swagger)
- [ ] Unit tests (>80% coverage for domain)
- [ ] Integration tests for workflows
- [ ] No SQL injection vulnerabilities
- [ ] Proper exception handling

---

## 🚀 Ready to Start?

1. ✅ Read SENTINELAI_MASTER_ARCHITECTURE.md
2. ✅ Setup project from this guide
3. ✅ Follow PHASE1_DETAILED_IMPLEMENTATION.md
4. ✅ Implement stages 1-10
5. ✅ Run load tests
6. ✅ Deploy Phase 1 MVP

**Let's build an elite fraud detection platform! 🔥**

---

**Questions? Review the documentation or check ReconIQ examples.**

**Ready? Start with Stage 1 now! 🚀**

