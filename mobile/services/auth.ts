import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api';

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
    
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
      ['user', JSON.stringify(user)],
    ]);

    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', data);
    const { accessToken, refreshToken, user } = response.data;
    
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
      ['user', JSON.stringify(user)],
    ]);

    return response.data;
  },

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  },

  async getCurrentUser() {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('accessToken');
    return !!token;
  },
};

