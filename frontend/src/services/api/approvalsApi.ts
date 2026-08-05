import { httpClient } from './httpClient';

export interface ApprovalPreview {
  job_id: number;
  status: string;
  platform_name?: string | null;
  content_preview?: string | null;
  scheduled_time?: string | null;
  expires_at: string;
}

export interface ApprovalActionResult {
  job_id: number;
  status: string;
}

export interface PendingApprovalItem {
  token: string;
  job_id: number;
  platform_name?: string | null;
  content_preview?: string | null;
  recipient_email?: string | null;
  scheduled_time?: string | null;
  requested_at?: string | null;
  expires_at: string;
}

export const approvalsApi = {
  getPending: async (): Promise<PendingApprovalItem[]> => {
    const { data } = await httpClient.get('/approvals/pending');
    return data;
  },
  requestApproval: async (jobId: number, recipientEmail: string, ttlHours = 48): Promise<{ token: string; expires_at: string }> => {
    const { data } = await httpClient.post(`/approvals/jobs/${jobId}/request`, {
      recipient_email: recipientEmail,
      ttl_hours: ttlHours,
    });
    return data;
  },
  getPreview: async (token: string): Promise<ApprovalPreview> => {
    const { data } = await httpClient.get(`/approvals/${token}`);
    return data;
  },
  approve: async (token: string): Promise<ApprovalActionResult> => {
    const { data } = await httpClient.post(`/approvals/${token}/approve`);
    return data;
  },
  reject: async (token: string): Promise<ApprovalActionResult> => {
    const { data } = await httpClient.post(`/approvals/${token}/reject`);
    return data;
  },
};
