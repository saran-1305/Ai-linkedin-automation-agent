import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { BrainCircuit } from 'lucide-react';
import type { BusinessProfileFormData } from '../index';

interface AIUnderstandingProps {
  data: BusinessProfileFormData;
}

export const AIUnderstanding: React.FC<AIUnderstandingProps> = ({ data }) => {
  return (
    <Card className="border-border">
      <CardHeader className="pb-4 border-b border-border bg-surface/30">
        <CardTitle className="text-sm font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-primary" /> How the AI Understands Your Business
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1">
            <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Identity</h5>
            <p className="text-sm text-text-primary">
              {data.company_name ? `Operating as ${data.company_name} in the ${data.industry || 'unspecified'} industry.` : 'Awaiting identity details.'}
            </p>
          </div>
          
          <div className="space-y-1">
            <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Audience</h5>
            <p className="text-sm text-text-primary">
              {data.primary_audience ? `Targeting ${data.primary_audience}.` : 'Target audience is not yet defined.'}
            </p>
          </div>

          <div className="space-y-1">
            <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Brand Voice</h5>
            <p className="text-sm text-text-primary">
              {data.brand_voice ? `Communicating with a ${data.brand_voice} tone.` : 'Brand voice is not yet defined.'}
            </p>
          </div>

          <div className="space-y-1">
            <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Unique Value</h5>
            <p className="text-sm text-text-primary line-clamp-3">
              {data.usp || 'No unique selling proposition defined.'}
            </p>
          </div>
          
          <div className="space-y-1">
            <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Business Goals</h5>
            <p className="text-sm text-text-primary line-clamp-3">
              {data.marketing_goals ? data.marketing_goals : 'No specific marketing goals defined.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
