import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { History, GitCommit } from 'lucide-react';

interface VersionHistoryProps {
  versions: any[];
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({ versions }) => {
  return (
    <Card className="border-border bg-surface h-full">
      <CardHeader className="pb-4 border-b border-border">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="w-5 h-5 text-primary" /> Version History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {versions && versions.length > 0 ? (
            versions.slice(0, 3).map((v, idx) => (
              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-surface bg-primary text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl border border-border bg-background shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-text-primary flex items-center gap-1">
                      <GitCommit className="w-3 h-3 text-text-muted" /> v{v.version}
                    </h4>
                    <span className="text-xs text-text-muted">{new Date(v.generated_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Aggregated from {v.document_count} knowledge sources.
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-text-muted py-4">
              No versions generated yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
