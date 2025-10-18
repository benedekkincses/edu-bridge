import axios from "axios";
import KeycloakService from "./keycloakService";

// Use your computer's IP address for mobile devices
const BASE_URL = "http://10.1.3.50:3000";

// Callback for handling authentication failures
let onAuthFailureCallback: (() => void) | null = null;

export const setAuthFailureCallback = (callback: () => void) => {
  onAuthFailureCallback = callback;
};

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

// Add response interceptor to handle token refresh and auth failures
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
        } else {
          // Token refresh failed - trigger auth failure callback
          console.log("Token refresh failed, triggering logout");
          if (onAuthFailureCallback) {
            onAuthFailureCallback();
          }
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Trigger auth failure callback
        if (onAuthFailureCallback) {
          onAuthFailureCallback();
        }
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

export interface School {
  id: string;
  name: string;
  address: string | null;
  logo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolsResponse {
  success: boolean;
  data: {
    schools: School[];
    count: number;
  };
}

export interface SchoolUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

export interface SchoolUsersResponse {
  success: boolean;
  data: {
    users: SchoolUser[];
    count: number;
  };
}

export interface ThreadParticipant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface LastMessage {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface Thread {
  threadId: string;
  type: string;
  participant: ThreadParticipant | null;
  lastMessage: LastMessage | null;
  updatedAt: string;
}

export interface ThreadsResponse {
  success: boolean;
  data: {
    threads: Thread[];
    count: number;
  };
}

export interface ThreadDetailsResponse {
  success: boolean;
  data: {
    thread: {
      threadId: string;
      type: string;
      participant: ThreadParticipant | null;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export interface MessageReadStatus {
  id: string;
  messageId: string;
  userId: string;
  readAt: string;
}

export interface MessageSender {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  attachments: any[];
  parentMessageId?: string | null;
  status: "SENT" | "SEEN";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  message_read_status?: MessageReadStatus[];
  sender?: MessageSender;
  replies?: Message[];
  _count?: {
    replies: number;
  };
}

export interface MessagesResponse {
  success: boolean;
  data: {
    messages: Message[];
    count: number;
  };
}

export interface CreateThreadResponse {
  success: boolean;
  data: {
    thread: any;
  };
}

export interface SendMessageResponse {
  success: boolean;
  data: {
    message: Message;
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

  async getSchools(): Promise<SchoolsResponse> {
    try {
      const response = await apiClient.get("/api/schools");
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // Message API methods
  async getSchoolUsers(schoolId: string): Promise<SchoolUsersResponse> {
    try {
      const response = await apiClient.get(`/api/schools/${schoolId}/users`);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async getUserThreads(): Promise<ThreadsResponse> {
    try {
      const response = await apiClient.get("/api/threads");
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async getThreadDetails(threadId: string): Promise<ThreadDetailsResponse> {
    try {
      const response = await apiClient.get(`/api/threads/${threadId}`);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async createOrGetThread(otherUserId: string): Promise<CreateThreadResponse> {
    try {
      const response = await apiClient.post("/api/threads", { otherUserId });
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async getThreadMessages(
    threadId: string,
    limit?: number,
    offset?: number
  ): Promise<MessagesResponse> {
    try {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (offset) params.append("offset", offset.toString());

      const response = await apiClient.get(
        `/api/threads/${threadId}/messages${params.toString() ? `?${params.toString()}` : ""}`
      );
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async sendMessage(
    threadId: string,
    content: string,
    parentMessageId?: string
  ): Promise<SendMessageResponse> {
    try {
      const response = await apiClient.post(`/api/threads/${threadId}/messages`, {
        content,
        parentMessageId,
      });
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async markMessageAsRead(messageId: string): Promise<any> {
    try {
      const response = await apiClient.post(`/api/messages/${messageId}/read`);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async createOrGetGroupThread(groupId: string): Promise<CreateThreadResponse> {
    try {
      const response = await apiClient.post(`/api/groups/${groupId}/thread`);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async createOrGetClassThread(classId: string): Promise<CreateThreadResponse> {
    try {
      const response = await apiClient.post(`/api/classes/${classId}/thread`);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async pollNewMessages(
    threadId: string,
    since: Date,
    timeout?: number
  ): Promise<MessagesResponse> {
    try {
      const params = new URLSearchParams();
      params.append("since", since.toISOString());
      if (timeout) params.append("timeout", timeout.toString());

      const response = await apiClient.get(
        `/api/threads/${threadId}/poll?${params.toString()}`,
        {
          // Override the default timeout for long polling (add 5s buffer)
          timeout: (timeout || 30000) + 5000,
        }
      );
      return response.data;
    } catch (error: any) {
      // Timeout is expected for long polling, return empty messages
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return {
          success: true,
          data: {
            messages: [],
            count: 0,
          },
        };
      }
      console.error("API Error:", error);
      throw error;
    }
  },

  // Class API methods
  async getUserClasses(): Promise<any> {
    try {
      const response = await apiClient.get("/api/classes");
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async getClassGroups(classId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/classes/${classId}/groups`);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async createGroup(classId: string, name: string, description?: string): Promise<any> {
    try {
      const response = await apiClient.post(`/api/classes/${classId}/groups`, {
        name,
        description,
      });
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async getClassMembers(classId: string, excludeGroupId?: string): Promise<any> {
    try {
      const params = excludeGroupId ? `?excludeGroupId=${excludeGroupId}` : "";
      const response = await apiClient.get(`/api/classes/${classId}/members${params}`);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async addUserToGroup(groupId: string, userId: string): Promise<any> {
    try {
      const response = await apiClient.post(`/api/groups/${groupId}/members`, {
        userId,
      });
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
};
