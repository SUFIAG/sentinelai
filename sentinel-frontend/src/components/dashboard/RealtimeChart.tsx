'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartData {
  name: string;
  [key: string]: string | number;
}

interface RealtimeChartProps {
  title: string;
  data: ChartData[];
  dataKeys: { key: string; color: string; label: string }[];
  type?: 'line' | 'area' | 'bar';
  height?: number;
}

export function RealtimeChart({
  title,
  data,
  dataKeys,
  type = 'area',
  height = 300,
}: RealtimeChartProps) {
  const ChartComponent = type === 'line' ? LineChart : type === 'bar' ? BarChart : AreaChart;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-background/95 backdrop-blur-sm border border-primary/20 rounded-lg p-3 shadow-xl">
        <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <ChartComponent data={data}>
            <defs>
              {dataKeys.map((dk) => (
                <linearGradient key={dk.key} id={`gradient-${dk.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={dk.color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={dk.color} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary) / 0.1)" />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
            {dataKeys.map((dk) => {
              if (type === 'line') {
                return (
                  <Line
                    key={dk.key}
                    type="monotone"
                    dataKey={dk.key}
                    name={dk.label}
                    stroke={dk.color}
                    strokeWidth={2}
                    dot={false}
                  />
                );
              } else if (type === 'bar') {
                return (
                  <Bar
                    key={dk.key}
                    dataKey={dk.key}
                    name={dk.label}
                    fill={dk.color}
                    radius={[4, 4, 0, 0]}
                  />
                );
              } else {
                return (
                  <Area
                    key={dk.key}
                    type="monotone"
                    dataKey={dk.key}
                    name={dk.label}
                    stroke={dk.color}
                    fill={`url(#gradient-${dk.key})`}
                    strokeWidth={2}
                  />
                );
              }
            })}
          </ChartComponent>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

