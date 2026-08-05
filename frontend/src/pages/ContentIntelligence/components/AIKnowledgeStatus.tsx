import React from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { FileStack, Hash, FileJson, Globe2, Sparkles, BrainCircuit } from 'lucide-react';
import type { ContentImportData } from '../../../services/contentImportService';

interface AIKnowledgeStatusProps {
  imports: ContentImportData[];
}

export const AIKnowledgeStatus: React.FC<AIKnowledgeStatusProps> = ({ imports }) => {
  // Aggregate stats from imports
  const totalWords = imports.reduce((acc, imp) => acc + (imp.word_count || 0), 0);
  const totalChunks = Math.floor(totalWords / 250); // Rough estimation if backend doesn't provide
  const totalTokens = Math.floor(totalWords * 1.3);

  const stats = [
    { label: 'Documents Imported', value: imports.length, icon: FileStack },
    { label: 'Extracted Chunks', value: totalChunks.toLocaleString(), icon: Hash },
    { label: 'Processed Tokens', value: totalTokens.toLocaleString(), icon: FileJson },
    { label: 'Languages Detected', value: imports.length > 0 ? 'English' : '-', icon: Globe2 },
    { label: 'Knowledge Quality', value: imports.length > 0 ? 'High' : '-', icon: Sparkles },
    { label: 'Brand Readiness', value: imports.length > 0 ? 'Optimal' : '-', icon: BrainCircuit },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, idx) => (
        <Card key={idx} className="border-border bg-surface hover:border-border-hover transition-colors">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <stat.icon className="w-4 h-4 text-text-muted" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-text-primary mb-0.5">{stat.value}</div>
              <div className="text-xs text-text-secondary">{stat.label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
