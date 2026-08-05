import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';

interface ModuleWorkspaceTemplateProps {
  moduleConfig: {
    id: string;
    name: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    status: string;
    nextAction: string;
  };
}

export const ModuleWorkspaceTemplate: React.FC<ModuleWorkspaceTemplateProps> = ({ moduleConfig }) => {
  const navigate = useNavigate();
  const Icon = moduleConfig.icon;

  return (
    <div className="animate-in flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto px-4">
      <Card className="w-full border-border bg-surface p-12 text-center flex flex-col items-center shadow-sm">
        <div className="w-20 h-20 rounded-2xl bg-surface-hover border border-border flex items-center justify-center mb-6">
          {Icon ? (
            <Icon className="w-10 h-10 text-primary opacity-60" />
          ) : (
            <Construction className="w-10 h-10 text-primary opacity-60" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-3">{moduleConfig.name}</h2>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-lg font-medium">
          {moduleConfig.description}
        </p>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ModuleWorkspaceTemplate;
