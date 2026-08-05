import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Mic2, Zap } from 'lucide-react';

interface BrandVoiceProps {
  voice: any[];
  personality: any[];
}

export const BrandVoice: React.FC<BrandVoiceProps> = ({ voice, personality }) => {
  return (
    <Card className="border-border bg-surface h-full">
      <CardHeader className="pb-4 border-b border-border">
        <CardTitle className="text-lg flex items-center gap-2">
          <Mic2 className="w-5 h-5 text-primary" /> Brand Voice & Personality
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Tone of Voice</h4>
          <div className="flex flex-wrap gap-2">
            {voice && voice.length > 0 ? (
              voice.slice(0, 5).map((v, i) => (
                <span key={i} className="px-3 py-1.5 bg-background border border-border rounded-md text-sm text-text-primary flex items-center gap-2">
                  {v.characteristic} <span className="text-xs text-emerald-500">{Math.round(v.confidence * 100)}%</span>
                </span>
              ))
            ) : (
              <span className="text-sm text-text-muted italic">No voice data</span>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Personality Traits</h4>
          <div className="flex flex-wrap gap-2">
            {personality && personality.length > 0 ? (
              personality.slice(0, 5).map((p, i) => (
                <span key={i} className="px-3 py-1.5 bg-background border border-border rounded-md text-sm text-text-secondary flex items-center gap-2">
                  <Zap className="w-3 h-3 text-amber-500" /> {p.trait}
                </span>
              ))
            ) : (
              <span className="text-sm text-text-muted italic">No personality data</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
