import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Database, FileText, Globe, CheckCircle2 } from 'lucide-react';
import { contentImportService } from '../../../services/contentImportService';
import type { ContentImportData } from '../../../services/contentImportService';

export const KnowledgeSources: React.FC = () => {
  const [imports, setImports] = useState<ContentImportData[]>([]);

  useEffect(() => {
    contentImportService.getImports().then(data => setImports(data)).catch(console.error);
  }, []);

  return (
    <Card className="border-border bg-surface h-full">
      <CardHeader className="pb-4 border-b border-border">
        <CardTitle className="text-lg flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" /> Knowledge Sources
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          <div className="p-4 flex items-center justify-between hover:bg-surface-hover transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background border border-border rounded-lg">
                <Globe className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-primary">Business Profile</h4>
                <p className="text-xs text-text-secondary">Core business identity & goals</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
              <CheckCircle2 className="w-3 h-3" /> Active
            </div>
          </div>

          {imports.slice(0, 4).map(imp => (
            <div key={imp.id} className="p-4 flex items-center justify-between hover:bg-surface-hover transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background border border-border rounded-lg">
                  <FileText className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-text-primary">{imp.source} Import</h4>
                  <p className="text-xs text-text-secondary">
                    {imp.word_count ? `${imp.word_count} words` : `${(imp.size / 1024).toFixed(1)} KB`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Extracted
              </div>
            </div>
          ))}

          {imports.length === 0 && (
            <div className="p-6 text-center text-sm text-text-muted">
              No additional knowledge documents imported yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
