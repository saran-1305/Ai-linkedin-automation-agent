import React from 'react';
import type { AnalyticsRecord } from '../../../services/api/analyticsApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props {
  posts: AnalyticsRecord[];
}

const MetricsOverview: React.FC<Props> = ({ posts }) => {
  // Calculate aggregated metrics
  const totalImpressions = posts.reduce((sum, post) => sum + (post.metrics?.impressions || 0), 0);
  const totalEngagements = posts.reduce((sum, post) => 
    sum + (post.metrics?.likes || 0) + (post.metrics?.comments || 0) + (post.metrics?.shares || 0), 0
  );
  
  const avgEngagementRate = posts.length > 0 
    ? (posts.reduce((sum, post) => sum + (post.metrics?.engagement_rate || 0), 0) / posts.length).toFixed(2)
    : '0.00';

  // Prepare data for a simple chart
  const chartData = posts.slice(0, 7).map((post, i) => ({
    name: `Post ${i + 1}`,
    impressions: post.metrics?.impressions || 0,
    engagements: (post.metrics?.likes || 0) + (post.metrics?.comments || 0)
  }));

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700 backdrop-blur-sm bg-opacity-80">
      <h2 className="text-xl font-semibold mb-6 text-gray-200">Metrics Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 rounded-lg p-5 border border-gray-700 flex flex-col justify-center items-center transform hover:scale-105 transition-transform">
          <span className="text-gray-400 text-sm mb-1">Total Impressions</span>
          <span className="text-3xl font-bold text-blue-400">{totalImpressions.toLocaleString()}</span>
        </div>
        <div className="bg-gray-900 rounded-lg p-5 border border-gray-700 flex flex-col justify-center items-center transform hover:scale-105 transition-transform">
          <span className="text-gray-400 text-sm mb-1">Total Engagements</span>
          <span className="text-3xl font-bold text-purple-400">{totalEngagements.toLocaleString()}</span>
        </div>
        <div className="bg-gray-900 rounded-lg p-5 border border-gray-700 flex flex-col justify-center items-center transform hover:scale-105 transition-transform">
          <span className="text-gray-400 text-sm mb-1">Avg Engagement Rate</span>
          <span className="text-3xl font-bold text-green-400">{avgEngagementRate}%</span>
        </div>
      </div>

      <div className="h-64 mt-4">
        {posts.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="name" stroke="#9CA3AF" tick={{fill: '#9CA3AF'}} />
              <YAxis stroke="#9CA3AF" tick={{fill: '#9CA3AF'}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                itemStyle={{ color: '#F3F4F6' }}
              />
              <Bar dataKey="impressions" fill="#60A5FA" radius={[4, 4, 0, 0]} name="Impressions" />
              <Bar dataKey="engagements" fill="#A78BFA" radius={[4, 4, 0, 0]} name="Engagements" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No data available yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsOverview;
