'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AlertTable } from '@/components/alerts/AlertTable';
import { alertsApi, Alert, AlertFilters, PaginatedResponse } from '@/lib/api/alerts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';

export default function AlertsPage() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AlertFilters>({});
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Stats
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadAlerts();
    loadStats();
  }, [currentPage, filters]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const response: PaginatedResponse<Alert> = await alertsApi.list(
        currentPage,
        pageSize,
        filters
      );
      setAlerts(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      console.error('Failed to load alerts:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load alerts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await alertsApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load alert stats:', error);
    }
  };

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status === status ? undefined : status,
    }));
    setCurrentPage(0);
  };

  const handleSeverityFilter = (severity: string) => {
    setFilters((prev) => ({
      ...prev,
      severity: prev.severity === severity ? undefined : severity,
    }));
    setCurrentPage(0);
  };

  const handleSelectAlert = (alert: Alert, selected: boolean) => {
    setSelectedAlerts((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(alert.id);
      } else {
        newSet.delete(alert.id);
      }
      return newSet;
    });
  };

  const handleBulkResolve = async () => {
    if (selectedAlerts.size === 0) return;

    try {
      await alertsApi.bulkUpdate(Array.from(selectedAlerts), 'RESOLVE');
      toast({
        title: 'Success',
        description: `Resolved ${selectedAlerts.size} alert(s)`,
      });
      setSelectedAlerts(new Set());
      loadAlerts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resolve alerts',
        variant: 'destructive',
      });
    }
  };

  const handleBulkFalsePositive = async () => {
    if (selectedAlerts.size === 0) return;

    try {
      await alertsApi.bulkUpdate(Array.from(selectedAlerts), 'FALSE_POSITIVE');
      toast({
        title: 'Success',
        description: `Marked ${selectedAlerts.size} alert(s) as false positive`,
      });
      setSelectedAlerts(new Set());
      loadAlerts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update alerts',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Fraud Alerts
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage fraud detection alerts
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAlerts}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Alerts</div>
          <div className="text-2xl font-bold mt-1">{totalElements.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Open Alerts</div>
          <div className="text-2xl font-bold mt-1 text-red-400">
            {alerts.filter((a) => a.status === 'OPEN').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">In Review</div>
          <div className="text-2xl font-bold mt-1 text-yellow-400">
            {alerts.filter((a) => a.status === 'IN_REVIEW').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Critical</div>
          <div className="text-2xl font-bold mt-1 text-red-400">
            {alerts.filter((a) => a.severity === 'CRITICAL').length}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            {['OPEN', 'IN_REVIEW', 'RESOLVED', 'FALSE_POSITIVE'].map((status) => (
              <Button
                key={status}
                variant={filters.status === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter(status)}
              >
                {status.replace('_', ' ')}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-muted-foreground">Severity:</span>
            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((severity) => (
              <Button
                key={severity}
                variant={filters.severity === severity ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSeverityFilter(severity)}
              >
                {severity}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedAlerts.size > 0 && (
        <Card className="p-4 bg-primary/10 border-primary/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedAlerts.size} alert(s) selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleBulkResolve}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Resolve
              </Button>
              <Button variant="outline" size="sm" onClick={handleBulkFalsePositive}>
                <XCircle className="w-4 h-4 mr-2" />
                Mark False Positive
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAlerts(new Set())}
              >
                Clear
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {alerts.length} of {totalElements} alerts
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0 || loading}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1 || loading}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Alerts Table */}
      <AlertTable
        alerts={alerts}
        loading={loading}
        onSelectAlert={handleSelectAlert}
        selectedAlerts={selectedAlerts}
      />
    </div>
    </DashboardLayout>
  );
}

