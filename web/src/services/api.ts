import axios, { AxiosInstance, AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
      (config) => {
        const { accessToken } = useAuthStore.getState();
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
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
          const { refreshToken, logout } = useAuthStore.getState();
          if (refreshToken) {
            try {
              const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
                refreshToken,
              });
              const { accessToken, refreshToken: newRefreshToken } = response.data;
              useAuthStore.getState().setAuth(
                useAuthStore.getState().user!,
                accessToken,
                newRefreshToken || refreshToken
              );
              // Retry original request
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${accessToken}`;
                return this.client.request(error.config);
              }
            } catch (refreshError) {
              // Refresh failed, logout
              logout();
              window.location.href = '/login';
            }
          } else {
            logout();
            window.location.href = '/login';
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

