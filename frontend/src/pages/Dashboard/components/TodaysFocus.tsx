import React from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Target, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TodaysFocus: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Card className="border-primary bg-primary/5 shadow-none h-full flex flex-col">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-4">
          <Target className="w-4 h-4" /> Today's Focus
        </div>
        
        <div className="flex-1">
          <h4 className="text-xl font-bold text-text-primary mb-2">Complete Content Intelligence</h4>
          
          <div className="bg-surface border border-border rounded-md p-3 flex items-start gap-3 mb-4">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-text-primary mb-0.5">Dependency Blocking</div>
              <div className="text-xs text-text-secondary">Brand Intelligence cannot run until Content Intelligence completes its analysis of historical posts.</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
            <Clock className="w-3.5 h-3.5" /> Est. 3 minutes
          </div>
          <Button onClick={() => navigate('/historical-analysis')} size="sm" className="gap-2 shadow-sm">
            Continue <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
