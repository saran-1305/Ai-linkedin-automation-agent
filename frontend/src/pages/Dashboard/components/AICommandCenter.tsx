import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Bot, Sparkles, BrainCircuit, Loader2 } from 'lucide-react';
import { orchestrationApi } from '../../../services/api/orchestrationApi';
import { businessApi } from '../../../services/api/businessApi';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';

const agentDescriptions: Record<string, string> = {
  'Business Agent': 'Maintains brand voice & rules',
  'Content Intelligence Agent': 'Processes raw text into structures',
  'Brand Intelligence Agent': 'Analyzes brand identity',
  'Market Intelligence Agent': 'Analyzes competitors & trends',
  'Strategy Agent': 'Plans long-term roadmaps',
  'Weekly Planner Agent': 'Schedules weekly slots',
  'Content Generator Agent': 'Drafts posts and variations',
  'Publishing Agent': 'Manages API scheduling',
  'Analytics Agent': 'Extracts insights from data',
};

interface AgentStatus {
  agent_name: string;
  status: string;
  last_update: string | null;
}

export const AICommandCenter: React.FC = () => {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const fetchStatuses = async () => {
      try {
        const profiles = await businessApi.getAllProfiles();
        if (profiles.length > 0) {
          const businessId = profiles[0].id;
          const data = await orchestrationApi.getAgentStatuses(businessId);
          setAgents(data);
        }
      } catch (err) {
        console.error("Failed to fetch agent statuses", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatuses();
    
    // Poll every 5 seconds for real-time updates
    intervalId = setInterval(fetchStatuses, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'COMPLETED': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'FAILED': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'RETRYING': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'WAITING':
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <Card className="h-full bg-slate-900 border-slate-800">
      <CardHeader className="pb-4 border-b border-slate-800">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-400" /> AI Agents Status
          </CardTitle>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-500" />}
        </div>
      </CardHeader>
      <CardContent className="pt-4 overflow-y-auto max-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-48" />
              </div>
            ))}
          </div>
        ) : agents.length === 0 ? (
          <EmptyState 
            icon={Bot} 
            title="Agents Sleeping" 
            description="The AI Operating System is waiting for initial setup. Once onboarded, your agents will appear here." 
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {agents.map(agent => (
              <div key={agent.agent_name} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col gap-2 relative overflow-hidden">
                {/* Active Indicator Glow */}
                {agent.status === 'RUNNING' && (
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500 animate-pulse"></div>
                )}
                
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 font-semibold text-slate-200 text-sm">
                    {agent.agent_name.includes('Generator') || agent.agent_name.includes('Strategy') 
                      ? <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> 
                      : <BrainCircuit className="w-3.5 h-3.5 text-slate-400" />}
                    {agent.agent_name}
                  </div>
                  <div className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getStatusColor(agent.status)}`}>
                    {agent.status === 'RUNNING' ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> RUNNING
                      </span>
                    ) : agent.status}
                  </div>
                </div>
                <div className="text-xs text-slate-500">{agentDescriptions[agent.agent_name] || 'Autonomous Agent'}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
