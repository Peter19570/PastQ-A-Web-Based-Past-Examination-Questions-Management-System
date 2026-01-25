import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService, LoginData, RegisterData } from "../services/auth";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  reputation: number;
  total_uploads: number;
  total_downloads: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          const profile = await authService.getProfile();
          setUser(profile);
          localStorage.setItem("user", JSON.stringify(profile));
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    const response = await authService.login(data);
    const access = response.tokens?.access;
    const refresh = response.tokens?.refresh;
    const userData = response.user;

    if (access && refresh) {
      // 1. Save the tokens
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      // 2. Save the user data directly from the login response
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      // 3. Redirect to Dashboard
      window.location.href = "/dashboard";
    } else {
      console.error(
        "Token naming mismatch! Expected 'tokens.access' and 'tokens.refresh'",
        response,
      );
    }
  };

  const register = async (data: RegisterData) => {
    const response = await authService.register(data);

    const access = response.tokens?.access;
    const refresh = response.tokens?.refresh;
    const userData = response.user;

    if (access && refresh) {
      // 1. Save the tokens immediately
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      // 2. Set the user state so the UI updates
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      // 3. Redirect to Dashboard
      window.location.href = "/dashboard";
    } else {
      // Fallback: If for some reason tokens aren't returned, try manual login
      await login({
        index_number: data.index_number,
        password: data.password,
      });
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      // Attempt to notify backend, but don't let it block the UI cleanup
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error("Backend logout failed, but clearing local session anyway");
    } finally {
      // ALWAYS clear local state regardless of server response
      localStorage.clear();
      setUser(null);
      window.location.href = "/login"; // Force redirect
    }
  };

  const refreshUser = async () => {
    if (user) {
      const profile = await authService.getProfile();
      setUser(profile);
      localStorage.setItem("user", JSON.stringify(profile));
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.is_staff || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
