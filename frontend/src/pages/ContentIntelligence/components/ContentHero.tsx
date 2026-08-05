import React from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Database, FileText, CheckCircle2, RefreshCw } from 'lucide-react';
import type { ContentImportData } from '../../../services/contentImportService';

interface ContentHeroProps {
  imports: ContentImportData[];
  isProcessing: boolean;
}

export const ContentHero: React.FC<ContentHeroProps> = ({ imports, isProcessing }) => {
  const completedImports = imports.filter(i => i.status === 'completed').length;
  
  return (
    <Card className="border-border bg-surface overflow-hidden">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="text-sm font-medium text-text-secondary mb-2 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4" /> Knowledge Hub
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-1">Content Intelligence</h1>
            <p className="text-text-secondary">Teach your AI using your existing content.</p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="bg-background border border-border rounded-lg p-3 flex flex-col gap-1 min-w-[140px]">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <FileText className="w-3.5 h-3.5" /> Knowledge Imported
              </div>
              <div className="text-sm font-semibold text-text-primary">{imports.length} Documents</div>
            </div>
            
            <div className="bg-background border border-border rounded-lg p-3 flex flex-col gap-1 min-w-[140px]">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <CheckCircle2 className="w-3.5 h-3.5" /> AI Readiness
              </div>
              <div className="text-sm font-semibold text-emerald-500">
                {imports.length > 0 ? 'Ready' : 'Waiting for Data'}
              </div>
            </div>

            <div className="bg-background border border-border rounded-lg p-3 flex flex-col gap-1 min-w-[140px]">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <RefreshCw className="w-3.5 h-3.5" /> Processing Status
              </div>
              <StatusBadge status={isProcessing ? 'Running' : 'Completed'} showIcon={false} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
