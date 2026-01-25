import api from './api';

export interface RegisterData {
  index_number: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface LoginData {
  index_number: string;
  password: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
}

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  reputation: number;
  total_uploads: number;
  total_downloads: number;
}

export const authService = {
  register: async (data: RegisterData) => {
    const response = await api.post('/users/register/', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await api.post('/users/login/', data);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/users/logout/');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/users/profile/');
    return response.data;
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const response = await api.patch('/users/profile/', data);
    return response.data;
  },

  changePassword: async (data: { old_password: string; new_password: string }) => {
    const response = await api.post('/users/profile/change-password/', data);
    return response.data;
  },

  requestPasswordReset: async (email: string) => {
    const response = await api.post('/users/password-reset/', { email });
    return response.data;
  },

  confirmPasswordReset: async (id: string, data: { password: string; token: string }) => {
    const response = await api.post(`/users/password-reset-confirm/${id}/`, data);
    return response.data;
  },
};
