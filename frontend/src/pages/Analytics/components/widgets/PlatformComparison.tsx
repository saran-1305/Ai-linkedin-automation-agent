import React from 'react';
import type { PlatformMetrics } from '../../../../services/api/analyticsDashboardApi';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';

interface Props {
  platforms: PlatformMetrics[];
}

interface ChartRow {
  metric: string;
  [platform: string]: string | number;
}

const PlatformComparison: React.FC<Props> = ({ platforms }) => {
  const chartData: ChartRow[] = [
    { metric: 'Avg Engagement', linkedin: 0, x: 0 },
    { metric: 'Avg Reach', linkedin: 0, x: 0 },
    { metric: 'Success Rate', linkedin: 0, x: 0 },
    { metric: 'Growth', linkedin: 0, x: 0 },
  ];

  platforms.forEach(p => {
    const key = p.platform_name.toLowerCase();
    chartData[0][key] = p.average_engagement * 10;
    chartData[1][key] = p.average_reach / 10;
    chartData[2][key] = p.publishing_success_rate;
    chartData[3][key] = Math.max(0, p.growth * 5);
  });

  return (
    <Card className="border-border bg-surface h-[400px] flex flex-col">
      <CardHeader className="pb-2 border-b border-border">
        <CardTitle className="text-lg">Platform Comparison</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 min-h-0 relative w-full h-full p-0">
        {platforms.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <PolarGrid stroke="var(--color-border)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              
              {platforms.some(p => p.platform_name === 'linkedin') && (
                <Radar name="LinkedIn" dataKey="linkedin" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.4} />
              )}
              {platforms.some(p => p.platform_name === 'x') && (
                <Radar name="X (Twitter)" dataKey="x" stroke="var(--color-info)" fill="var(--color-info)" fillOpacity={0.4} />
              )}
              
              <Legend wrapperStyle={{ bottom: 0 }} />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-muted h-full">
            No platform data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlatformComparison;
