import api from './api';

export interface Course {
  code: string;
  title: string;
  department: string;
  faculty: string;
  description?: string;
  credit_hours?: number;
  past_questions_count?: number;
}

export interface Department {
  name: string;
  faculty: string;
  courses_count: number;
}

export interface Faculty {
  name: string;
  departments_count: number;
}

export const coursesService = {
  getAll: async (params?: { search?: string; department?: string; faculty?: string; page?: number }) => {
    const response = await api.get('/courses/', { params });
    return response.data;
  },

  getByCode: async (code: string) => {
    const response = await api.get(`/courses/${code}/`); 
    return response.data;
  },

  search: async (query: string) => {
    const response = await api.get('/courses/search/', { params: { q: query } });
    return response.data;
  },

  getDepartments: async (): Promise<Department[]> => {
    const response = await api.get('/courses/departments/');
    return response.data;
  },

  getFaculties: async (): Promise<Faculty[]> => {
    const response = await api.get('/courses/faculties/');
    return response.data;
  },

  getPopular: async () => {
    const response = await api.get('/courses/popular/');
    return response.data;
  },

  create: async (data: Partial<Course>) => {
    const response = await api.post('/courses/', data);
    return response.data;
  },

  update: async (code: string, data: Partial<Course>) => {
    const response = await api.patch(`/courses/${code}/`, data);
    return response.data;
  },

  delete: async (code: string) => {
    const response = await api.delete(`/courses/${code}/`);
    return response.data;
  },
};
