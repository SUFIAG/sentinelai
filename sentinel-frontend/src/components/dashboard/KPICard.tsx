'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function KPICard({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  loading = false,
  className,
}: KPICardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  const trendColor =
    trend === 'up'
      ? 'text-green-400'
      : trend === 'down'
      ? 'text-red-400'
      : 'text-gray-400';

  if (loading) {
    return (
      <Card className={cn('p-6 animate-pulse', className)}>
        <div className="h-4 bg-primary/10 rounded w-1/2 mb-4" />
        <div className="h-8 bg-primary/10 rounded w-3/4 mb-2" />
        <div className="h-3 bg-primary/10 rounded w-1/3" />
      </Card>
    );
  }

  return (
    <Card className={cn('p-6 relative overflow-hidden group', className)}>
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon && (
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {value}
          </h3>

          {change !== undefined && (
            <div className="flex items-center gap-1">
              <TrendIcon className={cn('w-4 h-4', trendColor)} />
              <span className={cn('text-sm font-semibold', trendColor)}>
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last period</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

