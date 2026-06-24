'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { casesApi, Case, CaseFilters } from '@/lib/api/cases';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  RefreshCw,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  FolderOpen,
  Search,
} from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';

const STATUSES = ['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'];

export default function CasesPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [casesByStatus, setCasesByStatus] = useState<Record<string, Case[]>>({
    OPEN: [],
    INVESTIGATING: [],
    RESOLVED: [],
    CLOSED: [],
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CaseFilters>({});
  const [draggedCase, setDraggedCase] = useState<Case | null>(null);

  useEffect(() => {
    loadCases();
  }, [filters]);

  const loadCases = async () => {
    setLoading(true);
    try {
      const response = await casesApi.list(0, 100, filters);

      // Group cases by status
      const grouped = STATUSES.reduce((acc, status) => {
        acc[status] = response.content.filter(c => c.status === status);
        return acc;
      }, {} as Record<string, Case[]>);

      setCasesByStatus(grouped);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load cases',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (caseItem: Case) => {
    setDraggedCase(caseItem);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (newStatus: string) => {
    if (!draggedCase || draggedCase.status === newStatus) return;

    try {
      await casesApi.updateStatus(draggedCase.id, newStatus);
      toast({
        title: 'Success',
        description: `Case moved to ${newStatus}`,
      });
      loadCases();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update case status',
        variant: 'destructive',
      });
    } finally {
      setDraggedCase(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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
      case 'OPEN':
        return <FolderOpen className="w-4 h-4" />;
      case 'INVESTIGATING':
        return <Search className="w-4 h-4" />;
      case 'RESOLVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'CLOSED':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'text-blue-400';
      case 'INVESTIGATING':
        return 'text-yellow-400';
      case 'RESOLVED':
        return 'text-green-400';
      case 'CLOSED':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Case Management
            </h1>
          <p className="text-gray-600 mt-2">
            Investigate and resolve fraud cases
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={loadCases}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => router.push('/cases/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Case
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STATUSES.map((status) => (
          <Card key={status} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{status}</div>
                <div className="text-2xl font-bold mt-1">
                  {casesByStatus[status]?.length || 0}
                </div>
              </div>
              <div className={`${getStatusColor(status)}`}>
                {getStatusIcon(status)}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATUSES.map((status) => (
          <div
            key={status}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(status)}
            className="flex flex-col gap-2"
          >
            {/* Column Header */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={getStatusColor(status)}>
                    {getStatusIcon(status)}
                  </div>
                  <h3 className="font-semibold">{status}</h3>
                </div>
                <Badge variant="outline">{casesByStatus[status]?.length || 0}</Badge>
              </div>
            </Card>

            {/* Case Cards */}
            <div className="space-y-3 min-h-[500px]">
              {loading ? (
                <Card className="p-4 animate-pulse">
                  <div className="h-20 bg-surface/50 rounded" />
                </Card>
              ) : (
                casesByStatus[status]?.map((caseItem) => (
                  <Card
                    key={caseItem.id}
                    draggable
                    onDragStart={() => handleDragStart(caseItem)}
                    onClick={() => router.push(`/cases/${caseItem.id}`)}
                    className="p-4 cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg"
                  >
                    <div className="space-y-3">
                      {/* Case Number & Priority */}
                      <div className="flex items-start justify-between">
                        <div className="text-xs font-mono text-muted-foreground">
                          #{caseItem.caseNumber}
                        </div>
                        <Badge className={`${getPriorityColor(caseItem.priority)} text-xs`}>
                          {caseItem.priority}
                        </Badge>
                      </div>

                      {/* Title */}
                      <h4 className="font-semibold text-sm line-clamp-2">
                        {caseItem.title}
                      </h4>

                      {/* Fraud Type */}
                      <Badge className="text-xs bg-accent/10 text-accent w-fit">
                        {caseItem.fraudType}
                      </Badge>

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(caseItem.createdAt).toLocaleDateString()}
                        </div>
                        {caseItem.assignedToName && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {caseItem.assignedToName.split(' ')[0]}
                          </div>
                        )}
                      </div>

                      {/* Counts */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>🔔 {caseItem.alertIds?.length || 0} alerts</span>
                        <span>💳 {caseItem.transactionIds?.length || 0} txns</span>
                      </div>

                      {/* Total Loss */}
                      {caseItem.totalLoss && (
                        <div className="text-sm font-semibold text-red-400">
                          Loss: ${caseItem.totalLoss.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}

              {!loading && (!casesByStatus[status] || casesByStatus[status].length === 0) && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No cases in {status}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      </div>
    </DashboardLayout>
  );
}

