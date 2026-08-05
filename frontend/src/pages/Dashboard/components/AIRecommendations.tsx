import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Lightbulb, TrendingUp, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const AIRecommendations: React.FC = () => {
  return (
    <Card className="h-full border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold text-amber-500 uppercase tracking-wider flex items-center justify-between">
          <div className="flex items-center gap-2"><Lightbulb className="w-4 h-4" /> AI Recommendation</div>
          <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-xs font-bold">94% Confidence</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h4 className="text-lg font-bold text-text-primary mb-2">Founder Stories outperform AI News</h4>
          <p className="text-sm text-text-secondary leading-relaxed">
            Based on recent analytics, personal founder stories are generating significantly higher engagement than standard AI news curation on LinkedIn.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-surface border border-border rounded-lg p-3 mb-5">
          <div className="w-8 h-8 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-medium text-text-muted uppercase">Expected Impact</div>
            <div className="text-sm font-bold text-emerald-500">+18% Engagement if applied next week</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white shadow-sm">
            Apply to Strategy
          </Button>
          <Button variant="outline" className="flex-1">
            View Analysis
          </Button>
          <Button variant="outline" className="px-3 shrink-0" title="Dismiss">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
