import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Keycloak configuration
// Use your computer's IP address for mobile devices
const KEYCLOAK_URL = "http://10.1.3.50:8080";
const REALM = "myrealm";
const CLIENT_ID = "edu-bridge-frontend";

// Storage keys
const TOKEN_KEY = "keycloak_access_token";
const REFRESH_TOKEN_KEY = "keycloak_refresh_token";
const USER_INFO_KEY = "keycloak_user_info";

// Interfaces
export interface KeycloakUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  emailVerified: boolean;
  name: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: KeycloakUser;
  tokens?: AuthTokens;
  error?: string;
}

class KeycloakService {
  private baseUrl: string;
  private realm: string;
  private clientId: string;

  constructor() {
    this.baseUrl = KEYCLOAK_URL;
    this.realm = REALM;
    this.clientId = CLIENT_ID;
  }

  /**
   * Get the authorization URL for login
   */
  getAuthorizationUrl(): string {
    const redirectUri =
      Platform.OS === "web" ? "http://localhost:8081" : "exp://localhost:8081";

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid profile email",
      state: "login",
    });

    return `${this.baseUrl}/realms/${
      this.realm
    }/protocol/openid-connect/auth?${params.toString()}`;
  }

  /**
   * Login with username and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const tokenUrl = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`;

      const body = new URLSearchParams({
        grant_type: "password",
        client_id: this.clientId,
        username: credentials.username,
        password: credentials.password,
        scope: "openid profile email",
      });

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error_description || "Login failed",
        };
      }

      const tokenData = await response.json();

      // Get user info
      const userInfo = await this.getUserInfo(tokenData.access_token);

      if (!userInfo) {
        return {
          success: false,
          error: "Failed to get user information",
        };
      }

      // Store tokens and user info
      await this.storeTokens({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        tokenType: tokenData.token_type,
      });

      await this.storeUserInfo(userInfo);

      return {
        success: true,
        user: userInfo,
        tokens: {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresIn: tokenData.expires_in,
          tokenType: tokenData.token_type,
        },
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "Network error during login",
      };
    }
  }

  /**
   * Get user information from Keycloak
   */
  private async getUserInfo(accessToken: string): Promise<KeycloakUser | null> {
    try {
      const userInfoUrl = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`;

      const response = await fetch(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const userData = await response.json();

      return {
        id: userData.sub,
        username: userData.preferred_username,
        email: userData.email,
        firstName: userData.given_name,
        lastName: userData.family_name,
        roles: userData.realm_access?.roles || [],
        emailVerified: userData.email_verified,
        name: userData.name,
      };
    } catch (error) {
      console.error("Get user info error:", error);
      return null;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = await this.getRefreshToken();

      if (!refreshToken) {
        return {
          success: false,
          error: "No refresh token available",
        };
      }

      const tokenUrl = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`;

      const body = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: this.clientId,
        refresh_token: refreshToken,
      });

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (!response.ok) {
        // Refresh failed, user needs to login again
        await this.logout();
        return {
          success: false,
          error: "Token refresh failed",
        };
      }

      const tokenData = await response.json();

      // Store new tokens
      await this.storeTokens({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        tokenType: tokenData.token_type,
      });

      return {
        success: true,
        tokens: {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresIn: tokenData.expires_in,
          tokenType: tokenData.token_type,
        },
      };
    } catch (error) {
      console.error("Refresh token error:", error);
      return {
        success: false,
        error: "Network error during token refresh",
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();

      if (accessToken) {
        // Call Keycloak logout endpoint
        const logoutUrl = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/logout`;

        await fetch(logoutUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: this.clientId,
            refresh_token: (await this.getRefreshToken()) || "",
          }),
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage regardless of Keycloak logout result
      await this.clearStorage();
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    return !!accessToken;
  }

  /**
   * Get current access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error("Get access token error:", error);
      return null;
    }
  }

  /**
   * Get current refresh token
   */
  private async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Get refresh token error:", error);
      return null;
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<KeycloakUser | null> {
    try {
      const userInfoString = await AsyncStorage.getItem(USER_INFO_KEY);
      return userInfoString ? JSON.parse(userInfoString) : null;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }

  /**
   * Store tokens in AsyncStorage
   */
  private async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, tokens.accessToken);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    } catch (error) {
      console.error("Store tokens error:", error);
    }
  }

  /**
   * Store user info in AsyncStorage
   */
  private async storeUserInfo(userInfo: KeycloakUser): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    } catch (error) {
      console.error("Store user info error:", error);
    }
  }

  /**
   * Clear all stored data
   */
  private async clearStorage(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_INFO_KEY,
      ]);
    } catch (error) {
      console.error("Clear storage error:", error);
    }
  }
}

export default new KeycloakService();
