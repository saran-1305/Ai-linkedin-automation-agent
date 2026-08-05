import { httpClient } from './httpClient';

export interface Recommendation {
  id: string;
  workspace_id: string;
  category: string;
  priority: string;
  recommendation_type: string;
  title: string;
  description: string;
  expected_impact: string;
  confidence: number;
  supporting_metrics: Record<string, any>;
  status: string;
  created_at: string;
  implemented_at?: string;
}

export interface OptimizationGoal {
  id: string;
  workspace_id: string;
  goal: string;
  target_metric: string;
  target_value: number;
  current_value: number;
  progress: number;
  status: string;
}

export interface ExecutiveOptimizationSummary {
  top_opportunity: string;
  biggest_risk: string;
  quick_win: string;
  strategic_focus: string;
  total_optimizations_applied?: number;
  estimated_impact_metric?: string;
  current_strategy_health?: number;
}

export const recommendationsApi = {
  getRecommendations: async (): Promise<Recommendation[]> => {
    const response = await httpClient.get(`/recommendations`);
    return response.data;
  },

  getGoals: async (): Promise<OptimizationGoal[]> => {
    const response = await httpClient.get(`/recommendations/goals`);
    return response.data;
  },

  getSummary: async (): Promise<ExecutiveOptimizationSummary> => {
    const response = await httpClient.get(`/recommendations/summary`);
    return response.data;
  },

  acceptRecommendation: async (id: string): Promise<{ status: string, message: string }> => {
    const response = await httpClient.post(`/recommendations/${id}/accept`);
    return response.data;
  },

  dismissRecommendation: async (id: string): Promise<{ status: string, message: string }> => {
    const response = await httpClient.post(`/recommendations/${id}/dismiss`);
    return response.data;
  }
};
