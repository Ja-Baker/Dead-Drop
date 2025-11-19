import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          const refreshToken = await AsyncStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
                refreshToken,
              });
              const { accessToken, refreshToken: newRefreshToken } = response.data;
              await AsyncStorage.setItem('accessToken', accessToken);
              if (newRefreshToken) {
                await AsyncStorage.setItem('refreshToken', newRefreshToken);
              }
              // Retry original request
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${accessToken}`;
                return this.client.request(error.config);
              }
            } catch (refreshError) {
              // Refresh failed, clear tokens
              await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
              // Redirect to login
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  get instance() {
    return this.client;
  }
}

export const apiClient = new ApiClient().instance;

