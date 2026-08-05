import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { contentImportService, type ContentImportData } from '../../../services/contentImportService';

interface ViewContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  importItem: ContentImportData | null;
}

export const ViewContentModal: React.FC<ViewContentModalProps> = ({ isOpen, onClose, importItem }) => {
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && importItem) {
      setIsLoading(true);
      contentImportService.getImportDetails(importItem.id)
        .then(res => setPreviewText(res.preview_text))
        .catch(err => console.error(err))
        .finally(() => setIsLoading(false));
    } else {
      setPreviewText(null);
    }
  }, [isOpen, importItem]);

  if (!isOpen || !importItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden border-border shadow-2xl flex flex-col">
        <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between shrink-0">
          <CardTitle>View Content</CardTitle>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">&times;</button>
        </CardHeader>
        <CardContent className="p-6 overflow-y-auto space-y-6 flex-1">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface rounded-lg p-4 border border-border">
              <p className="text-xs text-text-muted uppercase font-semibold mb-1">Source</p>
              <p className="text-sm font-medium">{importItem.source}</p>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-border">
              <p className="text-xs text-text-muted uppercase font-semibold mb-1">Status</p>
              <Badge variant={importItem.status as any}>{importItem.status}</Badge>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-border">
              <p className="text-xs text-text-muted uppercase font-semibold mb-1">Language</p>
              <p className="text-sm font-medium uppercase">{importItem.language || 'N/A'}</p>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-border">
              <p className="text-xs text-text-muted uppercase font-semibold mb-1">Word Count</p>
              <p className="text-sm font-medium">{importItem.word_count?.toLocaleString() || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold border-b border-border pb-2">Content Preview</h3>
            {importItem.status === 'Extracting' || importItem.status === 'Pending' ? (
              <p className="text-sm text-text-muted italic">Content is currently being processed...</p>
            ) : importItem.status === 'Failed' ? (
              <p className="text-sm text-danger">{importItem.processing_error || 'Processing failed.'}</p>
            ) : isLoading ? (
              <p className="text-sm text-text-muted italic">Loading preview...</p>
            ) : (
              <div className="bg-surface border border-border rounded-md p-4 max-h-[300px] overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap font-mono text-text-secondary leading-relaxed">
                  {previewText || "No content extracted yet."}
                </p>
              </div>
            )}
          </div>
          
        </CardContent>
        <div className="p-4 border-t border-border flex justify-end shrink-0">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </Card>
    </div>
  );
};
