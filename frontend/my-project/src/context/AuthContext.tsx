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

  // Updated to accept LoginData object (index_number, password)
  const login = async (data: LoginData) => {
    const response = await authService.login(data);
    localStorage.setItem("accessToken", response.access);
    localStorage.setItem("refreshToken", response.refresh);

    const profile = await authService.getProfile();
    setUser(profile);
    localStorage.setItem("user", JSON.stringify(profile));
  };

  // Updated to accept RegisterData object
  const register = async (data: RegisterData) => {
    await authService.register(data);
    // Automatically log in using the same credentials after successful registration
    await login({
      index_number: data.index_number,
      password: data.password,
    });
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
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
