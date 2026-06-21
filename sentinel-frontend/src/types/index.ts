// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Transaction Types
export interface Transaction {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  merchantId: string;
  merchantName: string;
  customerId: string;
  customerEmail: string;
  ipAddress: string;
  deviceId: string;
  cardLast4: string;
  status: string;
  riskScore: number;
  fraudProbability: number;
  transactionType: string;
  location: string;
  timestamp: string;
  flags?: string[];
}

export interface TransactionDetail extends Transaction {
  customerName: string;
  billingAddress: string;
  shippingAddress: string;
  deviceFingerprint: string;
  paymentMethod: string;
  fraudIndicators: FraudIndicator[];
  riskFactors: RiskFactor[];
  timeline: TimelineEvent[];
}

export interface FraudIndicator {
  type: string;
  severity: string;
  description: string;
  confidence: number;
}

export interface RiskFactor {
  factor: string;
  score: number;
  weight: number;
  contribution: number;
}

export interface TimelineEvent {
  timestamp: string;
  event: string;
  actor: string;
  details: string;
}

// Alert Types
export interface Alert {
  id: string;
  alertId: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  transactionId?: string;
  customerId?: string;
  ruleId: string;
  ruleName: string;
  triggeredAt: string;
  assignedTo?: string;
  resolvedAt?: string;
  falsePositive: boolean;
}

export interface AlertDetail extends Alert {
  transaction?: Transaction;
  relatedAlerts: Alert[];
  investigationNotes: InvestigationNote[];
  actions: AlertAction[];
}

export interface InvestigationNote {
  id: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

export interface AlertAction {
  id: string;
  action: string;
  performedBy: string;
  performedAt: string;
  result: string;
}

// Case Types
export interface Case {
  id: string;
  caseId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  fraudType: string;
  totalAmount: number;
  transactionCount: number;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CaseDetail extends Case {
  transactions: Transaction[];
  alerts: Alert[];
  timeline: TimelineEvent[];
  notes: InvestigationNote[];
  evidence: Evidence[];
  resolution?: CaseResolution;
}

export interface Evidence {
  id: string;
  type: string;
  description: string;
  fileUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface CaseResolution {
  outcome: string;
  summary: string;
  actionTaken: string;
  resolvedBy: string;
  resolvedAt: string;
}

// Dashboard Types
export interface DashboardStats {
  totalTransactions: number;
  totalVolume: number;
  fraudDetected: number;
  fraudValue: number;
  activeAlerts: number;
  openCases: number;
  averageRiskScore: number;
  preventionRate: number;
  transactionsTrend: number;
  fraudTrend: number;
  alertsTrend: number;
  casesTrend: number;
}

export interface ChartData {
  timestamp: string;
  value: number;
  label?: string;
}

export interface FraudDistribution {
  type: string;
  count: number;
  amount: number;
}

export interface RiskDistribution {
  range: string;
  count: number;
  percentage: number;
}

// Analytics Types
export interface AnalyticsData {
  transactionVolume: ChartData[];
  fraudTrend: ChartData[];
  riskDistribution: RiskDistribution[];
  fraudByType: FraudDistribution[];
  topMerchants: MerchantStats[];
  topCustomers: CustomerStats[];
  geographicDistribution: GeographicData[];
}

export interface MerchantStats {
  merchantId: string;
  merchantName: string;
  transactionCount: number;
  totalAmount: number;
  fraudCount: number;
  averageRiskScore: number;
}

export interface CustomerStats {
  customerId: string;
  customerEmail: string;
  transactionCount: number;
  totalAmount: number;
  flaggedCount: number;
  riskScore: number;
}

export interface GeographicData {
  country: string;
  transactionCount: number;
  fraudCount: number;
  amount: number;
}

// AI Agent Types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface AgentResponse {
  message: string;
  insights?: Insight[];
  recommendations?: Recommendation[];
  relatedData?: any;
}

export interface Insight {
  type: string;
  title: string;
  description: string;
  confidence: number;
  data?: any;
}

export interface Recommendation {
  action: string;
  reason: string;
  priority: string;
  impact: string;
}

// Filter Types
export interface TransactionFilters {
  status?: string[];
  riskScore?: { min: number; max: number };
  amount?: { min: number; max: number };
  dateRange?: { start: string; end: string };
  merchantId?: string;
  customerId?: string;
  fraudType?: string[];
}

export interface AlertFilters {
  severity?: string[];
  status?: string[];
  dateRange?: { start: string; end: string };
  assignedTo?: string;
  ruleId?: string;
}

export interface CaseFilters {
  status?: string[];
  priority?: string[];
  fraudType?: string[];
  dateRange?: { start: string; end: string };
  assignedTo?: string;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
  direction?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// WebSocket Types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

// Rule Types
export interface FraudRule {
  id: string;
  name: string;
  description: string;
  ruleType: string;
  conditions: any;
  actions: any;
  enabled: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

// Profile Types
export interface BehavioralProfile {
  customerId: string;
  averageAmount: number;
  transactionFrequency: number;
  preferredMerchants: string[];
  typicalLocations: string[];
  riskScore: number;
  lastUpdated: string;
}

