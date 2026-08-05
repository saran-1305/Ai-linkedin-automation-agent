import React from 'react';
import type { TopPost } from '../../../../services/api/analyticsDashboardApi';
import { ExternalLink, MessageCircle, ThumbsUp, Eye, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';

interface Props {
  posts: TopPost[];
}

const TopPostsTable: React.FC<Props> = ({ posts }) => {
  return (
    <Card className="border-border bg-surface overflow-hidden">
      <CardHeader className="p-5 border-b border-border bg-surface-hover/30 flex flex-row justify-between items-center">
        <CardTitle className="text-lg">Top Performing Content</CardTitle>
        <button className="text-sm text-primary hover:text-primary/80 font-bold transition-colors">View All</button>
      </CardHeader>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background text-text-muted text-xs uppercase tracking-wider font-bold">
              <th className="py-4 px-6">Content Preview</th>
              <th className="py-4 px-6">Platform</th>
              <th className="py-4 px-6">Performance</th>
              <th className="py-4 px-6">Rate</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-text-secondary">
                  <Target className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-50" />
                  No performance data available yet.
                </td>
              </tr>
            ) : (
              posts.map((post, index) => (
                <tr key={post.id || index} className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-md bg-background flex items-center justify-center mr-3 text-text-muted font-bold text-xs shrink-0 mt-0.5 border border-border">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-text-primary font-medium line-clamp-2 max-w-sm leading-snug">{post.content_preview}</p>
                        <p className="text-xs text-text-muted mt-1.5 font-medium">{new Date(post.published_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 capitalize">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                      {post.platform}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-4 text-xs font-medium text-text-secondary">
                      <div className="flex items-center" title="Impressions">
                        <Eye className="w-3.5 h-3.5 mr-1 text-text-muted" />
                        {post.impressions.toLocaleString()}
                      </div>
                      <div className="flex items-center text-primary" title="Likes">
                        <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                        {post.likes.toLocaleString()}
                      </div>
                      <div className="flex items-center text-info" title="Comments">
                        <MessageCircle className="w-3.5 h-3.5 mr-1" />
                        {post.comments.toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-success font-black">{post.engagement_rate}%</span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-text-muted hover:text-primary p-2 rounded-lg hover:bg-surface-hover transition-colors opacity-0 group-hover:opacity-100">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TopPostsTable;
