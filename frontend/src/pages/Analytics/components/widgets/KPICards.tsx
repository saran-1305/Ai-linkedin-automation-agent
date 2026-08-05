import React from 'react';
import type { OverviewMetrics } from '../../../../services/api/analyticsDashboardApi';
import { Eye, Users, ThumbsUp, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from '../../../../components/ui/Card';

interface Props {
  metrics: OverviewMetrics;
}

const KPICards: React.FC<Props> = ({ metrics }) => {
  const cards = [
    {
      title: 'Total Reach',
      value: (metrics?.total_reach || 0).toLocaleString(),
      change: `${(metrics?.reach_growth ?? 0) >= 0 ? '+' : ''}${metrics?.reach_growth ?? 0}%`,
      isPositive: (metrics?.reach_growth ?? 0) >= 0,
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      title: 'Total Impressions',
      value: (metrics?.total_impressions || 0).toLocaleString(),
      change: '+24.1%',
      isPositive: true,
      icon: Eye,
      color: 'text-info',
      bg: 'bg-info/10'
    },
    {
      title: 'Avg Engagement Rate',
      value: `${metrics?.engagement_rate || 0}%`,
      change: `${(metrics?.engagement_growth ?? 0) >= 0 ? '+' : ''}${metrics?.engagement_growth ?? 0}%`,
      isPositive: (metrics?.engagement_growth ?? 0) >= 0,
      icon: Activity,
      color: 'text-warning',
      bg: 'bg-warning/10'
    },
    {
      title: 'Publishing Success Rate',
      value: `${metrics?.publishing_success_rate || 0}%`,
      change: '',
      isPositive: (metrics?.publishing_success_rate ?? 0) >= 90,
      icon: ThumbsUp,
      color: 'text-success',
      bg: 'bg-success/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <Card key={i} className="border-border bg-surface">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center text-sm font-bold ${card.isPositive ? 'text-success' : 'text-danger'}`}>
                {card.isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                {card.change}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-1">{card.title}</h3>
              <p className="text-3xl font-black text-text-primary">{card.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KPICards;
