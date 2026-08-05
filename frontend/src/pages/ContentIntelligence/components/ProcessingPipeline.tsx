import React from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { UploadCloud, FileText, Wand2, CheckCircle2, ChevronRight } from 'lucide-react';

export const ProcessingPipeline: React.FC = () => {
  const steps = [
    { name: 'Upload', icon: UploadCloud, status: 'complete' },
    { name: 'Extraction & Cleaning', icon: FileText, status: 'complete' },
    { name: 'AI Analysis', icon: Wand2, status: 'active' },
    { name: 'Brand Intelligence', icon: CheckCircle2, status: 'pending' },
  ];

  return (
    <Card className="border-border bg-surface mb-8">
      <CardContent className="p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-6">Processing Pipeline</h3>
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                  step.status === 'complete' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' :
                  step.status === 'active' ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(var(--color-primary),0.3)]' :
                  'bg-background border-border text-text-muted'
                }`}>
                  <step.icon className={`w-5 h-5 ${step.status === 'active' ? 'animate-pulse' : ''}`} />
                </div>
                <span className={`text-xs font-medium ${
                  step.status === 'active' ? 'text-primary' : 
                  step.status === 'complete' ? 'text-text-primary' : 'text-text-muted'
                }`}>
                  {step.name}
                </span>
              </div>
              
              {idx < steps.length - 1 && (
                <div className="flex-1 px-4">
                  <div className={`h-0.5 w-full rounded ${
                    step.status === 'complete' ? 'bg-emerald-500/50' : 'bg-border'
                  }`} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
