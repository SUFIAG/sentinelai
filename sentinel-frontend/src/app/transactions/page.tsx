'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { FilterPanel } from '@/components/transactions/FilterPanel';
import { UploadZone } from '@/components/transactions/UploadZone';
import {
  transactionsApi,
  Transaction,
  TransactionFilters,
  PaginatedResponse,
} from '@/lib/api/transactions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Filter,
  Upload,
  Download,
  RefreshCw,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';

export default function TransactionsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({});
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadTransactions();
  }, [currentPage, filters]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response: PaginatedResponse<Transaction> = await transactionsApi.list(
        currentPage,
        pageSize,
        filters
      );
      setTransactions(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      console.error('Failed to load transactions:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load transactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
    setCurrentPage(0); // Reset to first page
  };

  const handleResetFilters = () => {
    setFilters({});
    setCurrentPage(0);
  };

  const handleExport = async () => {
    try {
      toast({
        title: 'Exporting...',
        description: 'Preparing your CSV file...',
      });

      const blob = await transactionsApi.exportCSV(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Export Successful',
        description: 'Your CSV file has been downloaded.',
      });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export transactions',
        variant: 'destructive',
      });
    }
  };

  const activeFilterCount = Object.keys(filters).filter(
    (k) => filters[k as keyof TransactionFilters]
  ).length;

  return (
    <DashboardLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Transactions
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor and analyze all transactions in real-time
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowUpload(!showUpload)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload CSV
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={loadTransactions}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Transactions</div>
          <div className="text-2xl font-bold mt-1">{totalElements.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Current Page</div>
          <div className="text-2xl font-bold mt-1">{currentPage + 1} of {totalPages}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Page Size</div>
          <div className="text-2xl font-bold mt-1">{pageSize}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Active Filters</div>
          <div className="text-2xl font-bold mt-1">{activeFilterCount}</div>
        </Card>
      </div>

      {/* Upload Zone */}
      {showUpload && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Bulk Upload</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowUpload(false)}>
              Close
            </Button>
          </div>
          <UploadZone
            onUploadComplete={(result) => {
              setShowUpload(false);
              loadTransactions(); // Reload transactions after upload
            }}
          />
        </div>
      )}

      {/* Filter Button */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setShowFilters(true)}>
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-primary text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {/* Pagination Controls */}
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

      {/* Transaction Table */}
      <TransactionTable transactions={transactions} loading={loading} />

      {/* Filter Panel */}
      <FilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />
    </div>
    </DashboardLayout>
  );
}

