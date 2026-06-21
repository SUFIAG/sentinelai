'use client';

import React, { useEffect, useState } from 'react';
import { KPICard } from '@/components/dashboard/KPICard';
import { RealtimeChart } from '@/components/dashboard/RealtimeChart';
import { AIAgentChat } from '@/components/ai/AIAgentChat';
import {
  DollarSign,
  Shield,
  AlertTriangle,
  TrendingUp,
  Activity,
  Users,
} from 'lucide-react';
import { dashboardApi } from '@/lib/api/dashboard';
import { useToast } from '@/lib/hooks/useToast';

export default function DashboardPage() {
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

      // Generate demo chart data (replace with real API data)
      const now = new Date();
      const chartData = Array.from({ length: 24 }, (_, i) => ({
        name: `${23 - i}h`,
        transactions: Math.floor(Math.random() * 1000) + 500,
        fraud: Math.floor(Math.random() * 50) + 10,
        blocked: Math.floor(Math.random() * 30) + 5,
      })).reverse();

      setTransactionData(chartData);
      setFraudData(chartData);
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
      // TODO: Connect to AI agent API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Demo responses based on keywords
      if (message.toLowerCase().includes('fraud')) {
        return `Based on current data, we've detected ${stats?.fraudDetected || 0} fraudulent transactions today. The fraud rate is ${stats?.fraudRate || 0}%. The most common fraud patterns are:
        
1. Velocity abuse (45%)
2. Suspicious geolocation (30%)
3. Abnormal transaction amounts (25%)

Would you like me to investigate any specific pattern?`;
      }

      if (message.toLowerCase().includes('alert')) {
        return `You currently have ${stats?.activeAlerts || 0} active alerts. ${stats?.criticalAlerts || 0} are marked as critical priority. The most recent alert was triggered 2 minutes ago for a high-risk transaction.`;
      }

      return `I've analyzed your query: "${message}". In production, I would use advanced NLP and our fraud detection algorithms to provide detailed insights. Current system status: All fraud detection engines are operational.`;
    } catch (error) {
      return 'Sorry, I encountered an error processing your request.';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Fraud Detection Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
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
            {[
              { type: 'fraud', message: 'High-risk transaction detected', time: '2 min ago', severity: 'critical' },
              { type: 'alert', message: 'Velocity threshold exceeded', time: '5 min ago', severity: 'high' },
              { type: 'case', message: 'Case #1234 updated', time: '10 min ago', severity: 'medium' },
              { type: 'fraud', message: 'Suspicious device fingerprint', time: '15 min ago', severity: 'high' },
              { type: 'alert', message: 'Geolocation mismatch detected', time: '20 min ago', severity: 'medium' },
            ].map((activity, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      activity.severity === 'critical'
                        ? 'bg-red-500/10 text-red-400'
                        : activity.severity === 'high'
                        ? 'bg-orange-500/10 text-orange-400'
                        : 'bg-yellow-500/10 text-yellow-400'
                    }`}
                  >
                    {activity.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

