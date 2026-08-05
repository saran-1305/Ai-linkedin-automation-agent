import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { CheckSquare, Activity, CheckCircle2, CircleDashed } from 'lucide-react';
import type { BusinessProfileFormData } from '../index';

interface RightSidebarProps {
  data: Partial<BusinessProfileFormData>;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ data }) => {
  const isIdentityComplete = !!(data.company_name && data.industry && data.description);
  const isAudienceComplete = !!(data.primary_audience && data.pain_points);
  const isBrandComplete = !!data.brand_voice;
  const isGoalsComplete = !!(data.marketing_goals);
  
  const completedCount = [isIdentityComplete, isAudienceComplete, isBrandComplete, isGoalsComplete].filter(Boolean).length;
  const dataQuality = completedCount === 4 ? 'Excellent' : completedCount >= 2 ? 'Good' : 'Needs Work';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4 border-b border-border">
          <CardTitle className="text-sm font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
            <CheckSquare className="w-4 h-4" /> Readiness Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isIdentityComplete ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <CircleDashed className="w-4 h-4 text-text-muted" />}
              <span className={`text-sm ${isIdentityComplete ? 'text-text-primary' : 'text-text-secondary'}`}>Business Identity</span>
            </div>
            <span className={`text-xs font-semibold ${isIdentityComplete ? 'text-emerald-500' : 'text-text-muted'}`}>
              {isIdentityComplete ? 'Completed' : 'Missing'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isAudienceComplete ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <CircleDashed className="w-4 h-4 text-text-muted" />}
              <span className={`text-sm ${isAudienceComplete ? 'text-text-primary' : 'text-text-secondary'}`}>Target Audience</span>
            </div>
            <span className={`text-xs font-semibold ${isAudienceComplete ? 'text-emerald-500' : 'text-text-muted'}`}>
              {isAudienceComplete ? 'Completed' : 'Missing'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isBrandComplete ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <CircleDashed className="w-4 h-4 text-text-muted" />}
              <span className={`text-sm ${isBrandComplete ? 'text-text-primary' : 'text-text-secondary'}`}>Brand Voice</span>
            </div>
            <span className={`text-xs font-semibold ${isBrandComplete ? 'text-emerald-500' : 'text-text-muted'}`}>
              {isBrandComplete ? 'Completed' : 'Missing'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isGoalsComplete ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <CircleDashed className="w-4 h-4 text-text-muted" />}
              <span className={`text-sm ${isGoalsComplete ? 'text-text-primary' : 'text-text-secondary'}`}>Business Goals</span>
            </div>
            <span className={`text-xs font-semibold ${isGoalsComplete ? 'text-emerald-500' : 'text-text-muted'}`}>
              {isGoalsComplete ? 'Completed' : 'Missing'}
            </span>
          </div>

        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4 border-b border-border">
          <CardTitle className="text-sm font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4" /> Business Health
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary">Data Quality</span>
            <span className={`font-semibold ${dataQuality === 'Excellent' ? 'text-emerald-500' : 'text-amber-500'}`}>{dataQuality}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary">Audience Confidence</span>
            <span className={`font-semibold ${isAudienceComplete ? 'text-emerald-500' : 'text-rose-500'}`}>{isAudienceComplete ? 'High' : 'Low'}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary">Brand Confidence</span>
            <span className={`font-semibold ${isBrandComplete ? 'text-emerald-500' : 'text-amber-500'}`}>{isBrandComplete ? 'High' : 'Medium'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
