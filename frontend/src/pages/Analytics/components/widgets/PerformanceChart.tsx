import React from 'react';
import type { EngagementTrend } from '../../../../services/api/analyticsDashboardApi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';

interface Props {
  trends: EngagementTrend[];
}

const PerformanceChart: React.FC<Props> = ({ trends }) => {
  return (
    <Card className="border-border bg-surface h-[400px] flex flex-col">
      <CardHeader className="pb-2 border-b border-border mb-4">
        <CardTitle className="text-lg">Performance Over Time</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 min-h-0 relative w-full h-full pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="var(--color-text-muted)" 
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} 
              tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="var(--color-text-muted)" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              itemStyle={{ color: 'var(--color-text-primary)' }}
              labelStyle={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Area type="monotone" dataKey="impressions" name="Impressions" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorImpressions)" />
            <Area type="monotone" dataKey="engagement" name="Engagement" stroke="var(--color-success)" strokeWidth={3} fillOpacity={1} fill="url(#colorEngagement)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
