import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { MessageSquareText } from 'lucide-react';

interface MessagingFrameworkProps {
  storytelling: any[];
  ctaPatterns: any[];
}

export const MessagingFramework: React.FC<MessagingFrameworkProps> = ({ storytelling, ctaPatterns }) => {
  return (
    <Card className="border-border bg-surface h-full">
      <CardHeader className="pb-4 border-b border-border">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquareText className="w-5 h-5 text-primary" /> Messaging Framework
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Storytelling Patterns</h4>
          <ul className="space-y-3">
            {storytelling && storytelling.length > 0 ? (
              storytelling.slice(0, 3).map((pattern, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span className="leading-relaxed">{pattern.pattern_name}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-text-muted italic">No patterns detected</li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Call-to-Action Style</h4>
          <ul className="space-y-2">
            {ctaPatterns && ctaPatterns.length > 0 ? (
              ctaPatterns.slice(0, 4).map((cta, idx) => (
                <li key={idx} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary font-medium flex items-center justify-between">
                  {cta.cta_text}
                  <span className="text-xs text-text-muted">{cta.frequency}x</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-text-muted italic">No CTA data</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
