import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Activity, Server, Database, Globe, Calendar as CalendarIcon, Cpu } from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';

const healthItems = [
  { name: 'LinkedIn Connection', icon: Globe, status: 'Healthy' as const },
  { name: 'X Connection', icon: Globe, status: 'Disconnected' as const },
  { name: 'LLM Provider (Groq)', icon: Cpu, status: 'Healthy' as const },
  { name: 'Task Scheduler', icon: CalendarIcon, status: 'Running' as const },
  { name: 'Database', icon: Database, status: 'Healthy' as const },
  { name: 'Background Workers', icon: Server, status: 'Healthy' as const },
];

export const AISystemHealth: React.FC = () => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4 border-b border-border">
        <CardTitle className="text-sm font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4" /> Operational Health
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {healthItems.map(item => (
            <div key={item.name} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="text-text-muted"><item.icon className="w-4 h-4" /></div>
                <span className="text-sm font-medium text-text-secondary">{item.name}</span>
              </div>
              <StatusBadge status={item.status} showIcon={true} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
