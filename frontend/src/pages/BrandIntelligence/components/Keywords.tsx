import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Hash } from 'lucide-react';

interface KeywordsProps {
  keywords: any[];
}

export const Keywords: React.FC<KeywordsProps> = ({ keywords }) => {
  return (
    <Card className="border-border bg-surface h-full">
      <CardHeader className="pb-4 border-b border-border">
        <CardTitle className="text-lg flex items-center gap-2">
          <Hash className="w-5 h-5 text-primary" /> Core Keywords
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-2">
          {keywords && keywords.length > 0 ? (
            keywords.slice(0, 15).map((kw, idx) => (
              <span 
                key={idx} 
                className="px-3 py-1.5 bg-background border border-border hover:border-primary/50 transition-colors rounded-lg text-sm text-text-secondary font-medium cursor-default"
              >
                {kw.keyword || kw.name}
              </span>
            ))
          ) : (
            <span className="text-sm text-text-muted italic">No keywords extracted yet.</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
