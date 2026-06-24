'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
  sparklineData?: Array<{ value: number }>;
}

export function KPICard({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  loading = false,
  className,
  sparklineData,
}: KPICardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  const trendColor =
    trend === 'up'
      ? 'text-[#8CC63E]'
      : trend === 'down'
      ? 'text-red-400'
      : 'text-gray-400';

  const sparklineColor = trend === 'up' ? '#8CC63E' : trend === 'down' ? '#EF4444' : '#6B7280';

  if (loading) {
    return (
      <Card className={cn('p-6 animate-pulse glass', className)}>
        <div className="h-4 bg-[#8CC63E]/10 rounded w-1/2 mb-4" />
        <div className="h-8 bg-[#8CC63E]/10 rounded w-3/4 mb-2" />
        <div className="h-3 bg-[#8CC63E]/10 rounded w-1/3" />
      </Card>
    );
  }

  return (
    <Card className={cn('p-6 relative overflow-hidden group glass hover:border-[#8CC63E]/30 transition-all duration-300', className)}>
      {/* Background glow effect */}
      <div className="absolute inset-0 glow-card opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon && (
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#8CC63E]/20 to-[#0B4F7A]/20 text-[#8CC63E] group-hover:scale-110 transition-transform">
              {icon}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-3xl font-bold text-gradient animate-count">
            {value}
          </h3>

          <div className="flex items-center justify-between">
            {change !== undefined && (
              <div className="flex items-center gap-1">
                <TrendIcon className={cn('w-4 h-4', trendColor)} />
                <span className={cn('text-sm font-semibold', trendColor)}>
                  {Math.abs(change)}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">vs last</span>
              </div>
            )}

            {/* Sparkline */}
            {sparklineData && sparklineData.length > 0 && (
              <div className="w-24 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={sparklineColor}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}



