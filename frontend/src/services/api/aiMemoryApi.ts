import { httpClient } from './httpClient';

export interface ProviderStatus {
  name: string;
  connected: boolean;
  current_model: string;
  response_time: string;
  requests_today: number;
  success_rate: string;
  last_request: string;
  token_usage: number;
}

export interface MemorySourceStatus {
  name: string;
  status: string; // Healthy, Warning, Critical
  last_updated: string;
  version: string;
  confidence_score: number;
  total_records: number;
  last_analysis: string;
}

export const aiMemoryApi = {
  getStatus: async (): Promise<MemorySourceStatus[]> => {
    const { data } = await httpClient.get('/settings/ai-memory/status');
    return data;
  },
  getProviders: async (): Promise<ProviderStatus[]> => {
    const { data } = await httpClient.get('/settings/ai-memory/providers');
    return data;
  },
  getHealth: async (): Promise<Record<string, string>> => {
    const { data } = await httpClient.get('/settings/ai-memory/health');
    return data;
  },
  refreshKnowledge: async (module: string): Promise<{ status: string; message: string }> => {
    const { data } = await httpClient.post(`/settings/ai-memory/refresh/${module}`);
    return data;
  },
  clearCache: async (cacheType: string): Promise<{ status: string; message: string }> => {
    const { data } = await httpClient.post(`/settings/ai-memory/clear-cache/${cacheType}`);
    return data;
  }
};
