export interface BusinessProfileBase {
  company_name: string;
  website?: string;
  industry: string;
  description: string;
  location?: string;
  linkedin_url?: string;
  
  products?: string[];
  services?: string[];
  usp?: string;
  
  primary_audience?: string;
  secondary_audience?: string;
  pain_points?: string[];
  customer_goals?: string[];
  
  marketing_goals?: string[];
  lead_generation_goals?: string[];
  brand_objectives?: string;
  content_objectives?: string;
  
  brand_voice: string;
  writing_style?: string;
  cta_style?: string;
  competitors?: string[];
}

export interface BusinessProfileCreate extends BusinessProfileBase {}

export interface BusinessProfileUpdate extends Partial<BusinessProfileBase> {}

export interface BusinessProfileResponse extends BusinessProfileBase {
  id: number;
  created_at: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
