import { API_BASE_URL } from "@/lib/constants";
import type {
  LoginCredentials,
  AuthResponse,
  Transaction,
  TransactionDetail,
  Alert,
  AlertDetail,
  Case,
  CaseDetail,
  DashboardStats,
  AnalyticsData,
  PaginatedResponse,
  PaginationParams,
  TransactionFilters,
  AlertFilters,
  CaseFilters,
  AgentResponse,
  ChatMessage,
  FraudRule,
  BehavioralProfile,
} from "@/types";

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token");
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Organization-Id": "550e8400-e29b-41d4-a716-446655440000", // Default org for MVP
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth APIs
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<any>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    // Backend returns { success: true, data: { token, user } }
    const authData = response.data || response;
    if (authData.token) {
      this.setToken(authData.token);
    }
    return authData;
  }

  async logout(): Promise<void> {
    await this.request("/api/v1/auth/logout", { method: "POST" });
    this.clearToken();
  }

  async getCurrentUser() {
    const response = await this.request<any>("/api/v1/auth/me");
    return response.data || response;
  }

  // Dashboard APIs
  async getDashboardStats(dateRange?: {
    start: string;
    end: string;
  }): Promise<any> {
    const params = dateRange
      ? `?start=${dateRange.start}&end=${dateRange.end}`
      : "";
    const response = await this.request<any>(`/api/v1/dashboard/summary${params}`);
    return response.data || response;
  }

  async getAnalytics(dateRange?: {
    start: string;
    end: string;
  }): Promise<any> {
    const params = dateRange
      ? `?start=${dateRange.start}&end=${dateRange.end}`
      : "";
    const response = await this.request<any>(`/api/v1/dashboard/analytics${params}`);
    return response.data || response;
  }

  async getFraudTrend(days: number = 30): Promise<any> {
    const response = await this.request<any>(`/api/v1/dashboard/fraud-trend?days=${days}`);
    return response.data || response;
  }

  async getTopMerchants(limit: number = 10): Promise<any> {
    const response = await this.request<any>(`/api/v1/dashboard/top-merchants?limit=${limit}`);
    return response.data || response;
  }

  async getGeographicRisk(): Promise<any> {
    const response = await this.request<any>(`/api/v1/dashboard/geographic`);
    return response.data || response;
  }

  // Transaction APIs
  async getTransactions(queryString?: string): Promise<any> {
    const endpoint = queryString
      ? `/api/v1/transactions?${queryString}`
      : `/api/v1/transactions`;
    const response = await this.request<any>(endpoint);
    // Backend returns { success: true, data: {...} }
    return response.data || response;
  }

  async getTransaction(id: string): Promise<any> {
    const response = await this.request<any>(`/api/v1/transactions/${id}`);
    return response.data || response;
  }

  async submitTransaction(data: any): Promise<any> {
    const response = await this.request<any>(`/api/v1/transactions`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data || response;
  }

  async uploadTransactionCSV(formData: FormData): Promise<any> {
    // Don't set Content-Type, let browser set it with boundary
    const headers: Record<string, string> = {};
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}/api/v1/transactions/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.data || result;
  }

  async exportTransactions(queryString?: string): Promise<Blob> {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const endpoint = queryString
      ? `/api/v1/transactions/export?${queryString}`
      : `/api/v1/transactions/export`;

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.blob();
  }

  async getTransactionStats(dateRange?: {
    start: string;
    end: string;
  }): Promise<any> {
    const params = dateRange
      ? `?start=${dateRange.start}&end=${dateRange.end}`
      : "";
    const response = await this.request<any>(`/api/v1/transactions/stats${params}`);
    return response.data || response;
  }

  async updateTransactionStatus(
    id: string,
    status: string,
    reason?: string
  ): Promise<Transaction> {
    return this.request(`/transactions/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, reason }),
    });
  }

  async flagTransaction(id: string, reason: string): Promise<void> {
    return this.request(`/transactions/${id}/flag`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  // Alert APIs
  async getAlerts(
    params: PaginationParams & { filters?: AlertFilters }
  ): Promise<PaginatedResponse<Alert>> {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      size: params.size.toString(),
    });

    if (params.sort) {
      queryParams.append("sort", params.sort);
      queryParams.append("direction", params.direction || "desc");
    }

    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, JSON.stringify(value));
        }
      });
    }

    return this.request(`/alerts?${queryParams}`);
  }

  async getAlert(id: string): Promise<AlertDetail> {
    return this.request(`/alerts/${id}`);
  }

  async updateAlertStatus(
    id: string,
    status: string,
    note?: string
  ): Promise<Alert> {
    return this.request(`/alerts/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, note }),
    });
  }

  async assignAlert(id: string, userId: string): Promise<Alert> {
    return this.request(`/alerts/${id}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ userId }),
    });
  }

  async markAlertFalsePositive(id: string, reason: string): Promise<void> {
    return this.request(`/alerts/${id}/false-positive`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  // Case APIs
  async getCases(
    params: PaginationParams & { filters?: CaseFilters }
  ): Promise<PaginatedResponse<Case>> {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      size: params.size.toString(),
    });

    if (params.sort) {
      queryParams.append("sort", params.sort);
      queryParams.append("direction", params.direction || "desc");
    }

    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, JSON.stringify(value));
        }
      });
    }

    return this.request(`/cases?${queryParams}`);
  }

  async getCase(id: string): Promise<CaseDetail> {
    return this.request(`/cases/${id}`);
  }

  async createCase(data: {
    title: string;
    description: string;
    fraudType: string;
    transactionIds?: string[];
    alertIds?: string[];
  }): Promise<Case> {
    return this.request(`/cases`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCaseStatus(id: string, status: string): Promise<Case> {
    return this.request(`/cases/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async addCaseNote(id: string, note: string): Promise<void> {
    return this.request(`/cases/${id}/notes`, {
      method: "POST",
      body: JSON.stringify({ note }),
    });
  }

  async resolveCase(
    id: string,
    resolution: {
      outcome: string;
      summary: string;
      actionTaken: string;
    }
  ): Promise<Case> {
    return this.request(`/cases/${id}/resolve`, {
      method: "POST",
      body: JSON.stringify(resolution),
    });
  }

  // AI Agent APIs
  async chatWithAgent(
    agentType: string,
    messages: ChatMessage[]
  ): Promise<AgentResponse> {
    return this.request(`/ai/agents/${agentType}/chat`, {
      method: "POST",
      body: JSON.stringify({ messages }),
    });
  }

  async analyzeTransaction(transactionId: string): Promise<AgentResponse> {
    return this.request(`/ai/analyze/transaction/${transactionId}`, {
      method: "POST",
    });
  }

  async investigateCase(caseId: string): Promise<AgentResponse> {
    return this.request(`/ai/investigate/case/${caseId}`, {
      method: "POST",
    });
  }

  async detectPatterns(filters: any): Promise<AgentResponse> {
    return this.request(`/ai/patterns/detect`, {
      method: "POST",
      body: JSON.stringify(filters),
    });
  }

  // Rules APIs
  async getRules(): Promise<FraudRule[]> {
    return this.request(`/rules`);
  }

  async getRule(id: string): Promise<FraudRule> {
    return this.request(`/rules/${id}`);
  }

  async createRule(data: Partial<FraudRule>): Promise<FraudRule> {
    return this.request(`/rules`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateRule(id: string, data: Partial<FraudRule>): Promise<FraudRule> {
    return this.request(`/rules/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async toggleRule(id: string, enabled: boolean): Promise<FraudRule> {
    return this.request(`/rules/${id}/toggle`, {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    });
  }

  // Behavioral Profile APIs
  async getBehavioralProfile(customerId: string): Promise<BehavioralProfile> {
    return this.request(`/behavioral/profiles/${customerId}`);
  }

  async getDeviceHistory(deviceId: string): Promise<any> {
    return this.request(`/behavioral/devices/${deviceId}/history`);
  }

  async getVelocityChecks(customerId: string): Promise<any> {
    return this.request(`/behavioral/velocity/${customerId}`);
  }

  // Search APIs
  async searchTransactions(query: string): Promise<Transaction[]> {
    return this.request(`/search/transactions?q=${encodeURIComponent(query)}`);
  }

  async searchCustomers(query: string): Promise<any[]> {
    return this.request(`/search/customers?q=${encodeURIComponent(query)}`);
  }

  async searchMerchants(query: string): Promise<any[]> {
    return this.request(`/search/merchants?q=${encodeURIComponent(query)}`);
  }
}

export const apiClient = new ApiClient();

