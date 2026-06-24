'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { analyticsApi, FraudPattern } from '@/lib/api/analytics';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Eye,
  Activity,
} from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';

export default function PatternsPage() {
  const { toast } = useToast();
  const [patterns, setPatterns] = useState<FraudPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadPatterns();
  }, []);

  const loadPatterns = async () => {
    setLoading(true);
    try {
      const data = await analyticsApi.getPatterns();
      setPatterns(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load patterns',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const newPatterns = await analyticsApi.analyzePatterns();
      setPatterns(newPatterns);
      toast({
        title: 'Analysis Complete',
        description: `Discovered ${newPatterns.length} fraud patterns`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to analyze patterns',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'LOW':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Fraud Pattern Discovery
            </h1>
          <p className="text-gray-600 mt-2">
            AI-powered detection of fraud patterns and anomalies
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={loadPatterns} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleAnalyze} disabled={analyzing}>
            <Brain className="w-4 h-4 mr-2" />
            {analyzing ? 'Analyzing...' : 'Scan for Patterns'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Patterns</div>
          <div className="text-2xl font-bold mt-1">{patterns.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Active Patterns</div>
          <div className="text-2xl font-bold mt-1 text-green-400">
            {patterns.filter((p) => p.isActive).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Critical Patterns</div>
          <div className="text-2xl font-bold mt-1 text-red-400">
            {patterns.filter((p) => p.severity === 'CRITICAL').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Avg Confidence</div>
          <div className="text-2xl font-bold mt-1">
            {patterns.length > 0
              ? Math.round(
                  patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length
                )
              : 0}
            %
          </div>
        </Card>
      </div>

      {/* Pattern Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <Card className="p-6 col-span-2 animate-pulse">
            <div className="h-32 bg-surface/50 rounded" />
          </Card>
        ) : patterns.length === 0 ? (
          <Card className="p-12 col-span-2 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No Patterns Detected</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Click "Scan for Patterns" to analyze transactions
                </p>
              </div>
              <Button onClick={handleAnalyze}>
                <Brain className="w-4 h-4 mr-2" />
                Start Analysis
              </Button>
            </div>
          </Card>
        ) : (
          patterns.map((pattern) => (
            <Card
              key={pattern.id}
              className="p-6 hover:border-primary/50 transition-all cursor-pointer"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{pattern.patternType}</h3>
                      <p className="text-xs text-muted-foreground">
                        ID: {pattern.id.substring(0, 8)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getSeverityColor(pattern.severity)}>
                      {pattern.severity}
                    </Badge>
                    {pattern.isActive && (
                      <Badge className="bg-green-500/10 text-green-400">
                        <Activity className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground">{pattern.description}</p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-surface/50">
                    <div className="text-xs text-muted-foreground">Confidence</div>
                    <div className="text-lg font-bold mt-1">{pattern.confidence}%</div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface/50">
                    <div className="text-xs text-muted-foreground">Occurrences</div>
                    <div className="text-lg font-bold mt-1">{pattern.occurrences}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface/50">
                    <div className="text-xs text-muted-foreground">Affected</div>
                    <div className="text-lg font-bold mt-1">
                      {pattern.affectedTransactions}
                    </div>
                  </div>
                </div>

                {/* Indicators */}
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Indicators</div>
                  <div className="flex flex-wrap gap-2">
                    {pattern.indicators.slice(0, 3).map((indicator, idx) => (
                      <Badge key={idx} className="text-xs bg-accent/10 text-accent">
                        {indicator}
                      </Badge>
                    ))}
                    {pattern.indicators.length > 3 && (
                      <Badge className="text-xs">+{pattern.indicators.length - 3}</Badge>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>First: {new Date(pattern.firstDetected).toLocaleDateString()}</span>
                  <span>Last: {new Date(pattern.lastDetected).toLocaleDateString()}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  {!pattern.ruleId && (
                    <Button size="sm" className="flex-1">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Create Rule
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}

