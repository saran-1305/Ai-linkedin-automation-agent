import { httpClient } from './httpClient';

export interface WorkspaceSettings {
  workspace_name: string;
  workspace_logo?: string;
  time_zone: string;
  language: string;
  date_format: string;
  default_currency: string;
  default_region: string;
}

export interface AISettings {
  ai_provider: string;
  provider_api_key: string;
  model_selection: string;
  temperature: number;
  maximum_tokens: number;
  reasoning_level: string;
  default_content_style: string;
  brand_voice_preference: string;
  writing_tone: string;
  language: string;
}

export interface PublishingSettings {
  default_platform: string;
  default_publish_time: string;
  default_time_zone: string;
  retry_attempts: number;
  retry_delay: number;
  auto_verification: boolean;
  publishing_queue_limit: number;
  scheduling_buffer: number;
}

export const settingsApi = {
  getWorkspaceSettings: async (): Promise<WorkspaceSettings> => {
    const { data } = await httpClient.get('/settings/workspace');
    return data;
  },
  updateWorkspaceSettings: async (settings: WorkspaceSettings): Promise<WorkspaceSettings> => {
    const { data } = await httpClient.put('/settings/workspace', settings);
    return data;
  },
  getAISettings: async (): Promise<AISettings> => {
    const { data } = await httpClient.get('/settings/ai');
    return data;
  },
  updateAISettings: async (settings: AISettings): Promise<AISettings> => {
    const { data } = await httpClient.put('/settings/ai', settings);
    return data;
  },
  getPublishingSettings: async (): Promise<PublishingSettings> => {
    const { data } = await httpClient.get('/settings/publishing');
    return data;
  },
  updatePublishingSettings: async (settings: PublishingSettings): Promise<PublishingSettings> => {
    const { data } = await httpClient.put('/settings/publishing', settings);
    return data;
  }
};
