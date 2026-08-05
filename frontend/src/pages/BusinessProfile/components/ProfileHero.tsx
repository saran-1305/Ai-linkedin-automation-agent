import React from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Building2, CheckCircle2, Clock, BrainCircuit } from 'lucide-react';

interface ProfileHeroProps {
  companyName: string;
  completionPercentage: number;
  isEditing: boolean;
  onEdit: () => void;
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({ companyName, completionPercentage, isEditing, onEdit }) => {
  return (
    <Card className="border-border bg-surface overflow-hidden">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="text-sm font-medium text-text-secondary mb-2 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Business Profile
            </div>
            <div className="flex justify-between items-center w-full">
              <h1 className="text-3xl font-bold text-text-primary mb-1">{companyName || 'New Workspace'}</h1>
              {!isEditing && (
                <Button onClick={onEdit} variant="outline" size="sm" className="flex gap-2 shrink-0 ml-4">
                  Edit Profile
                </Button>
              )}
            </div>
            <p className="text-text-secondary">Teach your AI about your business identity and goals.</p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="bg-background border border-border rounded-lg p-3 flex flex-col gap-1 min-w-[140px]">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <CheckCircle2 className="w-3.5 h-3.5" /> Profile Status
              </div>
              <StatusBadge status={completionPercentage === 100 ? 'Completed' : 'Running'} showIcon={false} />
            </div>
            
            <div className="bg-background border border-border rounded-lg p-3 flex flex-col gap-1 min-w-[140px]">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completion
              </div>
              <div className="text-sm font-semibold text-text-primary">{completionPercentage}%</div>
            </div>

            <div className="bg-background border border-border rounded-lg p-3 flex flex-col gap-1 min-w-[140px]">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <BrainCircuit className="w-3.5 h-3.5" /> AI Understanding
              </div>
              <div className="text-sm font-semibold text-emerald-500">Ready</div>
            </div>

            <div className="bg-background border border-border rounded-lg p-3 flex flex-col gap-1 min-w-[140px]">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Clock className="w-3.5 h-3.5" /> Estimated Setup
              </div>
              <div className="text-sm font-semibold text-text-primary">5 Minutes</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
