import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { LayoutGrid } from 'lucide-react';

interface ContentPillarsProps {
  pillars: any[];
}

export const ContentPillars: React.FC<ContentPillarsProps> = ({ pillars }) => {
  return (
    <Card className="border-border bg-surface h-full">
      <CardHeader className="pb-4 border-b border-border">
        <CardTitle className="text-lg flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-primary" /> Content Pillars
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {pillars && pillars.length > 0 ? (
            pillars.slice(0, 6).map((pillar, idx) => (
              <div key={idx} className="p-4 bg-background border border-border rounded-xl flex flex-col gap-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 bg-primary/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
                <h4 className="font-semibold text-text-primary relative z-10">{pillar.name || pillar.pillar_name}</h4>
                <div className="flex items-center justify-between mt-auto relative z-10">
                  <span className="text-xs text-text-secondary capitalize">{pillar.type || pillar.pillar_type || 'Core Theme'}</span>
                  {pillar.confidence && (
                    <span className="text-xs font-semibold text-emerald-500">{Math.round(pillar.confidence * 100)}%</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-sm text-text-muted italic py-4">No content pillars extracted yet.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
