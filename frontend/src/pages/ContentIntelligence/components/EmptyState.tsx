import React from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Database, UploadCloud } from 'lucide-react';

interface EmptyStateProps {
  onOpenWizard: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onOpenWizard }) => {
  return (
    <Card className="border-border border-dashed bg-transparent mt-8">
      <CardContent className="flex flex-col items-center justify-center p-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-6 shadow-sm">
          <Database className="w-8 h-8 text-primary" />
        </div>

        <h3 className="text-xl font-semibold text-text-primary mb-2">Build Your AI Knowledge Base</h3>
        <p className="text-text-secondary max-w-md mx-auto mb-8">
          Your AI needs context to generate high-quality content. Upload your existing documents, past posts, or website URLs to teach the AI about your brand's unique voice and expertise.
        </p>

        <div className="flex gap-4 items-center">
          <Button variant="outline" className="gap-2" onClick={onOpenWizard}>
            <UploadCloud className="w-4 h-4" /> Select a source
          </Button>
        </div>
        
        <div className="mt-10 flex items-center justify-center gap-6 text-sm text-text-muted">
          <span>✓ Supports PDF & DOCX</span>
          <span>✓ Scrape any public URL</span>
          <span>✓ Import LinkedIn archives</span>
        </div>
      </CardContent>
    </Card>
  );
};
