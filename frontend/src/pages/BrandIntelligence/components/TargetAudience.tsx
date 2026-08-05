import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Users } from 'lucide-react';

interface TargetAudienceProps {
  audiences: any[];
}

export const TargetAudience: React.FC<TargetAudienceProps> = ({ audiences }) => {
  return (
    <Card className="border-border bg-surface h-full">
      <CardHeader className="pb-4 border-b border-border">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" /> Target Audience
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {audiences && audiences.length > 0 ? (
          <div className="space-y-4">
            {audiences.slice(0, 4).map((aud, idx) => (
              <div key={idx} className="p-3 bg-background border border-border rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-medium text-text-primary">{aud.segment}</h4>
                  <span className="text-xs font-semibold text-emerald-500">{Math.round(aud.confidence * 100)}%</span>
                </div>
                <div className="text-xs text-text-secondary capitalize">{aud.type || 'Audience Persona'}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-text-muted italic py-4">No audiences identified yet.</div>
        )}
      </CardContent>
    </Card>
  );
};
