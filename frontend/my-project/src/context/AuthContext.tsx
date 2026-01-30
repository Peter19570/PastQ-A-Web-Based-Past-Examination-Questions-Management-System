import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService, LoginData, RegisterData } from "../services/auth";
import { useNavigate } from "react-router-dom";
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  index_number: string;
  reputation_score: number;
  upload_count: number;
  successful_uploads: number;
  download_count: number;
  is_staff: boolean;
  is_admin: boolean;
  is_moderator: boolean;
  profile_picture?: string | null;
}

// 2. Updated Context Interface: Fixes "setUser is missing"
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void; // Tell TS this exists
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          const response = await authService.getProfile();

          // 3. Fixes "Property user does not exist on type UserProfile"
          // Use a type assertion (as any) to bridge the gap if the service type is outdated
          const profile = (response as any).user || response;

          setUser(profile);
          localStorage.setItem("user", JSON.stringify(profile));
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          handleLocalClear();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const handleLocalClear = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  const login = async (data: LoginData) => {
    const response = await authService.login(data);
    const access = response.tokens?.access;
    const refresh = response.tokens?.refresh;
    const userData = response.user;

    if (access && refresh && userData) {
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      const userWithRoles = {
        ...userData,
        isAdmin: userData.is_admin || userData.is_staff,
        isModerator: userData.is_moderator || userData.is_staff,
      };

      localStorage.setItem("user", JSON.stringify(userWithRoles));
      setUser(userWithRoles);

      if (userWithRoles.isAdmin || userWithRoles.isModerator) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      const access = response.tokens?.access;
      const refresh = response.tokens?.refresh;
      const userData = response.user;

      if (access && refresh && userData) {
        localStorage.setItem("accessToken", access);
        localStorage.setItem("refreshToken", refresh);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Registration failed:", error.response?.data);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error("Logout failed");
    } finally {
      handleLocalClear();
      navigate("/login");
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getProfile();
      const profile = (response as any).user || response;
      setUser(profile);
      localStorage.setItem("user", JSON.stringify(profile));
    } catch (error) {
      console.error("Refresh user failed:", error);
    }
  };

  // 4. The Value object: Fixes image_724773.png
  const value = {
    user,
    setUser, // Must be passed here!
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.is_staff || user?.is_admin || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-[#0f172a]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
