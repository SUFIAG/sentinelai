import { apiClient } from './client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AgentResponse {
  message: string;
  confidence?: number;
  sources?: string[];
  recommendations?: string[];
}

export const aiAgentApi = {
  /**
   * Chat with AI agent
   * Maps to: POST /api/v1/ai/agents/{agentType}/chat
   */
  async chat(
    agentType: string,
    messages: ChatMessage[]
  ): Promise<string> {
    try {
      const response = await apiClient.request<any>(
        `/api/v1/ai/agents/${agentType}/chat`,
        {
          method: 'POST',
          body: JSON.stringify({ messages }),
        }
      );

      const data = response.data || response;
      return data.message || data.response || 'No response from AI agent';
    } catch (error) {
      console.error('Failed to chat with AI agent:', error);
      throw error;
    }
  },

  /**
   * Analyze transaction with AI
   * Maps to: POST /api/v1/fraud/analyze/{transactionId}
   */
  async analyzeTransaction(transactionId: string): Promise<AgentResponse> {
    try {
      const response = await apiClient.request<any>(
        `/api/v1/fraud/analyze/${transactionId}`,
        {
          method: 'POST',
        }
      );
      return response.data || response;
    } catch (error) {
      console.error('Failed to analyze transaction:', error);
      throw error;
    }
  },

  /**
   * Get AI explanation for alert
   * Maps to: GET /api/v1/ai/explanation/{entityType}/{entityId}
   */
  async getExplanation(
    entityType: 'transaction' | 'alert' | 'case',
    entityId: string
  ): Promise<string> {
    try {
      const response = await apiClient.request<any>(
        `/api/v1/ai/explanation/${entityType}/${entityId}`
      );

      const data = response.data || response;
      return data.explanation || data.message || 'No explanation available';
    } catch (error) {
      console.error('Failed to get AI explanation:', error);
      throw error;
    }
  },

  /**
   * Investigate case with AI
   * Maps to: POST /api/v1/ai/cases/{caseId}/investigate
   */
  async investigateCase(caseId: string): Promise<AgentResponse> {
    try {
      const response = await apiClient.request<any>(
        `/api/v1/ai/cases/${caseId}/investigate`,
        {
          method: 'POST',
        }
      );
      return response.data || response;
    } catch (error) {
      console.error('Failed to investigate case:', error);
      throw error;
    }
  },

  /**
   * Get AI recommendations for alert
   * Maps to: GET /api/v1/ai/recommendations/alert/{alertId}
   */
  async getAlertRecommendations(alertId: string): Promise<string[]> {
    try {
      const response = await apiClient.request<any>(
        `/api/v1/ai/recommendations/alert/${alertId}`
      );

      const data = response.data || response;
      return data.recommendations || data || [];
    } catch (error) {
      console.error('Failed to get alert recommendations:', error);
      throw error;
    }
  },
};

