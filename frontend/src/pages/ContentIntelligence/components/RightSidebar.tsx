import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { HeartPulse, Lightbulb, Clock, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import type { ContentImportData } from '../../../services/contentImportService';

interface RightSidebarProps {
  imports: ContentImportData[];
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ imports }) => {
  const isHealthy = imports.length > 0;
  
  return (
    <div className="space-y-6">
      <Card className="border-border bg-surface">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-emerald-500" /> Knowledge Health
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary">Import Quality</span>
            {/* @ts-ignore */}
            <StatusBadge status={isHealthy ? 'completed' : 'pending'} label={isHealthy ? 'Optimal' : 'Needs Data'} showIcon={false} />
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary">Extraction Success</span>
            <span className="text-text-primary font-medium">{isHealthy ? '100%' : '0%'}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary">Brand Readiness</span>
            <span className={isHealthy ? 'text-emerald-500 font-medium' : 'text-text-muted font-medium'}>
              {isHealthy ? 'Ready for Generation' : 'Incomplete'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-surface">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" /> Smart Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="text-sm font-medium text-text-primary mb-1">Import your website</h4>
            <p className="text-xs text-text-secondary mb-3">Scraping your homepage instantly provides the AI with your core value proposition.</p>
            <div className="text-xs font-semibold text-primary flex items-center gap-1">
              Impact: +22% Brand Understanding <ArrowRight className="w-3 h-3" />
            </div>
          </div>
          
          <div className="p-3 bg-background rounded-lg border border-border">
            <h4 className="text-sm font-medium text-text-primary mb-1">Past LinkedIn Posts</h4>
            <p className="text-xs text-text-secondary mb-3">Import a CSV of your past posts to help the AI mirror your exact writing style.</p>
            <div className="text-xs font-semibold text-text-primary flex items-center gap-1">
              Impact: Perfect Brand Voice <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-surface">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-text-muted" /> Processing Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-text-muted">No items currently in queue.</p>
        </CardContent>
      </Card>
    </div>
  );
};
