import api from './api';

export interface PastQuestion {
  id: number;
  course: {
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
  status: 'pending' | 'approved' | 'rejected';
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface PastQuestionUpload {
  course: string;
  title: string;
  year: number;
  semester: 'First' | 'Second' | 'Summer';
  file: File;
}

export const pastQuestionsService = {
  getAll: async (params?: {
    search?: string;
    course?: string;
    year?: number;
    semester?: string;
    page?: number;
  }) => {
    const response = await api.get('/past-questions/', { params });
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

  upload: async (data: PastQuestionUpload) => {
    const formData = new FormData();
    formData.append('course', data.course);
    formData.append('title', data.title);
    formData.append('year', data.year.toString());
    formData.append('semester', data.semester);
    formData.append('file', data.file);

    const response = await api.post('/past-questions/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

  reject: async (id: number, reason?: string) => {
    const response = await api.post(`/past-questions/${id}/reject/`, { reason });
    return response.data;
  },

  download: async (id: number) => {
    const response = await api.get(`/past-questions/${id}/download/`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
