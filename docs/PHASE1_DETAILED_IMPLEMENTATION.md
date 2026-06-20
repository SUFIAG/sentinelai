# 📋 PHASE 1: Core Fraud Engine - Detailed Implementation Guide
## Complete Roadmap with Code Examples

---

## 🎯 Phase 1 Overview

**Duration**: 1-2 weeks (35-45 hours)
**Goal**: Build working fraud detection system with rule-based AI

### What Gets Built
✅ Authentication (JWT tokens)
✅ Transaction ingestion (API + CSV)
✅ Rule-based fraud detection
✅ Risk scoring engine
✅ Alert generation
✅ Rule-based AI explanations
✅ Dashboard APIs
✅ Audit logging

### Success Metrics
- 1,000 TPS sustained
- <100ms P95 latency
- Zero data loss
- All APIs documented

---

## 📊 Stage-by-Stage Breakdown

```
Stage 1:  Foundation & Database               (2-3 hours)
Stage 2:  Authentication Module               (3-4 hours)
Stage 3:  Transaction Module                  (4-5 hours)
Stage 4:  Fraud Rules Engine                  (5-6 hours)
Stage 5:  Risk Scoring Engine                 (3-4 hours)
Stage 6:  Alert System                        (3-4 hours)
Stage 7:  AI Explanation (Rule-Based)         (4-5 hours)
Stage 8:  Analytics & Dashboard               (3-4 hours)
Stage 9:  Integration & Testing               (4-5 hours)
Stage 10: Performance Optimization            (3-4 hours)
──────────────────────────────────────────────────────
TOTAL:    ~35-45 hours
```

---

## 🏗️ STAGE 1: Foundation & Database Setup (2-3 hours)

### 1.1 Project Structure & pom.xml

**Goal**: Create Maven project with all dependencies

### 1.2 Common DTOs

These DTOs are used across all modules:

```java
// File: common/dto/ApiResponse.java
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private ErrorDetails error;
    private MetaData meta;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
            .success(true)
            .data(data)
            .meta(MetaData.now())
            .build();
    }

    public static <T> ApiResponse<T> success(T data, int page, int totalPages, long totalElements) {
        return ApiResponse.<T>builder()
            .success(true)
            .data(data)
            .meta(MetaData.of(page, totalPages, totalElements))
            .build();
    }

    public static ApiResponse<Void> error(ErrorDetails error) {
        return ApiResponse.<Void>builder()
            .success(false)
            .error(error)
            .meta(MetaData.now())
            .build();
    }
}

// File: common/dto/ErrorDetails.java
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorDetails {
    private String code;           // VALIDATION_ERROR, BUSINESS_ERROR, etc.
    private String message;        // User-friendly message
    private Map<String, String> details; // Field-level errors
    private String timestamp;      // ISO-8601
    private String requestId;      // Tracking
    private String path;           // Request path
}

// File: common/dto/MetaData.java
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetaData {
    private String timestamp;
    private String requestId;
    private Integer page;
    private Integer totalPages;
    private Long totalElements;

    public static MetaData now() {
        return MetaData.builder()
            .timestamp(Instant.now().toString())
            .requestId(UUID.randomUUID().toString())
            .build();
    }

    public static MetaData of(int page, int totalPages, long totalElements) {
        return MetaData.builder()
            .timestamp(Instant.now().toString())
            .requestId(UUID.randomUUID().toString())
            .page(page)
            .totalPages(totalPages)
            .totalElements(totalElements)
            .build();
    }
}
```

### 1.3 Exception Handling

```java
// File: common/exception/BusinessException.java
@Getter
public class BusinessException extends RuntimeException {
    private final String code;
    private final Map<String, String> details;

    public BusinessException(String code, String message) {
        super(message);
        this.code = code;
        this.details = new HashMap<>();
    }

    public BusinessException(String code, String message, Map<String, String> details) {
        super(message);
        this.code = code;
        this.details = details;
    }
}

// File: common/exception/GlobalExceptionHandler.java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(
            BusinessException ex,
            HttpServletRequest request) {
        
        String requestId = MDC.get("requestId");
        log.error("Business exception: {} [{}]", ex.getMessage(), requestId);

        ErrorDetails error = ErrorDetails.builder()
            .code(ex.getCode())
            .message(ex.getMessage())
            .details(ex.getDetails())
            .timestamp(Instant.now().toString())
            .requestId(requestId)
            .path(request.getRequestURI())
            .build();

        return ResponseEntity
            .status(HttpStatus.UNPROCESSABLE_ENTITY)
            .body(ApiResponse.error(error));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage())
        );

        String requestId = MDC.get("requestId");
        ErrorDetails error = ErrorDetails.builder()
            .code("VALIDATION_ERROR")
            .message("Invalid request data")
            .details(errors)
            .timestamp(Instant.now().toString())
            .requestId(requestId)
            .path(request.getRequestURI())
            .build();

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error(error));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(
            Exception ex,
            HttpServletRequest request) {

        String requestId = MDC.get("requestId");
        log.error("Unexpected error [{}]: ", requestId, ex);

        ErrorDetails error = ErrorDetails.builder()
            .code("INTERNAL_ERROR")
            .message("An unexpected error occurred")
            .timestamp(Instant.now().toString())
            .requestId(requestId)
            .path(request.getRequestURI())
            .build();

        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error(error));
    }
}
```

### 1.4 Database Schema (Flyway Migration)

**File**: `src/main/resources/db/migration/V1__initial_schema.sql`

```sql
-- Organizations (Multi-tenancy)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    plan_type VARCHAR(50) NOT NULL DEFAULT 'BASIC',
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_organizations_enabled ON organizations(enabled);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'ANALYST', -- ADMIN, ANALYST, REVIEWER, AUDITOR, USER
    enabled BOOLEAN NOT NULL DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, email)
);

CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_enabled ON users(enabled);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    transaction_external_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    merchant_id VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    country VARCHAR(2),
    device_id VARCHAR(255),
    ip_address VARCHAR(45),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, FLAGGED, APPROVED, REJECTED
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, transaction_external_id)
);

CREATE INDEX idx_transactions_org ON transactions(organization_id);
CREATE INDEX idx_transactions_ext_id ON transactions(organization_id, transaction_external_id);
CREATE INDEX idx_transactions_user_ts ON transactions(user_id, timestamp DESC);
CREATE INDEX idx_transactions_status ON transactions(status) WHERE status != 'APPROVED';
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- Idempotency Keys (for exactly-once processing)
CREATE TABLE idempotency_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_idempotency_key ON idempotency_keys(idempotency_key);
CREATE INDEX idx_idempotency_expires ON idempotency_keys(expires_at);

-- Risk Scores
CREATE TABLE risk_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    score INT NOT NULL CHECK (score >= 0 AND score <= 100),
    level VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    amount_risk INT NOT NULL,
    velocity_risk INT NOT NULL,
    location_risk INT NOT NULL,
    device_risk INT NOT NULL,
    history_risk INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_risk_scores_transaction ON risk_scores(transaction_id);
CREATE INDEX idx_risk_scores_level_score ON risk_scores(level, score DESC);

-- Fraud Alerts
CREATE TABLE fraud_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    severity VARCHAR(20) NOT NULL, -- MEDIUM, HIGH, CRITICAL
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN', -- OPEN, INVESTIGATING, RESOLVED, FALSE_POSITIVE
    reason TEXT NOT NULL,
    triggered_rules JSONB NOT NULL, -- Array of rule names
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP
);

CREATE INDEX idx_alerts_org ON fraud_alerts(organization_id);
CREATE INDEX idx_alerts_status_severity ON fraud_alerts(status, severity, created_at DESC);
CREATE INDEX idx_alerts_transaction ON fraud_alerts(transaction_id);
CREATE INDEX idx_alerts_open ON fraud_alerts(created_at DESC) WHERE status IN ('OPEN', 'INVESTIGATING');

-- AI Explanations
CREATE TABLE ai_explanations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES fraud_alerts(id) ON DELETE CASCADE,
    cause TEXT NOT NULL,
    explanation TEXT NOT NULL,
    suggestion TEXT NOT NULL,
    confidence DECIMAL(3, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    provider VARCHAR(50) NOT NULL DEFAULT 'rule-based', -- rule-based, openai, claude
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_explanations_alert ON ai_explanations(alert_id);

-- Audit Trail
CREATE TABLE audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- TRANSACTION_ANALYZED, ALERT_CREATED, ALERT_REVIEWED, etc.
    entity_type VARCHAR(50) NOT NULL, -- TRANSACTION, ALERT, USER, etc.
    entity_id UUID NOT NULL,
    decision_factors JSONB, -- JSON: {rules: [...], score: 85}
    reasoning TEXT,
    ip_address VARCHAR(45),
    result VARCHAR(20) NOT NULL DEFAULT 'SUCCESS', -- SUCCESS, FAILURE
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_org_ts ON audit_trail(organization_id, timestamp DESC);
CREATE INDEX idx_audit_entity ON audit_trail(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_trail(action, timestamp DESC);
```

### 1.5 Configuration Classes

```java
// File: common/config/WebConfig.java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public FilterRegistrationBean<RequestIdFilter> requestIdFilter() {
        FilterRegistrationBean<RequestIdFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new RequestIdFilter());
        registrationBean.addUrlPatterns("/api/*");
        return registrationBean;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000", "http://localhost:8080")
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}

// File: common/util/RequestIdFilter.java
@Slf4j
public class RequestIdFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        
        String requestId = UUID.randomUUID().toString();
        MDC.put("requestId", requestId);
        response.setHeader("X-Request-Id", requestId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove("requestId");
        }
    }
}
```

### ✅ Stage 1 Checklist
- [ ] Project created with Maven
- [ ] pom.xml with all dependencies
- [ ] Package structure created
- [ ] Common DTOs created
- [ ] Exception handling implemented
- [ ] Database schema created (Flyway)
- [ ] Configuration classes in place
- [ ] Application starts successfully
- [ ] Health endpoint works (`GET /health`)

---

## 🔐 STAGE 2: Authentication Module (3-4 hours)

### Goals
- User registration & login
- JWT token generation & validation
- Role-based access control
- Multi-tenancy support

### 2.1 Domain Models

```java
// File: auth/domain/model/User.java
@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"organization_id", "email"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    private UUID organizationId;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @NotBlank(message = "Password hash is required")
    private String passwordHash;
    
    private String firstName;
    private String lastName;
    
    @Enumerated(EnumType.STRING)
    private UserRole role;
    
    private boolean enabled;
    private Instant lastLogin;
    
    @CreationTimestamp
    private Instant createdAt;
    
    @UpdateTimestamp
    private Instant updatedAt;
}

// File: auth/domain/model/UserRole.java
public enum UserRole {
    ADMIN("Full system access"),
    ANALYST("Investigate fraud cases"),
    REVIEWER("Review and approve cases"),
    AUDITOR("View-only audit access"),
    USER("Limited access");

    private final String description;
}
```

### 2.2 Service Layer

```java
// File: auth/application/service/AuthService.java
@Service
@Transactional
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuditService auditService;

    // Use case: Register new user
    public UserResponse register(RegisterRequest request, UUID organizationId) {
        // Validation
        if (userRepository.existsByEmailAndOrganizationId(request.email(), organizationId)) {
            throw new BusinessException("USER_EXISTS", "User with this email already exists");
        }

        // Create user
        User user = User.builder()
            .organizationId(organizationId)
            .email(request.email())
            .passwordHash(passwordEncoder.encode(request.password()))
            .firstName(request.firstName())
            .lastName(request.lastName())
            .role(UserRole.ANALYST)
            .enabled(true)
            .build();

        User saved = userRepository.save(user);

        // Audit
        auditService.logAction(
            organizationId,
            saved.getId(),
            AuditAction.USER_CREATED,
            EntityType.USER
        );

        return UserResponse.from(saved);
    }

    // Use case: Login user
    public LoginResponse login(LoginRequest request, UUID organizationId) {
        User user = userRepository.findByEmailAndOrganizationId(request.email(), organizationId)
            .orElseThrow(() -> new BusinessException("USER_NOT_FOUND", "Invalid credentials"));

        if (!user.isEnabled()) {
            throw new BusinessException("USER_DISABLED", "User account is disabled");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BusinessException("INVALID_PASSWORD", "Invalid credentials");
        }

        // Update last login
        user.setLastLogin(Instant.now());
        userRepository.save(user);

        // Generate tokens
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        // Audit
        auditService.logAction(
            organizationId,
            user.getId(),
            AuditAction.USER_LOGIN,
            EntityType.USER
        );

        return LoginResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .user(UserResponse.from(user))
            .build();
    }

    // Use case: Refresh token
    public TokenResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException("INVALID_TOKEN", "Invalid or expired refresh token");
        }

        UUID userId = UUID.fromString(jwtTokenProvider.getUserIdFromToken(refreshToken));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException("USER_NOT_FOUND", "User not found"));

        String newAccessToken = jwtTokenProvider.generateAccessToken(user);
        
        return TokenResponse.builder()
            .accessToken(newAccessToken)
            .tokenType("Bearer")
            .expiresIn(3600) // 1 hour
            .build();
    }
}
```

### 2.3 JWT Token Provider

```java
// File: common/config/JwtTokenProvider.java
@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.access-token-expiration:3600}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration:604800}")
    private long refreshTokenExpiration;

    public String generateAccessToken(User user) {
        return Jwts.builder()
            .subject(user.getId().toString())
            .claim("email", user.getEmail())
            .claim("organizationId", user.getOrganizationId().toString())
            .claim("role", user.getRole().name())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + accessTokenExpiration * 1000))
            .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
            .compact();
    }

    public String generateRefreshToken(User user) {
        return Jwts.builder()
            .subject(user.getId().toString())
            .claim("organizationId", user.getOrganizationId().toString())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + refreshTokenExpiration * 1000))
            .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
            .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("Expired JWT token: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("Unsupported JWT token: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    public String getUserIdFromToken(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
            .build()
            .parseClaimsJws(token)
            .getPayload()
            .getSubject();
    }
}
```

### 2.4 REST Controller

```java
// File: auth/adapter/in/rest/AuthController.java
@RestController
@RequestMapping("/api/v1/auth")
@Transactional(readOnly = true)
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<ApiResponse<UserResponse>> register(
            @RequestBody @Valid RegisterRequest request,
            HttpServletRequest httpRequest) {
        
        // Extract organization from header or context
        UUID organizationId = extractOrganizationId(httpRequest);
        
        UserResponse response = authService.register(request, organizationId);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @RequestBody @Valid LoginRequest request,
            HttpServletRequest httpRequest) {
        
        UUID organizationId = extractOrganizationId(httpRequest);
        LoginResponse response = authService.login(request, organizationId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refreshToken(
            @RequestBody @Valid TokenRefreshRequest request) {
        
        TokenResponse response = authService.refreshToken(request.refreshToken());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    private UUID extractOrganizationId(HttpServletRequest request) {
        String orgId = request.getHeader("X-Organization-Id");
        if (orgId == null || orgId.isBlank()) {
            // Default or from JWT token
            return UUID.fromString("550e8400-e29b-41d4-a716-446655440000"); // Demo org
        }
        return UUID.fromString(orgId);
    }
}
```

### ✅ Stage 2 Checklist
- [ ] User entity created with JPA
- [ ] UserRepository implemented
- [ ] AuthService with register/login/refresh
- [ ] JwtTokenProvider implemented
- [ ] AuthController with REST endpoints
- [ ] Password encoding configured (BCrypt)
- [ ] All tests passing
- [ ] Manual testing with Postman

---

## 📝 STAGE 3: Transaction Module (4-5 hours)

### Goals
- Single transaction API ingestion
- CSV batch upload with streaming
- Idempotency handling
- Transaction validation

This module handles the **first critical step** in the fraud detection pipeline.

### 3.1 Domain Models

```java
// File: transaction/domain/model/Transaction.java
@Entity
@Table(name = "transactions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"organization_id", "transaction_external_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    private UUID organizationId;
    
    @NotBlank(message = "External ID is required")
    private String transactionExternalId;
    
    @NotBlank(message = "User ID is required")
    private String userId;
    
    @NotBlank(message = "Merchant ID is required")
    private String merchantId;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    @Column(precision = 15, scale = 2)
    private BigDecimal amount;
    
    @NotBlank(message = "Currency is required")
    @Size(min = 3, max = 3)
    private String currency;
    
    @Size(min = 2, max = 2)
    private String country;
    
    private String deviceId;
    private String ipAddress;
    
    @Enumerated(EnumType.STRING)
    private TransactionStatus status;
    
    @NotNull(message = "Timestamp is required")
    @PastOrPresent(message = "Timestamp cannot be in future")
    private Instant timestamp;
    
    @CreationTimestamp
    private Instant createdAt;
}

// File: transaction/domain/valueobject/TransactionStatus.java
public enum TransactionStatus {
    PENDING("Awaiting fraud analysis"),
    FLAGGED("Potential fraud detected"),
    APPROVED("Approved by system or analyst"),
    REJECTED("Rejected as fraudulent");

    private final String description;
}
```

### 3.2 Transaction Service

```java
// File: transaction/application/service/TransactionService.java
@Service
@Transactional
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final IdempotencyKeyRepository idempotencyKeyRepository;
    private final AuditService auditService;

    /**
     * Ingest a single transaction with idempotency
     */
    public TransactionResponse ingestTransaction(
            IngestTransactionRequest request,
            UUID organizationId,
            String idempotencyKey) {

        // Check idempotency
        var existing = idempotencyKeyRepository.findByKey(idempotencyKey);
        if (existing.isPresent()) {
            log.info("Idempotent replay for key: {}", idempotencyKey);
            Transaction transaction = transactionRepository.findById(existing.get().getTransactionId())
                .orElseThrow(() -> new BusinessException("TXN_NOT_FOUND", "Transaction not found"));
            return TransactionResponse.from(transaction);
        }

        // Validate
        validateTransaction(request);

        // Create transaction
        Transaction transaction = Transaction.builder()
            .organizationId(organizationId)
            .transactionExternalId(request.transactionExternalId())
            .userId(request.userId())
            .merchantId(request.merchantId())
            .amount(request.amount())
            .currency(request.currency())
            .country(request.country())
            .deviceId(request.deviceId())
            .ipAddress(request.ipAddress())
            .status(TransactionStatus.PENDING)
            .timestamp(request.timestamp())
            .build();

        Transaction saved = transactionRepository.save(transaction);

        // Save idempotency key
        IdempotencyKey key = IdempotencyKey.builder()
            .idempotencyKey(idempotencyKey)
            .transactionId(saved.getId())
            .expiresAt(Instant.now().plus(Duration.ofHours(24)))
            .build();
        idempotencyKeyRepository.save(key);

        // Audit
        auditService.logAction(
            organizationId,
            saved.getId(),
            AuditAction.TRANSACTION_INGESTED,
            EntityType.TRANSACTION
        );

        return TransactionResponse.from(saved);
    }

    /**
     * Upload transactions from CSV (streaming)
     */
    public BulkUploadResponse uploadCsvTransactions(
            MultipartFile file,
            UUID organizationId) throws IOException {

        int totalProcessed = 0;
        int totalFailed = 0;
        List<String> errors = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            CSVParser csvParser = CSVFormat.DEFAULT
                .withFirstRecordAsHeader()
                .withTrim()
                .parse(reader);

            for (CSVRecord record : csvParser) {
                try {
                    String idempotencyKey = UUID.randomUUID().toString();
                    
                    IngestTransactionRequest request = IngestTransactionRequest.builder()
                        .transactionExternalId(record.get("transactionExternalId"))
                        .userId(record.get("userId"))
                        .merchantId(record.get("merchantId"))
                        .amount(new BigDecimal(record.get("amount")))
                        .currency(record.get("currency"))
                        .country(record.get("country"))
                        .deviceId(record.get("deviceId"))
                        .ipAddress(record.get("ipAddress"))
                        .timestamp(Instant.parse(record.get("timestamp")))
                        .build();

                    ingestTransaction(request, organizationId, idempotencyKey);
                    totalProcessed++;
                } catch (Exception e) {
                    totalFailed++;
                    errors.add("Row " + record.getRecordNumber() + ": " + e.getMessage());
                }
            }
        }

        return BulkUploadResponse.builder()
            .totalProcessed(totalProcessed)
            .totalFailed(totalFailed)
            .errors(errors.isEmpty() ? null : errors)
            .build();
    }

    private void validateTransaction(IngestTransactionRequest request) {
        if (request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("INVALID_AMOUNT", "Amount must be positive");
        }

        if (!isValidCurrency(request.currency())) {
            throw new BusinessException("INVALID_CURRENCY", "Invalid currency code: " + request.currency());
        }

        if (request.timestamp().isAfter(Instant.now())) {
            throw new BusinessException("FUTURE_TIMESTAMP", "Timestamp cannot be in future");
        }
    }

    private boolean isValidCurrency(String currency) {
        try {
            Currency.getInstance(currency);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
```

### 3.3 REST Controller

```java
// File: transaction/adapter/in/rest/TransactionController.java
@RestController
@RequestMapping("/api/v1/transactions")
@Transactional(readOnly = true)
@Slf4j
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<TransactionResponse>> ingestTransaction(
            @RequestBody @Valid IngestTransactionRequest request,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            HttpServletRequest httpRequest) {

        UUID organizationId = extractOrganizationId(httpRequest);
        String key = idempotencyKey != null ? idempotencyKey : UUID.randomUUID().toString();

        TransactionResponse response = transactionService.ingestTransaction(request, organizationId, key);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(response));
    }

    @PostMapping("/upload")
    @Transactional
    public ResponseEntity<ApiResponse<BulkUploadResponse>> uploadCsv(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest httpRequest) throws IOException {

        UUID organizationId = extractOrganizationId(httpRequest);
        BulkUploadResponse response = transactionService.uploadCsvTransactions(file, organizationId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> listTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            HttpServletRequest httpRequest) {

        UUID organizationId = extractOrganizationId(httpRequest);
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        
        Page<Transaction> transactions = transactionService.findByOrganization(organizationId, status, pageable);
        Page<TransactionResponse> response = transactions.map(TransactionResponse::from);
        
        return ResponseEntity.ok(ApiResponse.success(response.getContent(), page, response.getTotalPages(), response.getTotalElements()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransaction(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {

        UUID organizationId = extractOrganizationId(httpRequest);
        TransactionResponse response = transactionService.findById(id, organizationId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
```

### ✅ Stage 3 Checklist
- [ ] Transaction entity with JPA
- [ ] TransactionRepository implemented
- [ ] TransactionService with validation
- [ ] CSV streaming parsing implemented
- [ ] Idempotency key mechanism working
- [ ] TransactionController with REST endpoints
- [ ] File upload working (multipart)
- [ ] All tests passing
- [ ] Manual testing with Postman/CSV

---

## 🔧 STAGE 4-10 (REMAINING IMPLEMENTATION)

*Due to length constraints, I'm creating a summary of remaining stages. The next document will have detailed implementation guides for each.*

### Stage 4: Fraud Rules Engine
- 5+ configurable fraud detection rules
- Rule interface with metadata
- Rules: HighAmount, RapidTransaction, OffHours, Geographic, Blacklist

### Stage 5: Risk Scoring Engine
- Weighted formula: 30% amount + 20% velocity + 20% location + 15% device + 15% history
- Risk level classification: LOW, MEDIUM, HIGH, CRITICAL

### Stage 6: Alert System
- Automatic alert creation (score > 60)
- Alert management (status updates, review)
- Alert querying with filters

### Stage 7: AI Explanation (Rule-Based)
- Context builder (transaction + rules + history)
- Prompt builder (system prompt + context)
- Response parser + confidence scoring

### Stage 8: Analytics & Dashboard
- KPI calculation (fraud rate, average risk, etc.)
- Trend analysis (hourly, daily, weekly)
- Dashboard APIs for frontend

### Stage 9: Integration & Testing
- End-to-end workflow tests
- Integration test suite
- Manual API testing

### Stage 10: Performance Optimization
- Database query optimization
- Connection pool tuning
- Load testing (1000 TPS target)
- Index optimization

---

## 📊 Progress Tracking

### Week 1 (Days 1-5)
- Day 1: Stages 1 + 2
- Day 2: Stage 3
- Day 3: Stage 4
- Day 4: Stages 5 + 6
- Day 5: Stage 7

### Week 2 (Days 6-10)
- Day 6: Stage 8
- Day 7: Stage 9
- Day 8: Stage 10
- Days 9-10: Buffer, testing, optimization

---

## 🎯 Success Criteria Checklist

### Functional
- [ ] Users can register/login
- [ ] Transactions can be ingested (API + CSV)
- [ ] Fraud detection runs on all transactions
- [ ] Alerts generated for high-risk transactions
- [ ] AI explanations provided for all alerts
- [ ] Dashboard APIs return KPIs
- [ ] All transactions audited

### Performance
- [ ] 1,000 TPS sustained
- [ ] P95 latency < 100ms
- [ ] P99 latency < 200ms
- [ ] No memory leaks
- [ ] Connection pool stable

### Code Quality
- [ ] Hexagonal architecture maintained
- [ ] Domain layer has zero Spring dependencies
- [ ] Clear separation of concerns
- [ ] Unit tests for critical logic
- [ ] Integration tests for workflows
- [ ] No SQL injection vulnerabilities

---

**Next Document**: PHASE1_STAGE4-10_DETAILED_IMPLEMENTATION.md (coming next)

**Ready to start? Let's build! 🚀**

