import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

export interface CreateUserRequest {
  email: string;
  fullName: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  password: string;
  section?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT';
    sectionId: string | null;
    isActive: boolean;
  };
}

export interface CreateSectionRequest {
  name: string;
  gradeLevel: string;
  capacity: number;
}

export interface SectionResponse {
  id: string;
  name: string;
  gradeLevel: string;
  inviteCode: string;
  studentCount: number;
  activeStudents: number;
  averageProgress: number;
}

export interface RegisterSectionRequest {
  registrationCode: string;
}

export interface SubmitActivityRequest {
  answers: any[];
  timeSpentSeconds: number;
}

export interface ActivitySubmissionResponse {
  score: number;
  percentage: number;
  isCompleted: boolean;
  correctAnswers: number;
  totalQuestions: number;
  nextActivity?: {
    id: string;
    type: string;
  };
}

// Auth API
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getUsers: async (page = 0, size = 10, role?: string) => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (role) params.append('role', role);
    const response = await api.get(`/admin/users?${params}`);
    return response.data;
  },

  createUser: async (data: CreateUserRequest) => {
    const response = await api.post('/admin/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: any) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
};

// Teacher API
export const teacherAPI = {
  getSections: async (): Promise<SectionResponse[]> => {
    const response = await api.get('/teacher/sections');
    return response.data;
  },

  createSection: async (data: CreateSectionRequest): Promise<SectionResponse> => {
    const response = await api.post('/teacher/sections', data);
    return response.data;
  },

  getSectionDetails: async (id: string): Promise<SectionResponse> => {
    const response = await api.get(`/teacher/sections/${id}`);
    return response.data;
  },
};

// Student API
export const studentAPI = {
  registerToSection: async (data: RegisterSectionRequest) => {
    const response = await api.post('/student/register-section', data);
    return response.data;
  },

  getLessons: async () => {
    const response = await api.get('/student/lessons');
    return response.data;
  },

  getLessonContent: async (id: string) => {
    const response = await api.get(`/student/lessons/${id}`);
    return response.data;
  },

  completeLesson: async (id: string) => {
    const response = await api.post(`/student/lessons/${id}/complete`);
    return response.data;
  },

  getActivityContent: async (id: string) => {
    const response = await api.get(`/student/activities/${id}`);
    return response.data;
  },

  submitActivity: async (id: string, data: SubmitActivityRequest): Promise<ActivitySubmissionResponse> => {
    const response = await api.post(`/student/activities/${id}/submit`, data);
    return response.data;
  },
};

export default api;
