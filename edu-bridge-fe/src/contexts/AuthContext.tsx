import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import KeycloakService, {
  KeycloakUser,
  LoginCredentials,
  AuthResponse,
} from "../services/keycloakService";

interface AuthContextType {
  user: KeycloakUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<KeycloakUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const authenticated = await KeycloakService.isAuthenticated();

      if (authenticated) {
        const currentUser = await KeycloakService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Check auth status error:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    credentials: LoginCredentials
  ): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const result = await KeycloakService.login(credentials);

      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }

      return result;
    } catch (error) {
      console.error("Login error:", error);
      const errorResult: AuthResponse = {
        success: false,
        error: "Login failed",
      };
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await KeycloakService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<AuthResponse> => {
    try {
      const result = await KeycloakService.refreshToken();

      if (!result.success) {
        // Token refresh failed, logout user
        await logout();
      }

      return result;
    } catch (error) {
      console.error("Refresh token error:", error);
      await logout();
      return {
        success: false,
        error: "Token refresh failed",
      };
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
