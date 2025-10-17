import axios from "axios";

// Use your computer's IP address for mobile devices
const BASE_URL = "http://10.1.2.98:3000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

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
}

export interface UserResponse {
  user: User;
  timestamp: string;
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
