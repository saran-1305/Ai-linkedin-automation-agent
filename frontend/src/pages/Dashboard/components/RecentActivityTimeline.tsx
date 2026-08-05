import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Clock, Send, PenTool, Database } from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';

const activities = [
  { id: 1, time: '10:24', module: 'Publishing', action: 'LinkedIn Connected', status: 'Completed' as const, icon: Send },
  { id: 2, time: '10:10', module: 'Generator', action: 'Generated 3 Posts', status: 'Completed' as const, icon: PenTool },
  { id: 3, time: '09:58', module: 'Analytics', action: 'Collection Started', status: 'Running' as const, icon: Database },
];

export const RecentActivityTimeline: React.FC = () => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4 border-b border-border">
        <CardTitle className="text-sm font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4" /> Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 relative">
        <div className="absolute left-10 top-6 bottom-6 w-px bg-border/60 z-0"></div>
        <div className="space-y-6 relative z-10">
          {activities.map(activity => (
            <div key={activity.id} className="flex gap-4">
              <div className="w-12 text-xs font-medium text-text-muted pt-1 shrink-0 text-right">{activity.time}</div>
              <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center shrink-0 z-10 text-text-secondary shadow-sm">
                <activity.icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 pt-0.5">
                <div className="flex justify-between items-start mb-1">
                  <div className="text-sm font-semibold text-text-primary">{activity.action}</div>
                  <StatusBadge status={activity.status} showIcon={false} />
                </div>
                <div className="text-xs text-text-muted">{activity.module} Module</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
