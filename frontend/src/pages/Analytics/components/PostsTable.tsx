import React from 'react';
import type { AnalyticsRecord } from '../../../services/api/analyticsApi';

interface Props {
  posts: AnalyticsRecord[];
}

const PostsTable: React.FC<Props> = ({ posts }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700 overflow-hidden">
      <h2 className="text-xl font-semibold mb-6 text-gray-200">Recent Published Posts</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 text-sm">
              <th className="pb-3 px-4 font-medium">Platform</th>
              <th className="pb-3 px-4 font-medium">Post ID</th>
              <th className="pb-3 px-4 font-medium">Status</th>
              <th className="pb-3 px-4 font-medium">Impressions</th>
              <th className="pb-3 px-4 font-medium">Engagements</th>
              <th className="pb-3 px-4 font-medium">Rate</th>
              <th className="pb-3 px-4 font-medium">Last Collected</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No published posts found.
                </td>
              </tr>
            ) : (
              posts.map((post) => {
                const totalEngagements = (post.metrics?.likes || 0) + (post.metrics?.comments || 0) + (post.metrics?.shares || 0);
                
                return (
                  <tr key={post.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                    <td className="py-4 px-4 capitalize font-medium text-gray-300">
                      <div className="flex items-center space-x-2">
                        {post.platform === 'linkedin' && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                        <span>{post.platform}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-400 font-mono text-xs">{post.platform_post_id.substring(0, 15)}...</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        post.collection_status === 'success' ? 'bg-green-900/50 text-green-400 border border-green-800' :
                        post.collection_status === 'failed' ? 'bg-red-900/50 text-red-400 border border-red-800' :
                        post.collection_status === 'in_progress' ? 'bg-blue-900/50 text-blue-400 border border-blue-800' :
                        'bg-yellow-900/50 text-yellow-400 border border-yellow-800'
                      }`}>
                        {post.collection_status}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-300">{post.metrics?.impressions?.toLocaleString() || '-'}</td>
                    <td className="py-4 px-4 font-semibold text-gray-300">{totalEngagements > 0 ? totalEngagements.toLocaleString() : '-'}</td>
                    <td className="py-4 px-4 text-gray-400">{post.metrics?.engagement_rate ? `${post.metrics.engagement_rate}%` : '-'}</td>
                    <td className="py-4 px-4 text-gray-500 text-xs">
                      {post.collected_at ? new Date(post.collected_at).toLocaleString() : 'Never'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PostsTable;
