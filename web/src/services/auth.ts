import { apiClient } from './api';
import { useAuthStore } from '../store/authStore';

export interface SignupData {
  email: string;
  password: string;
  ageVerified: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    subscriptionTier: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/signup', data);
    const { accessToken, refreshToken, user } = response.data;
    
    useAuthStore.getState().setAuth(user, accessToken, refreshToken);
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', data);
    const { accessToken, refreshToken, user } = response.data;
    
    useAuthStore.getState().setAuth(user, accessToken, refreshToken);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignore errors on logout
    }
    useAuthStore.getState().logout();
  },
};

