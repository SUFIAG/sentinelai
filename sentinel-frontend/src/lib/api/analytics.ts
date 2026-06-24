import { apiClient } from './client';

export interface FraudPattern {
  id: string;
  patternType: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  occurrences: number;
  affectedTransactions: number;
  firstDetected: string;
  lastDetected: string;
  indicators: string[];
  ruleId?: string;
  isActive: boolean;
}

export interface UserProfile {
  userId: string;
  totalTransactions: number;
  averageAmount: number;
  riskScore: number;
  accountAge: number;
  deviceCount: number;
  locationCount: number;
  suspiciousActivity: number;
  lastActivity: string;
  behavioralFlags: string[];
}

export interface MerchantProfile {
  merchantId: string;
  merchantName: string;
  totalTransactions: number;
  fraudRate: number;
  avgTransactionAmount: number;
  riskScore: number;
  chargebackRate: number;
  suspiciousPatterns: string[];
}

export const analyticsApi = {
  /**
   * Get fraud patterns
   */
  async getPatterns(): Promise<FraudPattern[]> {
    try {
      const response = await apiClient.request<any>(`/api/v1/patterns`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch patterns:', error);
      throw error;
    }
  },

  /**
   * Analyze and discover new patterns
   */
  async analyzePatterns(): Promise<FraudPattern[]> {
    try {
      const response = await apiClient.request<any>(`/api/v1/patterns/analyze`, {
        method: 'POST',
      });
      return response.data || response;
    } catch (error) {
      console.error('Failed to analyze patterns:', error);
      throw error;
    }
  },

  /**
   * Get user behavioral profile
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const response = await apiClient.request<any>(`/api/v1/profiles/${userId}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  },

  /**
   * Analyze user profile
   */
  async analyzeUserProfile(userId: string): Promise<UserProfile> {
    try {
      const response = await apiClient.request<any>(`/api/v1/profiles/${userId}/analyze`, {
        method: 'POST',
      });
      return response.data || response;
    } catch (error) {
      console.error('Failed to analyze user profile:', error);
      throw error;
    }
  },

  /**
   * Get velocity checks
   */
  async getVelocityChecks(userId: string): Promise<any> {
    try {
      const response = await apiClient.request<any>(`/api/v1/velocity/${userId}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch velocity checks:', error);
      throw error;
    }
  },

  /**
   * Get device history
   */
  async getDeviceHistory(deviceId: string): Promise<any> {
    try {
      const response = await apiClient.request<any>(`/api/v1/devices/${deviceId}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch device history:', error);
      throw error;
    }
  },
};

