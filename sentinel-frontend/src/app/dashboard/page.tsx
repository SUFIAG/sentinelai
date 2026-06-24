'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KPICard } from '@/components/dashboard/KPICard';
import { RealtimeChart } from '@/components/dashboard/RealtimeChart';
import { AIAgentChat } from '@/components/ai/AIAgentChat';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuthProtection } from '@/lib/hooks/useAuthProtection';
import {
  DollarSign,
  Shield,
  AlertTriangle,
  TrendingUp,
  Activity,
  Users,
} from 'lucide-react';
import { dashboardApi } from '@/lib/api/dashboard';
import { aiAgentApi } from '@/lib/api/ai-agent';
import { useToast } from '@/lib/hooks/useToast';

export default function DashboardPage() {
  useAuthProtection(); // Protect this page
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [transactionData, setTransactionData] = useState<any[]>([]);
  const [fraudData, setFraudData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadDashboardData();

    // Set up real-time updates every 10 seconds
    const interval = setInterval(loadDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await dashboardApi.getStats();
      setStats(data);

      // Fetch real fraud trend data
      try {
        const trendData = await dashboardApi.getFraudTrend(24);
        if (trendData && Array.isArray(trendData) && trendData.length > 0) {
          setTransactionData(trendData);
          setFraudData(trendData);
        } else {
          setTransactionData([]);
          setFraudData([]);
        }
      } catch (trendError) {
        console.error('Failed to load trend data:', trendError);
        toast({
          title: 'Warning',
          description: 'Failed to load trend data. Please check backend connection.',
          variant: 'destructive',
        });
        setTransactionData([]);
        setFraudData([]);
      }

      setLoading(false);
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load dashboard data',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      // Connect to real AI agent API
      const response = await aiAgentApi.chat('fraud-analyst', [
        { role: 'user', content: message }
      ]);
      return response;
    } catch (error: any) {
      console.error('AI chat error:', error);
      // Return error message to user
      return `I'm having trouble connecting to the AI service. Error: ${error.message}. Please ensure the backend is running.`;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#003366] to-[#0B3058] bg-clip-text text-transparent">
            Fraud Detection Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time monitoring and AI-powered fraud detection
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Total Transactions"
          value={stats?.totalTransactions?.toLocaleString() || '0'}
          change={stats?.transactionGrowth || 0}
          trend={stats?.transactionGrowth > 0 ? 'up' : 'down'}
          icon={<Activity className="w-4 h-4" />}
          loading={loading}
        />

        <KPICard
          title="Transaction Volume"
          value={`$${(stats?.totalValue / 1000000 || 0).toFixed(1)}M`}
          change={stats?.volumeGrowth || 0}
          trend={stats?.volumeGrowth > 0 ? 'up' : 'down'}
          icon={<DollarSign className="w-4 h-4" />}
          loading={loading}
        />

        <KPICard
          title="Fraud Detected"
          value={stats?.fraudDetected || 0}
          change={stats?.fraudGrowth || 0}
          trend={stats?.fraudGrowth < 0 ? 'up' : 'down'}
          icon={<Shield className="w-4 h-4" />}
          loading={loading}
        />

        <KPICard
          title="Fraud Rate"
          value={`${stats?.fraudRate?.toFixed(2) || 0}%`}
          change={stats?.fraudRateChange || 0}
          trend={stats?.fraudRateChange < 0 ? 'up' : 'down'}
          icon={<TrendingUp className="w-4 h-4" />}
          loading={loading}
        />

        <KPICard
          title="Active Alerts"
          value={stats?.activeAlerts || 0}
          change={stats?.alertGrowth || 0}
          trend="neutral"
          icon={<AlertTriangle className="w-4 h-4" />}
          loading={loading}
        />

        <KPICard
          title="Active Cases"
          value={stats?.activeCases || 0}
          change={stats?.caseGrowth || 0}
          trend="neutral"
          icon={<Users className="w-4 h-4" />}
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealtimeChart
          title="Transaction Volume (Last 24h)"
          data={transactionData}
          dataKeys={[
            { key: 'transactions', color: '#00D9FF', label: 'Transactions' },
          ]}
          type="area"
          height={300}
        />

        <RealtimeChart
          title="Fraud Detection (Last 24h)"
          data={fraudData}
          dataKeys={[
            { key: 'fraud', color: '#FF4444', label: 'Fraud Detected' },
            { key: 'blocked', color: '#FFA500', label: 'Blocked' },
          ]}
          type="line"
          height={300}
        />
      </div>

      {/* AI Agent & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIAgentChat
          agentName="Sentinel AI Analyst"
          placeholder="Ask me about fraud patterns, alerts, or system status..."
          onSendMessage={handleSendMessage}
        />

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Recent Activity</h2>
          <div className="space-y-3">
            <div className="text-center py-8 text-muted-foreground text-sm">
              <p>No recent activity</p>
              <p className="text-xs mt-2">Activity will appear when fraud is detected. Connect to event stream API for real-time updates.</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}

