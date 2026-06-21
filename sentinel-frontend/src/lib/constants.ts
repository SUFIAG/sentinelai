// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api/v1";

// Risk Thresholds
export const RISK_THRESHOLDS = {
  LOW: 40,
  MEDIUM: 60,
  HIGH: 80,
} as const;

// Transaction Statuses
export const TRANSACTION_STATUS = {
  APPROVED: "APPROVED",
  PENDING: "PENDING",
  REJECTED: "REJECTED",
  FLAGGED: "FLAGGED",
  REVIEWING: "REVIEWING",
} as const;

// Alert Severities
export const ALERT_SEVERITY = {
  CRITICAL: "CRITICAL",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
  INFO: "INFO",
} as const;

// Case Statuses
export const CASE_STATUS = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;

// Fraud Types
export const FRAUD_TYPES = [
  "CARD_TESTING",
  "ACCOUNT_TAKEOVER",
  "SYNTHETIC_IDENTITY",
  "PAYMENT_FRAUD",
  "MONEY_LAUNDERING",
  "CHARGEBACK_FRAUD",
  "IDENTITY_THEFT",
  "PHISHING",
  "REFUND_FRAUD",
  "OTHER",
] as const;

// Transaction Types
export const TRANSACTION_TYPES = [
  "PURCHASE",
  "REFUND",
  "WITHDRAWAL",
  "DEPOSIT",
  "TRANSFER",
  "PAYMENT",
] as const;

// Chart Colors
export const CHART_COLORS = {
  primary: "#00D9FF",
  secondary: "#8B5CF6",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

// WebSocket Events
export const WS_EVENTS = {
  TRANSACTION_CREATED: "transaction.created",
  ALERT_TRIGGERED: "alert.triggered",
  CASE_UPDATED: "case.updated",
  RISK_SCORE_UPDATED: "risk.score.updated",
} as const;

// Date Ranges
export const DATE_RANGES = {
  TODAY: "today",
  YESTERDAY: "yesterday",
  LAST_7_DAYS: "last_7_days",
  LAST_30_DAYS: "last_30_days",
  LAST_90_DAYS: "last_90_days",
  THIS_MONTH: "this_month",
  LAST_MONTH: "last_month",
  CUSTOM: "custom",
} as const;

// Roles
export const USER_ROLES = {
  ADMIN: "ADMIN",
  ANALYST: "ANALYST",
  INVESTIGATOR: "INVESTIGATOR",
  VIEWER: "VIEWER",
} as const;

// AI Agent Types
export const AI_AGENT_TYPES = {
  FRAUD_INVESTIGATOR: "FRAUD_INVESTIGATOR",
  RISK_ANALYST: "RISK_ANALYST",
  CASE_SUMMARIZER: "CASE_SUMMARIZER",
  PATTERN_DETECTOR: "PATTERN_DETECTOR",
} as const;

// Dashboard Refresh Intervals (ms)
export const REFRESH_INTERVALS = {
  REAL_TIME: 5000,
  NORMAL: 30000,
  SLOW: 60000,
} as const;

