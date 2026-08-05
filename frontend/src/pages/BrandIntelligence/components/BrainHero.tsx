import React from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Brain, RefreshCw, Download, Layers } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface BrainHeroProps {
  regenerateProfile: () => void;
  exportProfile: () => void;
  regenerating: boolean;
  hasProfile: boolean;
}

export const BrainHero: React.FC<BrainHeroProps> = ({ regenerateProfile, exportProfile, regenerating, hasProfile }) => {
  return (
    <Card className="border-border bg-surface overflow-hidden relative">
      <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <CardContent className="p-8 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="text-sm font-medium text-text-secondary mb-2 uppercase tracking-wider flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" /> Core Knowledge Layer
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">AI Brand Brain</h1>
            <p className="text-text-secondary max-w-xl">
              The single source of truth for your AI. This centralized knowledge layer is consumed by the Strategy Planner, Content Generator, and Analytics engine.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" disabled={!hasProfile} onClick={exportProfile}>
              <Download className="w-4 h-4" /> Export
            </Button>
            <Button 
              onClick={regenerateProfile} 
              disabled={regenerating} 
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
              {regenerating ? 'Rebuilding Brain...' : (hasProfile ? 'Refresh Brain' : 'Build Brand Brain')}
            </Button>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border flex items-center gap-6 text-sm text-text-secondary overflow-x-auto pb-2">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Layers className="w-4 h-4 text-text-muted" /> Downstream Consumers:
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-background border border-border rounded-md text-xs font-medium">Strategy Planner</span>
            <span className="px-2.5 py-1 bg-background border border-border rounded-md text-xs font-medium">Weekly Planner</span>
            <span className="px-2.5 py-1 bg-background border border-border rounded-md text-xs font-medium">Content Generator</span>
            <span className="px-2.5 py-1 bg-background border border-border rounded-md text-xs font-medium">Publishing Center</span>
            <span className="px-2.5 py-1 bg-background border border-border rounded-md text-xs font-medium">Recommendation Engine</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
