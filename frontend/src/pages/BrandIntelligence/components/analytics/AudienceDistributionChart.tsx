import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface AudienceDistributionChartProps {
  audiences: any[];
}

export const AudienceDistributionChart: React.FC<AudienceDistributionChartProps> = ({ audiences }) => {
  if (!audiences || audiences.length === 0) return null;

  const data = audiences.map(a => ({
    name: a.audience_segment,
    value: a.confidence || 50
  }));

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

  return (
    <div className="h-64 w-full bg-gray-900 rounded-xl p-4 border border-gray-800 flex flex-col">
      <h4 className="text-sm font-semibold text-gray-400 mb-2">Audience Segmentation</h4>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem', color: '#F3F4F6' }}
              itemStyle={{ color: '#E5E7EB' }}
              formatter={(value) => [`${value}% Match`, 'Confidence']}
            />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
