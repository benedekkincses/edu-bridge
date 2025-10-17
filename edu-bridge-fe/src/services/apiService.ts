import axios from "axios";
import KeycloakService from "./keycloakService";

// Use your computer's IP address for mobile devices
const BASE_URL = "http://10.1.2.98:3000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await KeycloakService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResult = await KeycloakService.refreshToken();
        if (refreshResult.success && refreshResult.tokens) {
          originalRequest.headers.Authorization = `Bearer ${refreshResult.tokens.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export interface HelloResponse {
  message: string;
  timestamp: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface UsersResponse {
  users: User[];
  count: number;
  timestamp: string;
  currentUser?: {
    id: string;
    username: string;
    email: string;
    roles: string[];
  };
}

export interface UserResponse {
  user: User;
  timestamp: string;
  requestedBy?: {
    id: string;
    username: string;
  };
}

export interface AuthProfileResponse {
  success: boolean;
  data: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    emailVerified: boolean;
    name: string;
  };
}

export interface AuthVerifyResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    roles: string[];
  };
}

export const apiService = {
  async getHello(): Promise<HelloResponse> {
    try {
      const response = await apiClient.get("/api/hello");
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async getUsers(): Promise<UsersResponse> {
    try {
      const response = await apiClient.get("/api/users");
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async getUserById(id: number): Promise<UserResponse> {
    try {
      const response = await apiClient.get(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async getAuthProfile(): Promise<AuthProfileResponse> {
    try {
      const response = await apiClient.get("/api/auth/profile");
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async verifyToken(): Promise<AuthVerifyResponse> {
    try {
      const response = await apiClient.get("/api/auth/verify");
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post("/api/auth/logout");
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async getRoot(): Promise<any> {
    try {
      const response = await apiClient.get("/");
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
};
