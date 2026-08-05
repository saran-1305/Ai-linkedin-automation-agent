import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { BarChart3, Building2, Target, CalendarDays, Share2, Users } from 'lucide-react';

export const WorkspaceInsights: React.FC = () => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4 border-b border-border">
        <CardTitle className="text-sm font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Workspace Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        
        <div className="flex items-center justify-between group cursor-pointer hover:bg-surface-hover p-2 -mx-2 rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-text-primary">Brand Profile</div>
              <div className="text-xs text-text-muted">Last updated 2 days ago</div>
            </div>
          </div>
          <div className="text-sm font-bold text-success">100%</div>
        </div>

        <div className="flex items-center justify-between group cursor-pointer hover:bg-surface-hover p-2 -mx-2 rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-text-primary">Monitored Competitors</div>
              <div className="text-xs text-text-muted">Active analysis running</div>
            </div>
          </div>
          <div className="text-sm font-bold text-text-primary">3 Profiles</div>
        </div>

        <div className="flex items-center justify-between group cursor-pointer hover:bg-surface-hover p-2 -mx-2 rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-text-primary">Weekly Plan</div>
              <div className="text-xs text-text-muted">Current week drafted</div>
            </div>
          </div>
          <div className="text-sm font-bold text-amber-500">Pending</div>
        </div>
        
        <div className="flex items-center justify-between group cursor-pointer hover:bg-surface-hover p-2 -mx-2 rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-text-primary">Publishing Queue</div>
              <div className="text-xs text-text-muted">Awaiting generation</div>
            </div>
          </div>
          <div className="text-sm font-bold text-text-primary">0 Posts</div>
        </div>

      </CardContent>
    </Card>
  );
};
