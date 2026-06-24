'use client';

import React, { useEffect, useState } from 'react';
import { useRouter,useParams } from 'next/navigation';
import { transactionsApi, Transaction } from '@/lib/api/transactions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle,
  Smartphone,
  Globe,
  CreditCard,
  User,
  Building,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params.id as string;

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadTransaction();
    }
  }, [id]);

  const loadTransaction = async () => {
    setLoading(true);
    try {
      const data = await transactionsApi.getById(id);
      setTransaction(data);
    } catch (error: any) {
      console.error('Failed to load transaction:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load transaction details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'HIGH':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'LOW':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CLEARED':
        return 'text-green-400 bg-green-500/10';
      case 'FLAGGED':
        return 'text-orange-400 bg-orange-500/10';
      case 'BLOCKED':
        return 'text-red-400 bg-red-500/10';
      case 'PENDING':
        return 'text-yellow-400 bg-yellow-500/10';
      default:
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface rounded w-1/3" />
          <div className="h-64 bg-surface rounded" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-48 bg-surface rounded" />
            <div className="h-48 bg-surface rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertTriangle className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Transaction Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The transaction you're looking for doesn't exist or has been deleted.
        </p>
        <Button onClick={() => router.push('/transactions')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Transactions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push('/transactions')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Transactions
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Transaction Details
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete information and risk analysis
          </p>
        </div>

        <div className="flex gap-2">
          <Badge className={`${getStatusColor(transaction.status)} text-sm px-3 py-1`}>
            {transaction.status}
          </Badge>
          <Badge className={`${getRiskLevelColor(transaction.riskLevel)} text-sm px-3 py-1`}>
            {transaction.riskLevel} RISK
          </Badge>
        </div>
      </div>

      {/* Risk Score Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-1">Risk Assessment</h2>
            <p className="text-sm text-muted-foreground">
              AI-powered fraud detection analysis
            </p>
          </div>
          <div className="text-center">
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-surface"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(transaction.riskScore / 100) * 351.86} 351.86`}
                  className={`transition-all ${
                    transaction.riskScore >= 80
                      ? 'text-red-500'
                      : transaction.riskScore >= 60
                      ? 'text-orange-500'
                      : transaction.riskScore >= 40
                      ? 'text-yellow-500'
                      : 'text-green-500'
                  }`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold">{transaction.riskScore}</div>
                  <div className="text-xs text-muted-foreground">Risk Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Transaction Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">Transaction ID</label>
              <p className="font-mono text-sm mt-1">{transaction.transactionId}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Amount</label>
              <p className="text-2xl font-bold mt-1">
                {transaction.currency} {transaction.amount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Timestamp</label>
              <p className="text-sm mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(transaction.timestamp).toLocaleString('en-US', {
                  dateStyle: 'full',
                  timeStyle: 'long',
                })}
              </p>
            </div>
            {transaction.paymentMethod && (
              <div>
                <label className="text-xs text-muted-foreground">Payment Method</label>
                <p className="text-sm mt-1 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {transaction.paymentMethod}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Merchant & User Info */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Parties Involved
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Building className="w-3 h-3" />
                Merchant
              </label>
              <p className="font-semibold mt-1">{transaction.merchantName || 'Unknown Merchant'}</p>
              <p className="text-xs text-muted-foreground font-mono">{transaction.merchantId}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" />
                User
              </label>
              <p className="text-sm font-mono mt-1">{transaction.userId}</p>
            </div>
            {transaction.location && (
              <div>
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Location
                </label>
                <p className="text-sm mt-1">
                  {transaction.location.city}, {transaction.location.country}
                </p>
                <p className="text-xs text-muted-foreground">
                  {transaction.location.latitude.toFixed(4)}, {transaction.location.longitude.toFixed(4)}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Technical Details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Technical Details
          </h3>
          <div className="space-y-4">
            {transaction.ipAddress && (
              <div>
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  IP Address
                </label>
                <p className="font-mono text-sm mt-1">{transaction.ipAddress}</p>
              </div>
            )}
            {transaction.deviceId && (
              <div>
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Smartphone className="w-3 h-3" />
                  Device ID
                </label>
                <p className="font-mono text-sm mt-1">{transaction.deviceId}</p>
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground">Internal ID</label>
              <p className="font-mono text-xs mt-1 text-muted-foreground">{transaction.id}</p>
            </div>
          </div>
        </Card>

        {/* Risk Factors */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Risk Factors
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface/50">
              <span className="text-sm">Transaction Amount Risk</span>
              <Badge className="bg-yellow-500/10 text-yellow-400">Medium</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface/50">
              <span className="text-sm">Velocity Check</span>
              <Badge className="bg-green-500/10 text-green-400">Passed</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface/50">
              <span className="text-sm">Geolocation Mismatch</span>
              <Badge className="bg-red-500/10 text-red-400">Failed</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface/50">
              <span className="text-sm">Device Fingerprint</span>
              <Badge className="bg-green-500/10 text-green-400">Match</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Metadata */}
      {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Additional Metadata</h3>
          <pre className="text-xs bg-surface p-4 rounded-lg overflow-x-auto">
            {JSON.stringify(transaction.metadata, null, 2)}
          </pre>
        </Card>
      )}

      {/* Actions */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Actions</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Take action on this transaction
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Create Alert
            </Button>
            <Button variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Create Case
            </Button>
            <Button variant="destructive">
              Block Transaction
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

