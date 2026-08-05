import { httpClient } from './httpClient';
import { API_BASE_URL } from './apiConstants';

export interface PlatformRuleValidation {
  rule_name: string;
  is_valid: number;
  feedback: string;
}

export interface PlatformVariation {
  id: number;
  variation_label: string;
  title?: string;
  body: string;
  hashtags?: string[];
  optimization_score?: number;
  reasoning?: string;
  rule_validations: PlatformRuleValidation[];
}

export interface PlatformContent {
  id: number;
  platform_name: string;
  status: string;
  variations: PlatformVariation[];
}

export const contentApi = {
  getSlots: async (businessId: number = 1) => {
    return httpClient(`/content/slots?business_id=${businessId}`);
  },

  generateForSlot: async (slotId: number) => {
    return httpClient.post(`/content/generate/${slotId}`);
  },

  getGeneratedContent: async (slotId: number) => {
    return httpClient(`/content/slot/${slotId}`);
  },

  generatePlatformContent: async (contentId: number, platform: string) => {
    return httpClient.post(`/content/generate-platform/${contentId}?platform=${platform}`);
  },

  generateAllPlatforms: async (contentId: number) => {
    return httpClient.post(`/content/generate-all-platforms/${contentId}`);
  },

  getPlatformVariations: async (contentId: number, platformName: string) => {
    return httpClient(`/content/platform/${contentId}/${platformName}`);
  }
};
