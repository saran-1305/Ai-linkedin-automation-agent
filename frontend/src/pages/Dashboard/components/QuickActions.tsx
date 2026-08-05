import React from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { PenTool, Calendar, Target, Send, BarChart2, Settings, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const actions = [
  { id: 'generate', name: 'Generate Content', desc: 'Draft new posts using AI', icon: PenTool, route: '/content-generator' },
  { id: 'plan', name: 'Run Weekly Planner', desc: 'Schedule your week', icon: Calendar, route: '/weekly-planner' },
  { id: 'competitors', name: 'Analyze Competitors', desc: 'Find market gaps', icon: Target, route: '/competitor-analysis' },
  { id: 'publishing', name: 'Publishing Queue', desc: 'Review upcoming posts', icon: Send, route: '/publishing-assistant' },
  { id: 'analytics', name: 'Analytics Dashboard', desc: 'View performance data', icon: BarChart2, route: '/analytics' },
  { id: 'settings', name: 'Settings', desc: 'Configure platform', icon: Settings, route: '/settings' },
];

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {actions.map(action => (
          <Card 
            key={action.id} 
            className="group cursor-pointer hover:border-border/80 transition-all hover:-translate-y-1 hover:shadow-md"
            onClick={() => navigate(action.route)}
          >
            <CardContent className="p-4 flex flex-col h-full">
              <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-text-secondary border border-border mb-3 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                <action.icon className="w-5 h-5" />
              </div>
              <div className="font-semibold text-text-primary text-sm mb-1">{action.name}</div>
              <div className="text-xs text-text-secondary mb-4 flex-1">{action.desc}</div>
              <div className="text-xs font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                Execute <ArrowRight className="w-3 h-3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
