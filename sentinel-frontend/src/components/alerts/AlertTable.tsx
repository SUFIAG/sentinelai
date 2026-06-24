'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/lib/api/alerts';
import { AlertTriangle, Clock, CheckCircle, XCircle, Flag, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AlertTableProps {
  alerts: Alert[];
  loading?: boolean;
  onAlertClick?: (alert: Alert) => void;
  onSelectAlert?: (alert: Alert, selected: boolean) => void;
  selectedAlerts?: Set<string>;
}

export const AlertTable: React.FC<AlertTableProps> = ({
  alerts,
  loading = false,
  onAlertClick,
  onSelectAlert,
  selectedAlerts = new Set(),
}) => {
  const router = useRouter();

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'FALSE_POSITIVE':
        return <XCircle className="w-4 h-4 text-gray-400" />;
      case 'IN_REVIEW':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'OPEN':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Flag className="w-4 h-4" />;
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

  const handleRowClick = (alert: Alert) => {
    if (onAlertClick) {
      onAlertClick(alert);
    } else {
      router.push(`/alerts/${alert.id}`);
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

  if (alerts.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No Alerts Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              All clear! No fraud alerts detected.
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
              {onSelectAlert && (
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" className="rounded" />
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Alert Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Severity
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Message
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Risk Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr
                key={alert.id}
                className="border-b border-border hover:bg-primary/5 transition-colors cursor-pointer"
                onClick={() => handleRowClick(alert)}
              >
                {onSelectAlert && (
                  <td className="px-4 py-4"  onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedAlerts.has(alert.id)}
                      onChange={(e) => onSelectAlert(alert, e.target.checked)}
                      className="rounded"
                    />
                  </td>
                )}
                <td className="px-4 py-4">
                  <div className="font-medium text-sm">{alert.alertType}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {alert.transactionId?.substring(0, 12)}...
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Badge className={`${getSeverityColor(alert.severity)} text-xs`}>
                    {alert.severity}
                  </Badge>
                </td>
                <td className="px-4 py-4">
                  <Badge className={`flex items-center gap-1.5 w-fit ${getStatusColor(alert.status)}`}>
                    {getStatusIcon(alert.status)}
                    <span className="text-xs">{alert.status.replace('_', ' ')}</span>
                  </Badge>
                </td>
                <td className="px-4 py-4 max-w-xs">
                  <p className="text-sm truncate">{alert.message}</p>
                  {alert.triggeredRules.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {alert.triggeredRules.slice(0, 2).map((rule, idx) => (
                        <Badge key={idx} className="text-xs bg-accent/10 text-accent">
                          {rule}
                        </Badge>
                      ))}
                      {alert.triggeredRules.length > 2 && (
                        <Badge className="text-xs">+{alert.triggeredRules.length - 2}</Badge>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 bg-surface rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          alert.riskScore >= 80
                            ? 'bg-red-500'
                            : alert.riskScore >= 60
                            ? 'bg-orange-500'
                            : alert.riskScore >= 40
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${alert.riskScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono tabular-nums">{alert.riskScore}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm">
                    {new Date(alert.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/alerts/${alert.id}`);
                    }}
                  >
                    <TrendingUp className="w-4 h-4" />
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

