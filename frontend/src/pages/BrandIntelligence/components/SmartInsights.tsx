import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Sparkles, ArrowRight } from 'lucide-react';

interface SmartInsightsProps {
  profile: any;
  voice?: any[];
  audiences?: any[];
}

export const SmartInsights: React.FC<SmartInsightsProps> = ({ profile, voice = [], audiences = [] }) => {
  // Generate dynamic insights locally based on existing data
  const topTones = voice.slice(0, 2).map(v => v.characteristic);
  const toneText = topTones.length > 0 
    ? `Your aggregated content highly indexes for "${topTones.join('" and "')}" tones.` 
    : 'Not enough data to determine your primary brand tones yet.';
    
  const topAudience = audiences.length > 0 ? audiences[0].segment : null;
  const audienceText = topAudience 
    ? `The AI has strongly identified "${topAudience}" as a key demographic in your content.`
    : 'Not enough data to identify your primary audience demographic yet.';

  return (
    <Card className="border-border bg-surface h-full">
      <CardHeader className="pb-4 border-b border-border">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" /> Smart AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 hover:border-amber-500/40 transition-colors">
          <h4 className="text-sm font-semibold text-text-primary mb-1">Brand Tone Analysis</h4>
          <p className="text-xs text-text-secondary leading-relaxed mb-3">
            {toneText} The AI recommends introducing more conversational elements for LinkedIn publishing.
          </p>
          <button className="text-xs font-semibold text-amber-500 flex items-center gap-1 hover:text-amber-400 transition-colors">
            Adjust Strategy <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-colors">
          <h4 className="text-sm font-semibold text-text-primary mb-1">Audience Alignment</h4>
          <p className="text-xs text-text-secondary leading-relaxed mb-3">
            {audienceText} Monitor your content performance to ensure you're reaching the right goals.
          </p>
          <button className="text-xs font-semibold text-blue-500 flex items-center gap-1 hover:text-blue-400 transition-colors">
            View Analytics <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
