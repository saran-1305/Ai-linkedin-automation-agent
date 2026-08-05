import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface PostMetrics {
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  reposts: number;
  saves: number;
  clicks: number;
  profile_visits: number;
  followers_gained: number;
  engagement_rate: number;
}

export interface AnalyticsRecord {
  id: string;
  workspace_id: string;
  publishing_job_id: string;
  generated_content_id?: string;
  platform: string;
  platform_post_id: string;
  collected_at?: string;
  collection_status: string;
  provider_version: string;
  metrics?: PostMetrics;
}

export interface AnalyticsCollectionRun {
  run_id: string;
  provider: string;
  started_at: string;
  completed_at?: string;
  duration: number;
  status: string;
  collected_posts: number;
  failed_posts: number;
  errors: string[];
}

export interface ProviderStatus {
  provider_name: string;
  last_sync?: string;
  sync_status: string;
  next_sync?: string;
}

export const analyticsApi = {
  getPublishedPosts: async (): Promise<AnalyticsRecord[]> => {
    const response = await axios.get(`${API_BASE_URL}/analytics/posts`);
    return response.data;
  },

  getPostAnalytics: async (postId: string): Promise<AnalyticsRecord> => {
    const response = await axios.get(`${API_BASE_URL}/analytics/post/${postId}`);
    return response.data;
  },

  getPlatformStatus: async (): Promise<ProviderStatus[]> => {
    const response = await axios.get(`${API_BASE_URL}/analytics/platforms`);
    return response.data;
  },

  triggerAnalyticsSync: async (platform: string = 'linkedin'): Promise<AnalyticsCollectionRun> => {
    const response = await axios.post(`${API_BASE_URL}/analytics/sync?platform=${platform}`);
    return response.data;
  },

  getCollectionHistory: async (): Promise<AnalyticsCollectionRun[]> => {
    const response = await axios.get(`${API_BASE_URL}/analytics/history`);
    return response.data;
  },
};
