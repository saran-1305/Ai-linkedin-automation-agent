import { httpClient } from './httpClient';

export interface OverviewMetrics {
  total_posts: number;
  total_impressions: number;
  total_reach: number;
  total_engagement: number;
  engagement_rate: number;
  followers_gained: number;
  profile_visits: number;
  publishing_success_rate: number;
  impressions_growth: number;
  engagement_growth: number;
  reach_growth: number;
}

export interface PlatformMetrics {
  platform_name: string;
  posts_published: number;
  average_engagement: number;
  average_reach: number;
  average_impressions: number;
  publishing_success_rate: number;
  growth: number;
}

export interface EngagementTrend {
  date: string;
  impressions: number;
  engagement: number;
  reach: number;
}

export interface TopPost {
  id: string;
  platform: string;
  published_date: string;
  content_preview: string;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  engagement_rate: number;
  status: string;
}

export interface ActivityEvent {
  id: string;
  platform: string;
  event_type: string;
  timestamp: string;
  status: string;
  duration_seconds: number;
  errors?: string;
}

export interface DashboardSummary {
  overview: OverviewMetrics;
  trends: EngagementTrend[];
  top_posts: TopPost[];
  platform_performance: PlatformMetrics[];
  recent_activity: ActivityEvent[];
}

export const analyticsDashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await httpClient.get(`/analytics/dashboard/summary`);
    return response.data;
  },
  
  getOverview: async (): Promise<OverviewMetrics> => {
    const response = await httpClient.get(`/analytics/dashboard/overview`);
    return response.data;
  },

  getTrends: async (): Promise<EngagementTrend[]> => {
    const response = await httpClient.get(`/analytics/dashboard/trends`);
    return response.data;
  },

  getTopPosts: async (): Promise<TopPost[]> => {
    const response = await httpClient.get(`/analytics/dashboard/posts/top`);
    return response.data;
  },

  getPlatformPerformance: async (): Promise<PlatformMetrics[]> => {
    const response = await httpClient.get(`/analytics/dashboard/platforms`);
    return response.data;
  },

  getRecentActivity: async (): Promise<ActivityEvent[]> => {
    const response = await httpClient.get(`/analytics/dashboard/activity`);
    return response.data;
  }
};
