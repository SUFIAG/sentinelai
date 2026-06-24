import { apiClient } from './client';

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  fraudType: string;
  assignedTo?: string;
  assignedToName?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolution?: string;
  outcome?: string;
  alertIds: string[];
  transactionIds: string[];
  totalLoss?: number;
  relatedCases?: string[];
}

export interface CaseComment {
  id: string;
  caseId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface CaseHistory {
  id: string;
  caseId: string;
  action: string;
  description: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface CaseFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  fraudType?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const casesApi = {
  /**
   * Get paginated list of cases
   */
  async list(
    page: number = 0,
    size: number = 20,
    filters?: CaseFilters
  ): Promise<PaginatedResponse<Case>> {
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
        `/api/v1/cases?${params.toString()}`
      );
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch cases:', error);
      throw error;
    }
  },

  /**
   * Get case by ID
   */
  async getById(id: string): Promise<Case> {
    try {
      const response = await apiClient.request<any>(`/api/v1/cases/${id}`);
      return response.data || response;
    } catch (error) {
      console.error(`Failed to fetch case ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new case
   */
  async create(data: {
    title: string;
    description: string;
    fraudType: string;
    alertIds?: string[];
    transactionIds?: string[];
    priority?: string;
  }): Promise<Case> {
    try {
      const response = await apiClient.request<any>(`/api/v1/cases`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.data || response;
    } catch (error) {
      console.error('Failed to create case:', error);
      throw error;
    }
  },

  /**
   * Update case status
   */
  async updateStatus(id: string, status: string): Promise<Case> {
    try {
      const response = await apiClient.request<any>(`/api/v1/cases/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return response.data || response;
    } catch (error) {
      console.error('Failed to update case status:', error);
      throw error;
    }
  },

  /**
   * Assign case to user
   */
  async assign(id: string, userId: string): Promise<Case> {
    try {
      const response = await apiClient.request<any>(`/api/v1/cases/${id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ assignedTo: userId }),
      });
      return response.data || response;
    } catch (error) {
      console.error('Failed to assign case:', error);
      throw error;
    }
  },

  /**
   * Add comment to case
   */
  async addComment(id: string, content: string): Promise<CaseComment> {
    try {
      const response = await apiClient.request<any>(`/api/v1/cases/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      return response.data || response;
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  },

  /**
   * Get case comments
   */
  async getComments(id: string): Promise<CaseComment[]> {
    try {
      const response = await apiClient.request<any>(`/api/v1/cases/${id}/comments`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to get comments:', error);
      throw error;
    }
  },

  /**
   * Get case history
   */
  async getHistory(id: string): Promise<CaseHistory[]> {
    try {
      const response = await apiClient.request<any>(`/api/v1/cases/${id}/history`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to get case history:', error);
      throw error;
    }
  },

  /**
   * Resolve case
   */
  async resolve(
    id: string,
    resolution: {
      outcome: string;
      summary: string;
      actionTaken?: string;
    }
  ): Promise<Case> {
    try {
      const response = await apiClient.request<any>(`/api/v1/cases/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify(resolution),
      });
      return response.data || response;
    } catch (error) {
      console.error('Failed to resolve case:', error);
      throw error;
    }
  },
};

