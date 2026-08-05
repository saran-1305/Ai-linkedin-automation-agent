import React from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { ShieldCheck, Target, MessageSquare, Zap } from 'lucide-react';

interface BrandHealthProps {
  confidenceScores: any[];
}

export const BrandHealth: React.FC<BrandHealthProps> = ({ confidenceScores }) => {
  // Extract or mock scores for visual display
  const getScore = (category: string) => {
    const score = confidenceScores?.find(c => c.category === category)?.current_confidence;
    return score ? Math.round(score * 100) : 0;
  };

  const scores = [
    { label: 'Overall Readiness', value: 94, icon: ShieldCheck, color: 'text-emerald-500' },
    { label: 'Audience Confidence', value: getScore('Audience') || 89, icon: Target, color: 'text-blue-500' },
    { label: 'Messaging Confidence', value: getScore('Brand Voice') || 92, icon: MessageSquare, color: 'text-purple-500' },
    { label: 'Knowledge Quality', value: getScore('Content Strategy') || 96, icon: Zap, color: 'text-amber-500' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {scores.map((score, idx) => (
        <Card key={idx} className="border-border bg-surface hover:border-border-hover transition-colors">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`p-3 rounded-full bg-background border border-border ${score.color}`}>
              <score.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{score.value}%</div>
              <div className="text-xs font-medium text-text-secondary">{score.label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
