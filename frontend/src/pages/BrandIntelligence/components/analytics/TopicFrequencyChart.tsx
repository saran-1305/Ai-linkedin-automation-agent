import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface TopicFrequencyChartProps {
  topics: any[];
}

export const TopicFrequencyChart: React.FC<TopicFrequencyChartProps> = ({ topics }) => {
  if (!topics || topics.length === 0) return null;

  // Take top 7 for the chart to keep it clean
  const data = topics.slice(0, 7).map(t => ({
    name: t.topic_name.length > 15 ? t.topic_name.substring(0, 15) + '...' : t.topic_name,
    fullName: t.topic_name,
    frequency: t.frequency || t.rank || 1
  }));

  const colors = ['#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E'];

  return (
    <div className="h-64 w-full bg-gray-900 rounded-xl p-4 border border-gray-800">
      <h4 className="text-sm font-semibold text-gray-400 mb-4">Top Topics by Frequency</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
          <XAxis type="number" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
          <YAxis type="category" dataKey="name" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} width={100} />
          <Tooltip 
            cursor={{ fill: '#374151', opacity: 0.4 }}
            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem', color: '#F3F4F6' }}
            formatter={(value, name, props) => [value, props.payload.fullName]}
          />
          <Bar dataKey="frequency" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
