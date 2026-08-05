import { httpClient } from './httpClient';

export interface AuthUser {
  id: number;
  email: string;
  name?: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  email: string;
  name?: string | null;
}

export const authApi = {
  register: async (email: string, password: string, name?: string): Promise<TokenResponse> => {
    const { data } = await httpClient.post('/auth/register', { email, password, name });
    return data;
  },
  login: async (email: string, password: string): Promise<TokenResponse> => {
    const { data } = await httpClient.post('/auth/login', { email, password });
    return data;
  },
  me: async (): Promise<AuthUser> => {
    const { data } = await httpClient.get('/auth/me');
    return data;
  },
};
