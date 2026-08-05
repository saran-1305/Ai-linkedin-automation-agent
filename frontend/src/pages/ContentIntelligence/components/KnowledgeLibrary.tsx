import React from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { FileText, Trash2, Eye, MoreVertical } from 'lucide-react';
import type { ContentImportData } from '../../../services/contentImportService';

interface KnowledgeLibraryProps {
  imports: ContentImportData[];
  onDelete: (id: number) => void;
  onPreview?: (id: number) => void;
}

export const KnowledgeLibrary: React.FC<KnowledgeLibraryProps> = ({ imports, onDelete, onPreview }) => {
  return (
    <Card className="border-border bg-surface">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Knowledge Library</h2>
          <p className="text-sm text-text-secondary mt-1">Manage imported documents and their analysis status.</p>
        </div>
      </div>
      <CardContent className="p-0">
        {imports.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-sm">
            No knowledge imported yet. Select a source above to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-secondary uppercase bg-background/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Document Source</th>
                  <th className="px-6 py-4 font-medium">Size / Words</th>
                  <th className="px-6 py-4 font-medium">Processing Status</th>
                  <th className="px-6 py-4 font-medium">AI Analysis</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {imports.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-background border border-border rounded-lg">
                          <FileText className="w-4 h-4 text-text-muted" />
                        </div>
                        <div>
                          <div className="font-medium text-text-primary">Import #{item.id}</div>
                          <div className="text-xs text-text-secondary">{item.source} • {new Date(item.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {item.word_count ? `${item.word_count} words` : `${(item.size / 1024).toFixed(1)} KB`}
                    </td>
                    <td className="px-6 py-4">
                      {/* @ts-ignore */}
                      <StatusBadge status={item.status} showIcon={false} />
                    </td>
                    <td className="px-6 py-4">
                      {/* @ts-ignore */}
                      <StatusBadge status={item.analysis_status || 'pending'} showIcon={false} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onPreview && (
                          <button 
                            onClick={() => onPreview(item.id)}
                            className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Preview Analysis"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => onDelete(item.id)}
                          className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                          title="Delete Import"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
