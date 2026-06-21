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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
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
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    this.setToken(response.token);
    return response;
  }

  async logout(): Promise<void> {
    await this.request("/auth/logout", { method: "POST" });
    this.clearToken();
  }

  async getCurrentUser() {
    return this.request("/auth/me");
  }

  // Dashboard APIs
  async getDashboardStats(dateRange?: {
    start: string;
    end: string;
  }): Promise<DashboardStats> {
    const params = dateRange
      ? `?start=${dateRange.start}&end=${dateRange.end}`
      : "";
    return this.request(`/dashboard/stats${params}`);
  }

  async getAnalytics(dateRange?: {
    start: string;
    end: string;
  }): Promise<AnalyticsData> {
    const params = dateRange
      ? `?start=${dateRange.start}&end=${dateRange.end}`
      : "";
    return this.request(`/dashboard/analytics${params}`);
  }

  // Transaction APIs
  async getTransactions(
    params: PaginationParams & { filters?: TransactionFilters }
  ): Promise<PaginatedResponse<Transaction>> {
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

    return this.request(`/transactions?${queryParams}`);
  }

  async getTransaction(id: string): Promise<TransactionDetail> {
    return this.request(`/transactions/${id}`);
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

