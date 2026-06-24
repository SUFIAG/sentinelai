'use client';

import React, { useState } from 'react';
import { X, Filter, Calendar, DollarSign, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { TransactionFilters } from '@/lib/api/transactions';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: TransactionFilters;
  onApplyFilters: (filters: TransactionFilters) => void;
  onResetFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({});
    onResetFilters();
    onClose();
  };

  const updateFilter = (key: keyof TransactionFilters, value: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-background border-l border-border z-50 shadow-2xl overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Filter Transactions</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Transaction ID, User ID, Merchant..."
                  value={localFilters.search || ''}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={localFilters.status || ''}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CLEARED">Cleared</option>
                <option value="FLAGGED">Flagged</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>

            {/* Risk Level */}
            <div className="space-y-2">
              <Label>Risk Level</Label>
              <select
                value={localFilters.riskLevel || ''}
                onChange={(e) => updateFilter('riskLevel', e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Levels</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date Range
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="date"
                    value={localFilters.startDate || ''}
                    onChange={(e) => updateFilter('startDate', e.target.value)}
                    placeholder="Start Date"
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    value={localFilters.endDate || ''}
                    onChange={(e) => updateFilter('endDate', e.target.value)}
                    placeholder="End Date"
                  />
                </div>
              </div>
            </div>

            {/* Amount Range */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Amount Range
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="number"
                    value={localFilters.minAmount || ''}
                    onChange={(e) =>
                      updateFilter('minAmount', parseFloat(e.target.value) || undefined)
                    }
                    placeholder="Min"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    value={localFilters.maxAmount || ''}
                    onChange={(e) =>
                      updateFilter('maxAmount', parseFloat(e.target.value) || undefined)
                    }
                    placeholder="Max"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* User ID */}
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input
                type="text"
                value={localFilters.userId || ''}
                onChange={(e) => updateFilter('userId', e.target.value)}
                placeholder="Enter user ID"
              />
            </div>

            {/* Merchant ID */}
            <div className="space-y-2">
              <Label>Merchant ID</Label>
              <Input
                type="text"
                value={localFilters.merchantId || ''}
                onChange={(e) => updateFilter('merchantId', e.target.value)}
                placeholder="Enter merchant ID"
              />
            </div>
          </div>

          {/* Active Filters Count */}
          {Object.keys(localFilters).filter((k) => localFilters[k as keyof TransactionFilters]).length > 0 && (
            <Card className="p-3 bg-primary/10 border-primary/30">
              <p className="text-sm text-primary">
                {Object.keys(localFilters).filter((k) => localFilters[k as keyof TransactionFilters]).length} filter(s) active
              </p>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Reset All
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

