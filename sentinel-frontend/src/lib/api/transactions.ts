import { apiClient } from './client';

export interface Transaction {
  id: string;
  transactionId: string;
  timestamp: string;
  amount: number;
  currency: string;
  userId: string;
  merchantId: string;
  merchantName: string;
  status: 'PENDING' | 'CLEARED' | 'FLAGGED' | 'BLOCKED';
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ipAddress?: string;
  deviceId?: string;
  location?: {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  paymentMethod?: string;
  metadata?: Record<string, any>;
}

export interface TransactionFilters {
  status?: string;
  riskLevel?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  userId?: string;
  merchantId?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface BulkUploadResult {
  totalRecords: number;
  successCount: number;
  failureCount: number;
  errors?: Array<{
    row: number;
    error: string;
  }>;
}

export const transactionsApi = {
  /**
   * Get paginated list of transactions with filters
   */
  async list(
    page: number = 0,
    size: number = 20,
    filters?: TransactionFilters
  ): Promise<PaginatedResponse<Transaction>> {
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

      return await apiClient.getTransactions(params.toString());
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      throw error;
    }
  },

  /**
   * Get single transaction by ID
   */
  async getById(id: string): Promise<Transaction> {
    try {
      return await apiClient.getTransaction(id);
    } catch (error) {
      console.error(`Failed to fetch transaction ${id}:`, error);
      throw error;
    }
  },

  /**
   * Submit single transaction for fraud analysis
   */
  async submit(transaction: Partial<Transaction>): Promise<Transaction> {
    try {
      return await apiClient.submitTransaction(transaction);
    } catch (error) {
      console.error('Failed to submit transaction:', error);
      throw error;
    }
  },

  /**
   * Upload CSV file for bulk transaction processing
   */
  async uploadCSV(file: File): Promise<BulkUploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      return await apiClient.uploadTransactionCSV(formData);
    } catch (error) {
      console.error('Failed to upload transactions CSV:', error);
      throw error;
    }
  },

  /**
   * Export transactions to CSV
   */
  async exportCSV(filters?: TransactionFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      return await apiClient.exportTransactions(params.toString());
    } catch (error) {
      console.error('Failed to export transactions:', error);
      throw error;
    }
  },

  /**
   * Get transaction statistics
   */
  async getStats(dateRange?: { start: string; end: string }) {
    try {
      return await apiClient.getTransactionStats(dateRange);
    } catch (error) {
      console.error('Failed to fetch transaction stats:', error);
      throw error;
    }
  },
};

