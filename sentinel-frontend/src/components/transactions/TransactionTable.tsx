'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Transaction } from '@/lib/api/transactions';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TransactionTableProps {
  transactions: Transaction[];
  loading?: boolean;
  onRowClick?: (transaction: Transaction) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  loading = false,
  onRowClick,
}) => {
  const router = useRouter();

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'LOW':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CLEARED':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'FLAGGED':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'BLOCKED':
        return <Shield className="w-4 h-4 text-red-400" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CLEARED':
        return 'bg-green-500/10 text-green-400';
      case 'FLAGGED':
        return 'bg-orange-500/10 text-orange-400';
      case 'BLOCKED':
        return 'bg-red-500/10 text-red-400';
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const handleRowClick = (transaction: Transaction) => {
    if (onRowClick) {
      onRowClick(transaction);
    } else {
      router.push(`/transactions/${transaction.id}`);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-surface/50 rounded" />
          ))}
        </div>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No Transactions Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your filters or upload transactions to get started.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Merchant
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Risk Level
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Risk Score
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr
                key={transaction.id}
                className="border-b border-border hover:bg-primary/5 transition-colors cursor-pointer"
                onClick={() => handleRowClick(transaction)}
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-primary">
                      {transaction.transactionId.substring(0, 12)}...
                    </code>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm">
                    {new Date(transaction.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium">
                    {transaction.merchantName || 'Unknown Merchant'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {transaction.merchantId?.substring(0, 8)}
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-sm font-semibold tabular-nums">
                    {transaction.currency} {transaction.amount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <Badge className={`flex items-center gap-1.5 w-fit ${getStatusColor(transaction.status)}`}>
                    {getStatusIcon(transaction.status)}
                    <span className="text-xs">{transaction.status}</span>
                  </Badge>
                </td>
                <td className="px-4 py-4">
                  <Badge className={`${getRiskBadgeColor(transaction.riskLevel)} text-xs w-fit`}>
                    {transaction.riskLevel}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 bg-surface rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          transaction.riskScore >= 80
                            ? 'bg-red-500'
                            : transaction.riskScore >= 60
                            ? 'bg-orange-500'
                            : transaction.riskScore >= 40
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${transaction.riskScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono tabular-nums">
                      {transaction.riskScore}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/transactions/${transaction.id}`);
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

