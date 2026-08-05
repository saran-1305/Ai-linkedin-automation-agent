import { httpClient } from './httpClient';

export const orchestrationApi = {
  getAgentStatuses: async (businessId: number) => {
    const response = await httpClient.get(`/orchestration/status/${businessId}`);
    return response.data;
  },
  
  triggerOnboarding: async (businessId: number) => {
    const response = await httpClient.post(`/orchestration/onboarding/${businessId}`);
    return response.data;
  },

  triggerWeeklyPlanning: async (businessId: number) => {
    const response = await httpClient.post(`/orchestration/weekly-planning/${businessId}`);
    return response.data;
  }
};
