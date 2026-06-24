'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { alertsApi, Alert } from '@/lib/api/alerts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Brain,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';

export default function AlertDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params.id as string;

  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (id) {
      loadAlert();
    }
  }, [id]);

  const loadAlert = async () => {
    setLoading(true);
    try {
      const data = await alertsApi.getById(id);
      setAlert(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load alert',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAIExplanation = async () => {
    setLoadingExplanation(true);
    try {
      const explanation = await alertsApi.getExplanation(id);
      // Simulate streaming effect
      let index = 0;
      const interval = setInterval(() => {
        if (index < explanation.length) {
          setAiExplanation((prev) => prev + explanation[index]);
          index++;
        } else {
          clearInterval(interval);
          setLoadingExplanation(false);
        }
      }, 20);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load AI explanation',
        variant: 'destructive',
      });
      setLoadingExplanation(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!alert) return;
    setUpdatingStatus(true);
    try {
      await alertsApi.updateStatus(id, newStatus);
      toast({
        title: 'Success',
        description: `Alert status updated to ${newStatus}`,
      });
      loadAlert();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'HIGH':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'LOW':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-green-500/10 text-green-400';
      case 'FALSE_POSITIVE':
        return 'bg-gray-500/10 text-gray-400';
      case 'IN_REVIEW':
        return 'bg-yellow-500/10 text-yellow-400';
      case 'OPEN':
        return 'bg-red-500/10 text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface rounded w-1/3" />
          <div className="h-64 bg-surface rounded" />
        </div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertTriangle className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Alert Not Found</h2>
        <Button onClick={() => router.push('/alerts')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Alerts
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push('/alerts')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Alerts
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Alert Details
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive fraud alert analysis
          </p>
        </div>

        <div className="flex gap-2">
          <Badge className={`${getStatusColor(alert.status)} text-sm px-3 py-1`}>
            {alert.status.replace('_', ' ')}
          </Badge>
          <Badge className={`${getSeverityColor(alert.severity)} text-sm px-3 py-1`}>
            {alert.severity}
          </Badge>
        </div>
      </div>

      {/* Risk Score */}
      <Card className="p-6 bg-gradient-to-br from-red-500/5 to-orange-500/5 border-red-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-1">Fraud Risk Assessment</h2>
            <p className="text-sm text-muted-foreground">
              Alert Type: {alert.alertType}
            </p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 rounded-full border-4 border-red-500 flex items-center justify-center">
              <div>
                <div className="text-3xl font-bold text-red-400">{alert.riskScore}</div>
                <div className="text-xs text-muted-foreground">Risk</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Alert Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">Alert ID</label>
              <p className="font-mono text-sm mt-1">{alert.id}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Transaction ID</label>
              <p className="font-mono text-sm mt-1">{alert.transactionId}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Message</label>
              <p className="text-sm mt-1">{alert.message}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Created At</label>
              <p className="text-sm mt-1">
                {new Date(alert.createdAt).toLocaleString('en-US', {
                  dateStyle: 'full',
                  timeStyle: 'long',
                })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Triggered Rules
          </h3>
          <div className="space-y-2">
            {alert.triggeredRules.map((rule, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-surface/50"
              >
                <span className="text-sm">{rule}</span>
                <Badge className="bg-red-500/10 text-red-400">Triggered</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* AI Explanation */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Fraud Analysis
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAIExplanation}
            disabled={loadingExplanation || aiExplanation.length > 0}
          >
            {loadingExplanation ? 'Analyzing...' : 'Generate Analysis'}
          </Button>
        </div>

        {aiExplanation ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="p-4 rounded-lg bg-surface/50 whitespace-pre-wrap">{aiExplanation}</div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p>Click "Generate Analysis" to get AI-powered fraud insights</p>
          </div>
        )}
      </Card>

      {/* Actions */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Actions</h3>
            <p className="text-sm text-muted-foreground mt-1">Update alert status</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleUpdateStatus('IN_REVIEW')}
              disabled={updatingStatus || alert.status === 'IN_REVIEW'}
            >
              <Clock className="w-4 h-4 mr-2" />
              Review
            </Button>
            <Button
              variant="outline"
              onClick={() => handleUpdateStatus('RESOLVED')}
              disabled={updatingStatus || alert.status === 'RESOLVED'}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Resolve
            </Button>
            <Button
              variant="outline"
              onClick={() => handleUpdateStatus('FALSE_POSITIVE')}
              disabled={updatingStatus || alert.status === 'FALSE_POSITIVE'}
            >
              <XCircle className="w-4 h-4 mr-2" />
              False Positive
            </Button>
            <Button variant="default">
              <FileText className="w-4 h-4 mr-2" />
              Create Case
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

