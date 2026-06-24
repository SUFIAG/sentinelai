import { apiClient } from './client';

export interface Alert {
  id: string;
  transactionId: string;
  alertType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'FALSE_POSITIVE';
  riskScore: number;
  message: string;
  triggeredRules: string[];
  createdAt: string;
  assignedTo?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  resolution?: string;
  metadata?: Record<string, any>;
}

export interface AlertFilters {
  status?: string;
  severity?: string;
  alertType?: string;
  startDate?: string;
  endDate?: string;
  assignedTo?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const alertsApi = {
  /**
   * Get paginated list of alerts with filters
   */
  async list(
    page: number = 0,
    size: number = 20,
    filters?: AlertFilters
  ): Promise<PaginatedResponse<Alert>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await apiClient.request<any>(
        `/api/v1/alerts?${params.toString()}`
      );
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      throw error;
    }
  },

  /**
   * Get single alert by ID
   */
  async getById(id: string): Promise<Alert> {
    try {
      const response = await apiClient.request<any>(`/api/v1/alerts/${id}`);
      return response.data || response;
    } catch (error) {
      console.error(`Failed to fetch alert ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update alert status
   */
  async updateStatus(
    id: string,
    status: string,
    note?: string
  ): Promise<Alert> {
    try {
      const response = await apiClient.request<any>(`/api/v1/alerts/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      });
      return response.data || response;
    } catch (error) {
      console.error('Failed to update alert status:', error);
      throw error;
    }
  },

  /**
   * Mark alert as false positive
   */
  async markFalsePositive(id: string, reason: string): Promise<void> {
    try {
      await this.updateStatus(id, 'FALSE_POSITIVE', reason);
    } catch (error) {
      console.error('Failed to mark alert as false positive:', error);
      throw error;
    }
  },

  /**
   * Assign alert to user
   */
  async assign(id: string, userId: string): Promise<Alert> {
    try {
      const response = await apiClient.request<any>(`/api/v1/alerts/${id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ userId }),
      });
      return response.data || response;
    } catch (error) {
      console.error('Failed to assign alert:', error);
      throw error;
    }
  },

  /**
   * Get AI explanation for alert
   */
  async getExplanation(id: string): Promise<string> {
    try {
      const response = await apiClient.request<any>(`/api/v1/alerts/${id}/explanation`);
      return response.data?.explanation || response.explanation || 'No explanation available';
    } catch (error) {
      console.error('Failed to get alert explanation:', error);
      throw error;
    }
  },

  /**
   * Bulk update alerts
   */
  async bulkUpdate(
    ids: string[],
    action: 'RESOLVE' | 'FALSE_POSITIVE' | 'ASSIGN',
    data?: any
  ): Promise<void> {
    try {
      await apiClient.request<any>(`/api/v1/alerts/bulk`, {
        method: 'PATCH',
        body: JSON.stringify({ ids, action, ...data }),
      });
    } catch (error) {
      console.error('Failed to bulk update alerts:', error);
      throw error;
    }
  },

  /**
   * Get alert statistics
   */
  async getStats(): Promise<any> {
    try {
      const response = await apiClient.request<any>(`/api/v1/alerts/stats`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch alert stats:', error);
      throw error;
    }
  },
};

