import api from './api';

export interface PastQuestion {
  id: number;
  course: string | {
    id: number;
    code: string;
    title: string;
    department: string;
    faculty: string;
    description?: string;
    credit_hours?: number;
    past_questions_count?: number;
};
  title: string;
  year: number;
  semester: 'First' | 'Second' | 'Summer';
  file: string;
  file_type: 'pdf' | 'image';
  file_size: number;
  uploader: number;
  uploader_name?: string;
  has_solutions: boolean;
  is_scanned: boolean;
  status: 'pending' | 'approved' | 'rejected';
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface PastQuestionUpload {
  course_id: number;
  year: number;
  semester: string;
  exam_type: string;
  title: string;
  file: File;
  lecturer?: string;
  has_solutions: boolean;
  is_scanned: boolean;
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const pastQuestionsService = {
  getAll: async (params?: any) => {
    const response = await api.get('/past-questions/', { params });
    return response.data;
  },

  getDownloadUrl: (id: number) => {
    // This returns the exact endpoint shown in your screenshot
    return `${API_BASE_URL}/past-questions/${id}/download/`;
  },
  
  downloadFile: async (id: number) => {
    // We use responseType: 'blob' to get the actual file data
    const response = await api.get(`/past-questions/${id}/download/`, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  upload: async (data: PastQuestionUpload) => {
    const formData = new FormData();
    
    // Append every field exactly as Django expects them
    formData.append('course_id', data.course_id.toString());
    formData.append('year', data.year.toString());
    formData.append('semester', data.semester);
    formData.append('exam_type', data.exam_type);
    formData.append('title', data.title);
    formData.append('file', data.file);
    
    if (data.lecturer) formData.append('lecturer', data.lecturer);

    // Convert booleans to strings so Django can read them from FormData
    formData.append('has_solutions', String(data.has_solutions));
    formData.append('is_scanned', String(data.is_scanned));

    const response = await api.post('/past-questions/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getById: async (id: number): Promise<PastQuestion> => {
    const response = await api.get(`/past-questions/${id}/`);
    return response.data;
  },

  search: async (query: string, filters?: { course?: string; year?: number; semester?: string }) => {
    const response = await api.get('/past-questions/search/', {
      params: { q: query, ...filters },
    });
    return response.data;
  },

  getPopular: async () => {
    const response = await api.get('/past-questions/popular/');
    return response.data;
  },

  getMyUploads: async () => {
    const response = await api.get('/past-questions/my-uploads/');
    return response.data;
  },

  getPending: async () => {
    const response = await api.get('/past-questions/pending/');
    return response.data;
  },

  update: async (id: number, data: Partial<PastQuestion>) => {
    const response = await api.patch(`/past-questions/${id}/`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/past-questions/${id}/`);
    return response.data;
  },

  approve: async (id: number) => {
    const response = await api.post(`/past-questions/${id}/approve/`);
    return response.data;
  },

  reject: async (id: number, data: { rejection_reason: string }) => {
    const response = await api.post(`/past-questions/${id}/reject/`, data);
    return response.data;
  },

  download: async (id: number) => {
    const response = await api.get(`/past-questions/${id}/download/`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
