import { httpClient } from './api/httpClient';

export interface ContentImportData {
  id: number;
  source: string;
  status: string;
  size: number;
  created_at: string;
  updated_at?: string;
  language?: string;
  word_count?: number;
  processing_error?: string;
  analysis_status?: string;
  analyzed_at?: string;
}

export interface ImportedContent {
    id: number;
    import_session_id: number;
    file_name: string;
    processing_status: string;
    analysis_status: string;
    analyzed_at: string | null;
    word_count: number | null;
    language: string | null;
    created_at: string;
    error?: string;
}

export interface AnalysisData {
    id: number;
    document_type: string;
    summary: string;
    overall_confidence: number;
    analyzed_at: string;
    topics: { name: string; type: string; confidence: number }[];
    keywords: { name: string; type: string }[];
    writing_styles: string[];
    tones: { name: string; confidence: number }[];
    audiences: { segment: string; confidence: number }[];
    ctas: { text: string; type: string }[];
    content_pillars: string[];
}

export const contentImportService = {
  async importContent(source: string, payload: { file?: File; url?: string; text_content?: string }) {
    const formData = new FormData();
    formData.append('source', source);
    
    if (payload.file) {
      formData.append('file', payload.file);
    }
    if (payload.url) {
      formData.append('url', payload.url);
    }
    if (payload.text_content) {
      formData.append('text_content', payload.text_content);
    }

    const response = await httpClient.post('/content/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getImports(): Promise<ContentImportData[]> {
    const response = await httpClient.get('/content/imports');
    return response.data;
  },
  
  async getImportDetails(contentId: number) {
    const response = await httpClient.get(`/content/import/${contentId}`);
    return response.data;
  },

  async getAnalysis(contentId: number): Promise<AnalysisData> {
    const response = await httpClient.get(`/analysis/${contentId}`);
    return response.data;
  },

  async retryAnalysis(contentId: number) {
    const response = await httpClient.post(`/analysis/${contentId}/retry`);
    return response.data;
  },
  
  async deleteImport(id: number) {
    const response = await httpClient.delete(`/content/import/${id}`);
    return response.data;
  }
};
