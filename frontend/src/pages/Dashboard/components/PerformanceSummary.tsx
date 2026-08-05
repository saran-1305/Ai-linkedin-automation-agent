import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { TrendingUp, FileText, Share2, BrainCircuit } from 'lucide-react';

const metrics = [
  { name: 'Content Imported', value: '450', trend: '+12%', trendUp: true, icon: FileText },
  { name: 'Strategies Generated', value: '12', trend: '+2', trendUp: true, icon: BrainCircuit },
  { name: 'Content Generated', value: '34', trend: '+18%', trendUp: true, icon: FileText },
  { name: 'Published Posts', value: '8', trend: '-1', trendUp: false, icon: Share2 },
];

export const PerformanceSummary: React.FC = () => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4 border-b border-border">
        <CardTitle className="text-sm font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Platform Usage
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-4">
          {metrics.map(metric => (
            <div key={metric.name} className="bg-surface border border-border rounded-lg p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <metric.icon className="w-4 h-4 text-text-muted" />
                <span className={`text-xs font-bold ${metric.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {metric.trend}
                </span>
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary mb-0.5">{metric.value}</div>
                <div className="text-xs text-text-secondary">{metric.name}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
