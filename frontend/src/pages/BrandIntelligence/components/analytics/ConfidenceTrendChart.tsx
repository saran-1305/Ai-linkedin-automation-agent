import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface ConfidenceTrendChartProps {
  versions: any[];
}

export const ConfidenceTrendChart: React.FC<ConfidenceTrendChartProps> = ({ versions }) => {
  if (!versions || versions.length === 0) return null;

  // Recharts expects an array of objects. We need to parse the created_at dates.
  const data = [...versions].reverse().map(v => ({
    version: `v${v.version}`,
    documents: v.document_count,
    // We don't have historical confidence scores stored directly in the version history,
    // but we can plot document counts as a proxy for knowledge growth/confidence over time.
    knowledgeBase: v.document_count * 10
  }));

  return (
    <div className="h-64 w-full bg-gray-900 rounded-xl p-4 border border-gray-800">
      <h4 className="text-sm font-semibold text-gray-400 mb-4">Knowledge Base Growth (Trend)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis dataKey="version" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem', color: '#F3F4F6' }}
            itemStyle={{ color: '#60A5FA' }}
          />
          <Line type="monotone" dataKey="documents" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2 }} activeDot={{ r: 6 }} name="Documents Indexed" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
