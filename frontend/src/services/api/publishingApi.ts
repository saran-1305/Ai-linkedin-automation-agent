import { httpClient } from './httpClient';

export const publishingApi = {
  getJobs: async () => {
    return httpClient.get('/publishing/jobs');
  },
  
  getJobDetails: async (jobId: number) => {
    return httpClient.get(`/publishing/jobs/${jobId}`);
  },
  
  getAccounts: async () => {
    return httpClient.get('/publishing/accounts');
  },
  
  getPlatformAccounts: async () => {
    return httpClient.get('/publishing/accounts');
  },
  
  approveContent: async (variationId: number) => {
    return httpClient.post('/publishing/approve', { variation_id: variationId });
  },
  
  schedulePublishing: async (variationId: number, accountId: number, scheduledTime: string) => {
    return httpClient.post('/publishing/schedule', {
      variation_id: variationId,
      account_id: accountId,
      scheduled_time: scheduledTime
    });
  },
  
  publishNow: async (variationId: number, accountId: number) => {
    return httpClient.post('/publishing/publish', {
      variation_id: variationId,
      account_id: accountId
    });
  },
  
  retryJob: async (jobId: number) => {
    return httpClient.post(`/publishing/retry/${jobId}`);
  },
  
  cancelJob: async (jobId: number) => {
    return httpClient.post(`/publishing/cancel/${jobId}`);
  },
  
  rescheduleJob: async (jobId: number, scheduledTime: string) => {
    return httpClient.post(`/publishing/reschedule/${jobId}`, {
      scheduled_time: scheduledTime
    });
  },
  
  createMockAccount: async (platformName: string, accountName: string) => {
    return httpClient.post(`/publishing/accounts/mock?platform_name=${platformName}&account_name=${accountName}`);
  },

  // Phase 5 Content Integration
  getApprovedContent: async () => {
    return httpClient.get('/publishing/approved-content');
  },

  approveGeneratedContent: async (contentId: number, platformName: string) => {
    return httpClient.post(`/publishing/content/${contentId}/approve`, { platform_name: platformName });
  },

  scheduleGeneratedContent: async (contentId: number, platformName: string, scheduledTime: string) => {
    return httpClient.post(`/publishing/content/${contentId}/schedule`, { platform_name: platformName, scheduled_time: scheduledTime });
  },

  publishGeneratedContentNow: async (contentId: number, platformName: string) => {
    return httpClient.post(`/publishing/content/${contentId}/publish-now`, { platform_name: platformName });
  },

  archiveApprovedContent: async (contentId: number) => {
    return httpClient.delete(`/publishing/content/${contentId}`);
  },

  getAuthUrl: async (platformName: string) => {
    return httpClient.get(`/publishing/platform/${platformName}/auth-url`);
  },

  connectPlatform: async (platformName: string, authCode: string, state: string) => {
    return httpClient.post('/publishing/platform/connect', { 
      platform_name: platformName, 
      auth_code: authCode, 
      state 
    });
  }
};
