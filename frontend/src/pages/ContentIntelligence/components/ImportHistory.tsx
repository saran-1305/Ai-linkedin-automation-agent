import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { type ContentImportData } from '../../../services/contentImportService';
import { Eye, Trash2, RefreshCw, BarChart2 } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { ViewContentModal } from './ViewContentModal';
import { AnalysisModal } from './AnalysisModal';

interface ImportHistoryProps {
  imports: ContentImportData[];
  onDelete: (id: number) => void;
  onOpenWizard: () => void;
}

export const ImportHistory: React.FC<ImportHistoryProps> = ({ imports, onDelete, onOpenWizard }) => {
  const [selectedItem, setSelectedItem] = useState<ContentImportData | null>(null);
  const [analysisItem, setAnalysisItem] = useState<ContentImportData | null>(null);

  if (imports.length === 0) {
    return <EmptyState onOpenWizard={onOpenWizard} />;
  }

  return (
    <>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>Track all files and URLs imported into your brand memory.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-muted uppercase border-b border-border bg-surface">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Language</th>
                  <th className="px-4 py-3 font-medium">Words</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Analysis</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {imports.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-surface-hover/50 transition-colors">
                    <td className="px-4 py-4 text-text-secondary whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-4 py-4 font-medium text-text-primary">
                      {item.source}
                    </td>
                    <td className="px-4 py-4 text-text-secondary uppercase">
                      {item.language || '-'}
                    </td>
                    <td className="px-4 py-4 text-text-secondary">
                      {item.word_count ? item.word_count.toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={item.status as any}>{item.status}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={item.analysis_status === 'Analyzed' ? 'success' : item.analysis_status === 'Failed' ? 'danger' : 'warning'}>
                        {item.analysis_status || 'Pending'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 flex justify-end gap-2">
                      {item.status === 'Failed' && (
                        <Button variant="ghost" className="h-8 w-8 p-0" title="Retry">
                          <RefreshCw className="w-4 h-4 text-text-muted hover:text-text-primary" />
                        </Button>
                      )}
                      {item.analysis_status === 'Analyzed' && (
                        <Button variant="ghost" className="h-8 w-8 p-0" title="View Analysis" onClick={() => setAnalysisItem(item)}>
                          <BarChart2 className="w-4 h-4 text-purple-400 hover:text-purple-300" />
                        </Button>
                      )}
                      <Button variant="ghost" className="h-8 w-8 p-0" title="View Document" onClick={() => setSelectedItem(item)}>
                        <Eye className="w-4 h-4 text-text-muted hover:text-info" />
                      </Button>
                      <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => onDelete(item.id)} title="Delete">
                        <Trash2 className="w-4 h-4 text-text-muted hover:text-danger" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <ViewContentModal 
        isOpen={selectedItem !== null} 
        onClose={() => setSelectedItem(null)} 
        importItem={selectedItem} 
      />

      <AnalysisModal
        isOpen={analysisItem !== null}
        onClose={() => setAnalysisItem(null)}
        documentId={analysisItem?.id || 0}
      />
    </>
  );
};
