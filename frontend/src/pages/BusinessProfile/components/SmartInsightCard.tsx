import React from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Lightbulb, ArrowRight, Target } from 'lucide-react';

interface SmartInsightCardProps {
  completionPercentage: number;
}

export const SmartInsightCard: React.FC<SmartInsightCardProps> = ({ completionPercentage }) => {
  const isComplete = completionPercentage === 100;

  return (
    <Card className={`border ${isComplete ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-primary/20 bg-primary/5'} shadow-none h-full flex flex-col`}>
      <CardContent className="p-6 flex flex-col h-full">
        <div className={`flex items-center gap-2 ${isComplete ? 'text-emerald-500' : 'text-primary'} font-semibold text-sm mb-4`}>
          <Lightbulb className="w-4 h-4" /> AI Insight
        </div>
        
        <div className="flex-1 mb-4">
          <h4 className="text-lg font-bold text-text-primary mb-2">
            {isComplete ? 'Your business profile is complete.' : 'Your target audience is missing.'}
          </h4>
          <p className="text-sm text-text-secondary leading-relaxed">
            {isComplete 
              ? 'The AI has enough information to understand your brand voice and begin generating your Brand Intelligence.'
              : 'Adding detailed target audience information will significantly improve the relevancy and engagement of AI-generated content.'}
          </p>
        </div>

        {!isComplete && (
          <div className="bg-surface/50 border border-border rounded-md p-3 flex flex-col gap-2 mb-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-text-muted uppercase tracking-wider">Importance</span>
              <span className="font-bold text-rose-500">Critical</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-text-muted uppercase tracking-wider">Expected Impact</span>
              <span className="font-bold text-emerald-500">Higher Engagement</span>
            </div>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-border/50">
          <Button 
            className="w-full gap-2 shadow-sm"
            onClick={() => {
              const el = document.getElementById(isComplete ? 'business-goals' : 'target-audience');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            {isComplete ? 'Review Goals' : 'Complete Audience Setup'} <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
