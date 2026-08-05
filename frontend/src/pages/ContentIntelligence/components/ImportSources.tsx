import React from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { FileUp, Globe, Type, Table2, FileCode2 } from 'lucide-react';

interface ImportSourcesProps {
  onSelectSource: (source: string) => void;
}

export const ImportSources: React.FC<ImportSourcesProps> = ({ onSelectSource }) => {
  const sources = [
    { id: 'PDF', title: 'Upload Files', icon: FileUp, description: 'PDF, DOCX formats', color: 'text-blue-500' },
    { id: 'Website URL', title: 'Website URL', icon: Globe, description: 'Scrape a public URL', color: 'text-emerald-500' },
    { id: 'Paste Text', title: 'Paste Text', icon: Type, description: 'Directly paste content', color: 'text-purple-500' },
    { id: 'CSV', title: 'Import CSV', icon: Table2, description: 'Bulk data & posts', color: 'text-yellow-500' },
    { id: 'Markdown', title: 'Import Markdown', icon: FileCode2, description: 'Structured text files', color: 'text-pink-500' }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">Import Sources</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {sources.map((source) => (
          <Card 
            key={source.id} 
            className="border-border bg-surface hover:bg-surface-hover hover:border-primary/50 cursor-pointer transition-all duration-200 group"
            onClick={() => onSelectSource(source.id)}
          >
            <CardContent className="p-5 flex flex-col items-center text-center gap-3">
              <div className="p-3 rounded-full bg-background border border-border group-hover:border-primary/30 transition-colors">
                <source.icon className={`w-6 h-6 ${source.color}`} />
              </div>
              <div>
                <h3 className="font-medium text-text-primary text-sm">{source.title}</h3>
                <p className="text-xs text-text-muted mt-1">{source.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
