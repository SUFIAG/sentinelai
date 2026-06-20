# 🚀 SentinelAI - Master Architecture & Implementation Plan
## **Elite Fraud Intelligence Platform with AI Agents**

---

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Hexagonal Architecture](#hexagonal-architecture)
3. [6-Phase Implementation Roadmap](#6-phase-implementation-roadmap)
4. [Technology Stack](#technology-stack)
5. [Key Features by Phase](#key-features-by-phase)
6. [Project Structure](#project-structure)
7. [Success Criteria](#success-criteria)

---

## 🎯 System Overview

### Purpose
SentinelAI is an **enterprise-grade fraud intelligence platform** that detects, analyzes, prevents fraudulent financial transactions using:
- 🔍 **Rule-based fraud detection** (Phase 1-3)
- 🤖 **AI-powered investigation agents** (Phase 5-6)
- 🧠 **Intelligent recommendations** (Phase 5-6)
- 📊 **Business intelligence** (Phase 4-6)
- 🔐 **Complete audit trail** (All phases)

### Core Value Proposition
- **Real-time Detection**: <100ms fraud analysis
- **High Accuracy**: 95%+ fraud detection with <5% false positives
- **Explainable AI**: Every decision is auditable and transparent
- **Scalability**: From 1k TPS (MVP) → 10k TPS (production)
- **Business-Driven**: Agents focus on practical investigation workflows

### Target Metrics
| Phase | TPS | P95 Latency | Features |
|-------|-----|-------------|----------|
| **1** | 1k | <100ms | Rules + Scoring + Basic AI |
| **2** | 1k | <100ms | + Behavior Intelligence |
| **3** | 2k | <150ms | + Case Management |
| **4** | 2k | <200ms | + Caching + Analytics |
| **5** | 5k | <200ms | + Real AI + Agents |
| **6** | 10k+ | <150ms | + Event-Driven Scale |

---

## 🏗️ Hexagonal Architecture

### Design Principle
```
┌─────────────────────────────────────────────────┐
│              REST Adapters (Input)              │
│           (Controllers, Request DTOs)           │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│         Application Layer (Use Cases)           │
│      (Services, Orchestration, Workflows)       │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│           Domain Layer (Pure Logic)             │
│    (Entities, Value Objects, Domain Services)   │
│    ⚠️  NO Spring, NO Database, NO HTTP          │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│        Output Adapters (Persistence, AI)        │
│     (JPA Repos, AI Clients, Cache Adapters)    │
└─────────────────────────────────────────────────┘
```

### Key Principles
1. **Domain-Driven Design** - Business logic is king
2. **Clear Boundaries** - Package structure reflects business domains
3. **Loose Coupling** - Modules communicate via ports/interfaces
4. **Easy to Test** - Domain layer has zero external dependencies
5. **Production-Ready** - Includes audit, idempotency, error handling

---

## 📅 6-Phase Implementation Roadmap

### ✅ PHASE 1: Core Fraud Engine (Week 1-2)
**Goal**: Working fraud detection system with rule-based AI

**Modules**:
- ✅ Common (DTOs, exceptions, config)
- ✅ Auth (JWT, multi-tenancy)
- ✅ Transaction (API + CSV streaming)
- ✅ Fraud Rules (5+ rules)
- ✅ Risk Scoring (weighted formula)
- ✅ Alerts (creation & management)
- ✅ AI Explanations (rule-based)
- ✅ Analytics (dashboard KPIs)

**Database**:
- Organizations, Users, Transactions
- Fraud Rules, Risk Scores, Fraud Alerts
- AI Explanations, Audit Trail
- Idempotency Keys

**Performance**:
- 1,000 TPS sustained
- <100ms P95 latency
- Zero data loss

---

### ✅ PHASE 2: Behavioral Intelligence (Week 3)
**Goal**: Understand user behavior patterns

**New Modules**:
- ✅ User Profiles (transaction history, patterns)
- ✅ Device Tracking (fingerprinting, risk scoring)
- ✅ Velocity Analysis (transaction frequency)
- ✅ Geographic Tracking (location patterns)

**Enhanced**:
- Risk scoring with behavioral factors
- Anomaly detection (statistical)
- Device risk calculation
- Location deviation detection

**Database**:
- User profiles table
- Device fingerprints table
- Velocity metrics table
- Geographic history table

**Performance**:
- Maintain 1,000 TPS
- <100ms P95 latency for enriched analysis

---

### ✅ PHASE 3: Case Management & Workflow (Week 4)
**Goal**: Enable investigation and team collaboration

**New Modules**:
- ✅ Fraud Cases (create, assign, track)
- ✅ Workflow (status transitions, SLA)
- ✅ Collaboration (comments, attachments)
- ✅ Notifications (alert team members)

**Features**:
- Create case from alert
- Case assignment workflow
- Investigation status tracking
- Team comments & history
- File attachments
- SLA management

**Database**:
- Fraud cases table
- Case comments table
- Case history table
- Case attachments table
- Workflow states table

**Performance**:
- Support 2,000 TPS
- <150ms P95 latency

---

### ✅ PHASE 4: Advanced Analytics & Caching (Week 5)
**Goal**: Business intelligence + performance optimization

**New Modules**:
- ✅ Reporting (custom reports)
- ✅ Metrics (KPI calculation)
- ✅ Caching (Caffeine - L1 cache)
- ✅ Trend Analysis (time series)

**Features**:
- Fraud trend analysis (hourly, daily, weekly)
- Merchant risk profiling
- Country risk analysis
- False positive tracking
- Custom report generation
- Export to PDF/CSV
- **Caffeine caching** for frequently accessed data

**Database**:
- Materialized views for analytics
- Metrics tables for calculations
- Report templates table

**Performance**:
- Support 2,000 TPS
- <200ms P95 latency with caching

---

### ✅ PHASE 5: Real AI Integration + Agents (Week 6)
**Goal**: Intelligent investigation automation

**New Modules**:
- ✅ LLM Client (OpenAI/Claude integration)
- ✅ AI Agents Framework
  - **Investigation Agent**: Analyzes fraud patterns, suggests investigation direction
  - **Recommendation Agent**: Proposes case resolution actions
  - **Summary Agent**: Creates executive summaries
- ✅ Pattern Discovery (ML-based anomalies)
- ✅ Risk Prediction (historical pattern learning)

**Features**:
- Replace rule-based AI with OpenAI/Claude
- Investigation assistant (asks relevant questions)
- Smart recommendations (resolution suggestions)
- Automated risk prediction
- Pattern discovery engine
- Context-aware analysis

**Architecture**:
```
Transaction → Fraud Rules → Risk Score → Alert
                                           ↓
                                    AI Investigation
                                    Agent decides:
                                    - More info needed?
                                    - Likely fraud?
                                    - Recommended action?
                                    - Case priority?
```

**Database**:
- AI conversation history table
- Pattern discovery rules table
- Risk prediction model metadata

**Performance**:
- Support 5,000 TPS
- <200ms P95 latency (excluding AI calls which are async)
- Batch AI requests

---

### ✅ PHASE 6: Event-Driven Scale + Advanced Agents (Week 7-8)
**Goal**: Production-scale with advanced automation

**New Components**:
- ✅ Kafka Integration (event streaming)
- ✅ Redis Cache (distributed L2 cache)
- ✅ Event Sourcing (all decisions recorded)
- ✅ Advanced Agents
  - **Autonomous Remediation Agent**: Auto-blocks, notifies, escalates
  - **Pattern Discovery Agent**: Finds emerging fraud patterns
  - **Feedback Loop Agent**: Learns from investigation outcomes

**Features**:
- Event-driven processing
- Distributed caching
- Event replay capability
- Multi-instance deployment
- Autonomous case handling
- Real-time pattern updates
- Machine learning feedback loops

**Architecture**:
```
Transactions → Kafka Topic → [Multiple Worker Instances]
                              ↓
                         Fraud Analysis
                              ↓
                         Agent Decision
                              ↓
                    Alert Event → Kafka → Notifications
                    Case Event → Kafka → Case Management
                    Learning Event → Kafka → ML Pipeline
```

**Performance**:
- Support 10,000+ TPS sustained
- <150ms P95 latency
- Horizontal scaling (3+ instances)

---

## 🛠️ Technology Stack

### Backend Core
```yaml
Framework:       Spring Boot 3.2.6 (Spring MVC)
Language:        Java 21 (Virtual Threads ready)
Build:           Maven (Single module)
Architecture:    Hexagonal (Ports & Adapters)
```

### Persistence
```yaml
Database:        PostgreSQL 16 (ACID, JSON support)
ORM:             Spring Data JPA + Hibernate
Migrations:      Flyway (version-controlled schema)
Connection Pool: HikariCP (optimized settings)
```

### Security & Auth
```yaml
Authentication:  JWT (HS256)
Password Hash:   BCrypt (strength 12)
RBAC:            Role-based access control
Multi-tenancy:   Organization-level isolation
```

### AI & Agents
```yaml
Phase 1-4:       Rule-based explanations
Phase 5:         OpenAI GPT-4 or Claude
Phase 6:         Advanced LLM agents
Framework:       Custom agent framework (chainable steps)
```

### Caching Strategy
```yaml
Phase 1-3:       No cache (keep simple)
Phase 4:         Caffeine (in-memory L1, local only)
Phase 6:         Redis (distributed L2, multi-instance)
```

### Async & Messaging (Phase 6)
```yaml
Queue:           Kafka (event streaming)
Message Format:  JSON (structured events)
Event Topics:    fraud-transactions, fraud-alerts, fraud-cases
```

### Observability
```yaml
Metrics:         Micrometer → Prometheus
Logging:         Logback (structured JSON)
Tracing:         Spring Boot Actuator
```

---

## 📦 Project Structure

### Phase 1-4: Single Module (Package-Based)
```
sentinelai-backend/
├── pom.xml                                      # Maven parent
├── docker-compose.yml
├── src/main/java/com/sentinelai/
│   ├── SentinelAiApplication.java
│   │
│   ├── common/                                  # Shared utilities
│   │   ├── dto/
│   │   │   ├── ApiResponse.java
│   │   │   ├── ApiError.java
│   │   │   ├── PagedResponse.java
│   │   │   └── ...
│   │   ├── exception/
│   │   │   ├── BusinessException.java
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   └── ...
│   │   ├── util/
│   │   │   ├── DateUtils.java
│   │   │   ├── CurrencyUtils.java
│   │   │   └── ...
│   │   └── config/
│   │       ├── WebConfig.java
│   │       ├── SecurityConfig.java
│   │       ├── AuditConfig.java
│   │       └── ...
│   │
│   ├── auth/                                    # Authentication module
│   │   ├── domain/
│   │   │   ├── model/
│   │   │   │   ├── User.java
│   │   │   │   ├── Role.java
│   │   │   │   └── Organization.java
│   │   │   ├── service/
│   │   │   │   └── PasswordService.java
│   │   │   └── exception/
│   │   ├── application/
│   │   │   ├── port/in/
│   │   │   │   ├── RegisterUserUseCase.java
│   │   │   │   ├── LoginUserUseCase.java
│   │   │   │   └── RefreshTokenUseCase.java
│   │   │   ├── port/out/
│   │   │   │   └── UserRepository.java
│   │   │   └── service/
│   │   │       └── AuthService.java
│   │   └── adapter/
│   │       ├── in/rest/
│   │       │   └── AuthController.java
│   │       └── out/persistence/
│   │           ├── UserJpaRepository.java
│   │           └── UserPersistenceAdapter.java
│   │
│   ├── transaction/                            # Transaction module
│   │   ├── domain/
│   │   │   ├── model/
│   │   │   │   └── Transaction.java
│   │   │   └── valueobject/
│   │   │       ├── Amount.java
│   │   │       ├── Currency.java
│   │   │       └── TransactionStatus.java
│   │   ├── application/
│   │   │   ├── port/in/
│   │   │   │   ├── IngestTransactionUseCase.java
│   │   │   │   └── UploadTransactionsCsvUseCase.java
│   │   │   ├── port/out/
│   │   │   │   └── TransactionRepository.java
│   │   │   └── service/
│   │   │       └── TransactionService.java
│   │   └── adapter/
│   │       ├── in/rest/
│   │       │   └── TransactionController.java
│   │       └── out/persistence/
│   │           ├── TransactionJpaRepository.java
│   │           └── TransactionPersistenceAdapter.java
│   │
│   ├── fraud/                                  # Fraud detection module
│   │   ├── rules/                             # Rule engine
│   │   │   ├── domain/
│   │   │   │   ├── model/
│   │   │   │   │   ├── FraudRule.java (interface)
│   │   │   │   │   └── RuleResult.java
│   │   │   │   └── service/
│   │   │   │       └── RuleEngine.java
│   │   │   ├── application/
│   │   │   │   └── service/
│   │   │   │       └── FraudRuleService.java
│   │   │   ├── adapter/
│   │   │   │   ├── in/rest/
│   │   │   │   │   └── FraudRuleController.java
│   │   │   │   └── out/
│   │   │   │       ├── HighAmountRule.java
│   │   │   │       ├── RapidTransactionRule.java
│   │   │   │       ├── OffHoursRule.java
│   │   │   │       ├── GeographicAnomalyRule.java
│   │   │   │       └── BlacklistedMerchantRule.java
│   │   │   └── config/
│   │   │       └── RuleConfig.java
│   │   │
│   │   └── risk/                              # Risk scoring
│   │       ├── domain/
│   │       │   ├── model/
│   │       │   │   ├── RiskScore.java
│   │       │   │   └── RiskLevel.java
│   │       │   └── service/
│   │       │       ├── RiskScoringService.java
│   │       │       ├── AmountRiskCalculator.java
│   │       │       ├── VelocityRiskCalculator.java
│   │       │       ├── LocationRiskCalculator.java
│   │       │       ├── DeviceRiskCalculator.java
│   │       │       └── HistoryRiskCalculator.java
│   │       ├── application/
│   │       │   └── service/
│   │       │       └── RiskService.java
│   │       └── adapter/
│   │           └── out/persistence/
│   │               └── RiskScorePersistenceAdapter.java
│   │
│   ├── alert/                                  # Alert module
│   │   ├── domain/
│   │   │   ├── model/
│   │   │   │   ├── FraudAlert.java
│   │   │   │   ├── AlertStatus.java
│   │   │   │   └── AlertSeverity.java
│   │   │   └── service/
│   │   │       └── AlertDomainService.java
│   │   ├── application/
│   │   │   ├── port/in/
│   │   │   │   ├── CreateAlertUseCase.java
│   │   │   │   └── UpdateAlertUseCase.java
│   │   │   ├── port/out/
│   │   │   │   └── AlertRepository.java
│   │   │   └── service/
│   │   │       └── AlertService.java
│   │   └── adapter/
│   │       ├── in/rest/
│   │       │   └── AlertController.java
│   │       └── out/persistence/
│   │           └── AlertPersistenceAdapter.java
│   │
│   ├── ai/                                     # AI explanation module (Phase 1+)
│   │   ├── domain/
│   │   │   ├── model/
│   │   │   │   └── Explanation.java
│   │   │   └── service/
│   │   │       └── ExplanationGenerator.java
│   │   ├── application/
│   │   │   ├── port/in/
│   │   │   │   └── GenerateExplanationUseCase.java
│   │   │   ├── port/out/
│   │   │   │   └── LlmClient.java (interface)
│   │   │   ├── service/
│   │   │   │   ├── ContextBuilder.java
│   │   │   │   ├── PromptBuilder.java
│   │   │   │   ├── ResponseParser.java
│   │   │   │   └── ConfidenceScorer.java
│   │   │   └── agent/ (Phase 5+)
│   │   │       ├── InvestigationAgent.java
│   │   │       ├── RecommendationAgent.java
│   │   │       └── SummaryAgent.java
│   │   └── adapter/
│   │       ├── in/rest/
│   │       │   └── ExplanationController.java
│   │       └── out/
│   │           ├── RuleBasedLlmAdapter.java (Phase 1-4)
│   │           ├── OpenAiLlmAdapter.java (Phase 5+)
│   │           └── out/persistence/
│   │               └── ExplanationPersistenceAdapter.java
│   │
│   ├── analytics/                             # Analytics & Dashboard
│   │   ├── application/
│   │   │   └── service/
│   │   │       ├── DashboardService.java
│   │   │       ├── ReportService.java
│   │   │       ├── MetricsService.java
│   │   │       └── TrendAnalysisService.java
│   │   └── adapter/
│   │       ├── in/rest/
│   │       │   ├── DashboardController.java
│   │       │   └── ReportController.java
│   │       └── out/persistence/
│   │           └── AnalyticsPersistenceAdapter.java
│   │
│   ├── audit/                                  # Audit Trail (All phases)
│   │   ├── domain/
│   │   │   ├── model/
│   │   │   │   ├── AuditLog.java
│   │   │   │   ├── AuditAction.java
│   │   │   │   └── EntityType.java
│   │   │   └── service/
│   │   │       └── AuditDomainService.java
│   │   └── adapter/
│   │       └── out/persistence/
│   │           └── AuditPersistenceAdapter.java
│   │
│   └── profile/ (Phase 2+)                    # User behavior profiles
│       ├── domain/
│       │   ├── model/
│       │   │   ├── UserProfile.java
│       │   │   └── TransactionMetric.java
│       │   └── service/
│       │       └── ProfileBuilder.java
│       └── adapter/
│           └── out/persistence/
│               └── ProfilePersistenceAdapter.java
│
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   ├── application-prod.yml
│   └── db/migration/
│       ├── V1__initial_schema.sql
│       ├── V2__add_user_profiles.sql (Phase 2)
│       ├── V3__add_cases_workflow.sql (Phase 3)
│       ├── V4__add_metrics_tables.sql (Phase 4)
│       └── ...
│
└── src/test/
    ├── java/com/sentinelai/
    │   ├── {module}/
    │   │   ├── domain/
    │   │   │   └── service/
    │   │   │       └── *Test.java
    │   │   └── application/
    │   │       └── service/
    │   │           └── *ServiceTest.java
    │   └── integration/
    │       └── *IntegrationTest.java
    └── resources/
        └── test-data.sql
```

---

## 🎯 Key Features by Phase

### Phase 1: Core MVP
| Feature | Description | Implementation |
|---------|-------------|-----------------|
| **Authentication** | JWT with refresh tokens | Spring Security + JJWT |
| **Transaction Ingestion** | API + CSV streaming | Streaming parser, idempotency |
| **Rule Engine** | 5+ fraud detection rules | Rule interface + implementations |
| **Risk Scoring** | Weighted formula (5 factors) | Domain service + calculators |
| **Alerts** | Auto-creation from high risk | JPA persistence + querying |
| **AI Explanations** | Rule-based logic | Context + prompt building |
| **Dashboard** | KPI summary & trends | Analytics service + endpoints |
| **Audit Trail** | Complete decision logging | Event-based audit service |

### Phase 2: Behavioral Intelligence
| Feature | Description | Implementation |
|---------|-------------|-----------------|
| **User Profiles** | Transaction history & patterns | Profile aggregation service |
| **Device Tracking** | Device fingerprinting & risk | Device repository + calculator |
| **Velocity Analysis** | Transaction frequency patterns | Time-windowed counters |
| **Geographic Tracking** | Location-based anomalies | Geo service + deviation calc |

### Phase 3: Case Management
| Feature | Description | Implementation |
|---------|-------------|-----------------|
| **Fraud Cases** | Investigation cases from alerts | Case domain model + service |
| **Workflow** | Status transitions with SLA | State machine pattern |
| **Collaboration** | Comments, attachments, history | Collaboration service |
| **Notifications** | Alert team members | Notification adapter (basic) |

### Phase 4: Analytics & Caching
| Feature | Description | Implementation |
|---------|-------------|-----------------|
| **Advanced Reports** | Custom fraud reports | Reporting service |
| **Trend Analysis** | Time-series analysis | Analytics queries |
| **Metrics** | Business KPI calculation | Metrics service |
| **Caffeine Cache** | L1 in-memory cache | @Cacheable annotations |

### Phase 5: Real AI + Agents
| Feature | Description | Implementation |
|---------|-------------|-----------------|
| **OpenAI Integration** | Replace rule-based AI | OpenAI client adapter |
| **Investigation Agent** | Smart case analysis | Agent framework + implementation |
| **Recommendation Agent** | Smart action suggestions | Chain-of-thought prompting |
| **Pattern Discovery** | ML-based anomalies | Statistics + learning |

### Phase 6: Event-Driven Scale
| Feature | Description | Implementation |
|---------|-------------|-----------------|
| **Kafka Events** | Event streaming | Kafka producer/consumer |
| **Redis Cache** | Distributed L2 cache | Redis adapter |
| **Event Sourcing** | All events persisted | Event store |
| **Autonomous Agents** | Auto-remediation decisions | Advanced agent chains |

---

## ✅ Success Criteria

### Phase 1 (MVP)
- [x] User registration/login works
- [x] Transaction upload (API + CSV)
- [x] Fraud detection produces alerts
- [x] AI explains every alert
- [x] Dashboard shows KPIs
- [x] **Achieve 1,000 TPS**
- [x] **P95 latency <100ms**

### Phase 2
- [x] User behavior profiles working
- [x] Device tracking enabled
- [x] Velocity analysis in scoring
- [x] **Maintain 1,000 TPS**

### Phase 3
- [x] Create cases from alerts
- [x] Case workflow functional
- [x] Team collaboration working
- [x] **Support 2,000 TPS**

### Phase 4
- [x] Advanced reports generated
- [x] Caching implemented (Caffeine)
- [x] Trend analysis working
- [x] **Maintain 2,000 TPS**

### Phase 5
- [x] OpenAI integration working
- [x] Investigation agent functional
- [x] Recommendations generated
- [x] **Support 5,000 TPS**

### Phase 6
- [x] Kafka event streaming
- [x] Redis caching distributed
- [x] Multi-instance deployment
- [x] **Achieve 10,000+ TPS**

---

## 🚀 Next Steps

1. ✅ **Architecture**: Complete (this document)
2. 🔄 **Phase 1 Detailed Plan**: Next
3. 🔄 **Implementation Guides**: Stages 1-10
4. 🔄 **Project Setup**: Git structure + pom.xml
5. 🔄 **Phase 2-6 Plans**: Following phases

---

**Ready to build? Let's go! 🔥**

