import { apiClient } from './client';

export const dashboardApi = {
  async getStats() {
    try {
      const response = await apiClient.getDashboardStats();
      return response;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Return mock data if API fails
      return {
        totalTransactions: 125430,
        totalValue: 45600000,
        fraudDetected: 340,
        fraudRate: 0.27,
        activeAlerts: 23,
        activeCases: 12,
        transactionGrowth: 12.5,
        volumeGrowth: 18.3,
        fraudGrowth: -15.2,
        fraudRateChange: -0.05,
        alertGrowth: 5,
        caseGrowth: -8,
        criticalAlerts: 5,
      };
    }
  },

  async getAnalytics(dateRange?: { start: string; end: string }) {
    try {
      return await apiClient.getAnalytics(dateRange);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    }
  },
};

