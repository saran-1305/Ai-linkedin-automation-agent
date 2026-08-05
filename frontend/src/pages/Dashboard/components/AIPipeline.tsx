import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { GitCommit, ArrowRight, Check } from 'lucide-react';
import { moduleRegistry } from '../../../config/moduleRegistry';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../utils/cn';

export const AIPipeline: React.FC = () => {
  const navigate = useNavigate();
  
  // Create an ordered pipeline from specific core modules
  const pipelineIds = ['business-profile', 'historical-analysis', 'brand-intelligence', 'competitor-analysis', 'strategy-planner', 'content-generator', 'publishing-assistant'];
  const pipeline = pipelineIds.map(id => moduleRegistry.find(m => m.id === id)!).filter(Boolean);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
          <GitCommit className="w-4 h-4" /> AI Execution Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-x-auto pb-6">
        <div className="flex items-center min-w-max px-2 py-4">
          {pipeline.map((module, index) => {
            const isLast = index === pipeline.length - 1;
            const isCompleted = module.status === 'Completed';
            const isRunning = module.status === 'Active' || module.status === 'Running' || module.status === 'Available';
            
            return (
              <React.Fragment key={module.id}>
                {/* Node */}
                <div 
                  className="flex flex-col w-48 shrink-0 group cursor-pointer"
                  onClick={() => navigate(module.route)}
                >
                  <div className="bg-surface border border-border rounded-lg p-3 hover:border-primary transition-colors shadow-sm relative z-10">
                    <div className="flex justify-between items-start mb-2">
                      <div className={cn(
                        "w-6 h-6 rounded flex items-center justify-center text-xs",
                        isCompleted ? "bg-emerald-500/10 text-emerald-500" :
                        isRunning ? "bg-primary/10 text-primary" : "bg-slate-800 text-slate-500"
                      )}>
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : <module.icon className="w-3.5 h-3.5" />}
                      </div>
                      <StatusBadge status={module.status as any} showIcon={false} />
                    </div>
                    <div className="text-sm font-semibold text-text-primary mb-1 truncate">{module.name}</div>
                    <div className="text-[10px] text-text-muted truncate">
                      {isCompleted ? 'Completed successfully' : isRunning ? 'Pending execution' : 'Awaiting dependencies'}
                    </div>
                  </div>
                </div>
                
                {/* Connector */}
                {!isLast && (
                  <div className="flex items-center w-8 shrink-0 -mx-1 relative z-0">
                    <div className={cn(
                      "w-full h-0.5",
                      isCompleted ? "bg-emerald-500/50" : "bg-border"
                    )} />
                    <ArrowRight className={cn(
                      "w-3 h-3 -ml-2",
                      isCompleted ? "text-emerald-500/50" : "text-border"
                    )} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
