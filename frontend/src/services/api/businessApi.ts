import { httpClient } from './httpClient';
import { ENDPOINTS } from './apiConstants';
import type { BusinessProfileCreate, BusinessProfileUpdate, BusinessProfileResponse } from '../../types';

export const businessApi = {
  getProfile: async (id: number): Promise<BusinessProfileResponse> => {
    const { data } = await httpClient.get<BusinessProfileResponse>(`${ENDPOINTS.BUSINESS_PROFILE}/${id}`);
    return data;
  },

  getAllProfiles: async (): Promise<BusinessProfileResponse[]> => {
    const { data } = await httpClient.get<BusinessProfileResponse[]>(ENDPOINTS.BUSINESS_PROFILE);
    return data;
  },

  createProfile: async (profile: BusinessProfileCreate): Promise<BusinessProfileResponse> => {
    const { data } = await httpClient.post<BusinessProfileResponse>(ENDPOINTS.BUSINESS_PROFILE, profile);
    return data;
  },

  updateProfile: async (id: number, profile: BusinessProfileUpdate): Promise<BusinessProfileResponse> => {
    const { data } = await httpClient.put<BusinessProfileResponse>(`${ENDPOINTS.BUSINESS_PROFILE}/${id}`, profile);
    return data;
  },

  deleteProfile: async (id: number): Promise<void> => {
    await httpClient.delete(`${ENDPOINTS.BUSINESS_PROFILE}/${id}`);
  },

  startExtraction: async (files: File[]): Promise<{ task_id: string; status: string }> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // We might need to override the Content-Type header so the browser sets it with the boundary for FormData
    const { data } = await httpClient.post<{ task_id: string; status: string }>(`${ENDPOINTS.BUSINESS_PROFILE}/extract`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  getExtractionStatus: async (taskId: string): Promise<{ status: string; result?: any; error?: string }> => {
    const { data } = await httpClient.get<{ status: string; result?: any; error?: string }>(`${ENDPOINTS.BUSINESS_PROFILE}/extract/status/${taskId}`);
    return data;
  },
};
