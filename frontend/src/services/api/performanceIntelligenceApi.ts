import { httpClient } from './httpClient';

export interface PerformanceInsight {
  id: string;
  workspace_id: string;
  insight_type: string;
  title: string;
  description: string;
  confidence: number;
  supporting_data: Record<string, any>;
  suggested_action: string;
  generated_at: string;
}

export interface PerformanceRecommendation {
  recommendation: string;
  reason: string;
  priority: string;
  expected_impact: string;
  confidence: number;
  historical_comparison?: string;
}

export interface ExecutiveSummary {
  overall_performance: string;
  key_wins: string[];
  key_challenges: string[];
  content_learnings: string[];
  audience_behavior: string;
  top_opportunities: string[];
  generated_at: string;
}

export interface PerformanceMemory {
  workspace_id: string;
  winning_topics: any[];
  winning_hooks: any[];
  winning_ctas: any[];
  winning_timing: any[];
  common_failures: string[];
  audience_preferences: string[];
  last_updated: string;
}

export const performanceIntelligenceApi = {
  getSummary: async (): Promise<ExecutiveSummary> => {
    const response = await httpClient.get(`/performance/summary`);
    return response.data;
  },
  
  getInsights: async (): Promise<PerformanceInsight[]> => {
    const response = await httpClient.get(`/performance/insights`);
    return response.data;
  },

  getRecommendations: async (): Promise<PerformanceRecommendation[]> => {
    const response = await httpClient.get(`/performance/recommendations`);
    return response.data;
  },

  getMemory: async (): Promise<PerformanceMemory> => {
    const response = await httpClient.get(`/performance/memory`);
    return response.data;
  },

  triggerAnalysis: async (): Promise<{ status: string, message: string }> => {
    const response = await httpClient.post(`/performance/analyze`);
    return response.data;
  }
};
