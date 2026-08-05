import React from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Network, Server, PlayCircle, Send, Lightbulb, Sparkles } from 'lucide-react';
import { orchestrationApi } from '../../../services/api/orchestrationApi';
import { businessApi } from '../../../services/api/businessApi';

export const HeroSection: React.FC = () => {
  const [loading, setLoading] = React.useState(false);

  const handleRunAI = async () => {
    setLoading(true);
    try {
      const profiles = await businessApi.getAllProfiles();
      if (profiles.length > 0) {
        await orchestrationApi.triggerWeeklyPlanning(profiles[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border bg-surface overflow-hidden">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="text-sm font-medium text-indigo-400 mb-2 uppercase tracking-wider">AI Growth Operating System</div>
            <h1 className="text-3xl font-bold text-slate-100 mb-4">Good Morning 👋</h1>
            <div className="flex items-center gap-4">
              <p className="text-slate-400">Workspace: <span className="text-slate-200 font-medium">Acme Corp</span></p>
              <Button
                variant="premium"
                size="sm" 
                className="gap-2"
                onClick={handleRunAI}
                isLoading={loading}
              >
                <Sparkles className="w-4 h-4" /> Run Autonomous Engine
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="bg-background border border-border rounded-lg p-3 flex flex-col gap-1 min-w-[140px]">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Server className="w-3.5 h-3.5" /> System Status
              </div>
              <StatusBadge status="Healthy" />
            </div>
            
            <div className="bg-background border border-border rounded-lg p-3 flex flex-col gap-1 min-w-[140px]">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <PlayCircle className="w-3.5 h-3.5" /> AI Modules
              </div>
              <div className="text-sm font-semibold text-text-primary">11 Running</div>
            </div>

            <div className="bg-background border border-border rounded-lg p-3 flex flex-col gap-1 min-w-[140px]">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Network className="w-3.5 h-3.5" /> Platforms
              </div>
              <div className="text-sm font-semibold text-text-primary">LinkedIn Connected</div>
            </div>

            <div className="bg-background border border-border rounded-lg p-3 flex flex-col gap-1 min-w-[140px]">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Send className="w-3.5 h-3.5" /> Publishing
              </div>
              <div className="text-sm font-semibold text-text-primary">1 Scheduled</div>
            </div>
            
            <div className="bg-background border border-border rounded-lg p-3 flex flex-col gap-1 min-w-[140px]">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Recommendations
              </div>
              <div className="text-sm font-semibold text-amber-500">2 Unread</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
