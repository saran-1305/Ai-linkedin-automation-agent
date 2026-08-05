import React from 'react';
import type { ActivityEvent } from '../../../../services/api/analyticsDashboardApi';
import { Share2, Edit3, MessageSquare, PlusCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';

interface Props {
  activities: ActivityEvent[];
}

const ActivityTimeline: React.FC<Props> = ({ activities }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'published': return <Share2 className="w-4 h-4 text-success" />;
      case 'scheduled': return <Edit3 className="w-4 h-4 text-warning" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-info" />;
      case 'created': return <PlusCircle className="w-4 h-4 text-primary" />;
      default: return <AlertCircle className="w-4 h-4 text-text-muted" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'published': return 'bg-success/10 border-success/20 text-success';
      case 'scheduled': return 'bg-warning/10 border-warning/20 text-warning';
      case 'comment': return 'bg-info/10 border-info/20 text-info';
      case 'created': return 'bg-primary/10 border-primary/20 text-primary';
      default: return 'bg-background border-border text-text-muted';
    }
  };

  return (
    <Card className="border-border bg-surface h-[400px] flex flex-col">
      <CardHeader className="pb-2 border-b border-border">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {activities.length > 0 ? (
          <div className="relative border-l-2 border-border ml-3 space-y-6">
            {activities.map((act) => (
              <div key={act.id} className="relative pl-6">
                {/* Timeline Dot */}
                <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-2 bg-surface shadow-sm flex items-center justify-center ${getBg(act.event_type)}`}>
                   <div className="w-1.5 h-1.5 rounded-full bg-current" />
                </div>

                <div className="bg-background border border-border p-3.5 rounded-xl hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-bold text-text-primary flex items-center gap-2">
                       {getIcon(act.event_type)}
                       <span className="capitalize">{act.event_type}</span>
                    </span>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      {new Date(act.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1.5 font-medium leading-relaxed capitalize">
                    {act.platform} &middot; {act.status}{act.errors ? ` — ${act.errors}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-text-muted font-medium text-sm">
            No recent activity found.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityTimeline;
