import { httpClient } from './httpClient';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  metadata_info?: any;
  created_at: string;
}

export const notificationsApi = {
  getNotifications: async (): Promise<Notification[]> => {
    const { data } = await httpClient.get('/notifications');
    return data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await httpClient.post(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await httpClient.post('/notifications/read-all');
  }
};
