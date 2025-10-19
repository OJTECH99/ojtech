import apiClient from './apiClient';

// Types
interface Role {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Profile {
  id: string;
  fullName: string;
  role: string;
  hasCompletedOnboarding: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  verified?: boolean;
  verifiedAt?: string;
  verificationNotes?: string;
  // Other profile fields may be present
}

interface User {
  id: string;
  username: string;
  email: string;
  roles: Role[];
  enabled: boolean;
  emailVerified: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: Profile;
}

interface Stats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
}

interface DetailedStats {
  totalUsers: number;
  userDistribution: {
    admin: number;
    employer: number;
    student: number;
  };
  totalJobs: number;
  totalApplications: number;
}

interface ApiResponse {
  users: User[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

// Dashboard Statistics
const getStats = async (): Promise<Stats> => {
  const response = await apiClient.get('admin/stats');
  return response.data;
};

const getDetailedStats = async (): Promise<DetailedStats> => {
  const response = await apiClient.get('admin/stats/detailed');
  return response.data;
};

// User Management
const getAllUsers = async (): Promise<User[]> => {
  const response = await apiClient.get('admin/users');
  return response.data;
};

const getPaginatedUsers = async (
  page = 0,
  size = 10,
  sortBy = 'username',
  direction = 'asc'
): Promise<ApiResponse> => {
  const response = await apiClient.get('admin/users/paginated', {
    params: { page, size, sortBy, direction }
  });
  return response.data;
};

const searchUsers = async (
  query?: string,
  page = 0,
  size = 10
): Promise<ApiResponse> => {
  const response = await apiClient.get('admin/users/search', {
    params: { query, page, size }
  });
  return response.data;
};

const createUser = async (userData: {
  username: string;
  email: string;
  role: string;
}): Promise<User> => {
  const response = await apiClient.post('auth/admin/create-user', userData);
  return response.data;
};

const getUserById = async (id: string): Promise<User> => {
  const response = await apiClient.get(`admin/users/${id}`);
  return response.data;
};

const updateUser = async (id: string, userData: {
  username?: string;
  email?: string;
  password?: string;
}): Promise<User> => {
  const response = await apiClient.put(`admin/users/${id}`, userData);
  return response.data;
};

const deleteUser = async (id: string): Promise<void> => {
  const response = await apiClient.delete(`admin/users/${id}`);
  return response.data;
};

const updateUserRoles = async (id: string, roles: string[]): Promise<User> => {
  const response = await apiClient.put(`admin/users/${id}/roles`, roles);
  return response.data;
};

const toggleUserStatus = async (id: string): Promise<User> => {
  const response = await apiClient.put(`admin/users/${id}/toggle-status`);
  return response.data;
};

// Jobs Management
const getPaginatedJobs = async (
  page = 0, 
  size = 10
): Promise<any> => {
  const response = await apiClient.get('admin/jobs', {
    params: { page, size }
  });
  return response.data;
};

const deleteJob = async (id: string): Promise<void> => {
  const response = await apiClient.delete(`admin/jobs/${id}`);
  return response.data;
};

// Applications Management
const getPaginatedApplications = async (
  page = 0,
  size = 10
): Promise<any> => {
  const response = await apiClient.get('admin/applications', {
    params: { page, size }
  });
  return response.data;
};

const getApplicationById = async (id: string): Promise<any> => {
  const response = await apiClient.get(`admin/applications/${id}`);
  return response.data;
};

const deleteApplication = async (id: string): Promise<void> => {
  const response = await apiClient.delete(`admin/applications/${id}`);
  return response.data;
};

// Student Verification
const getStudentsForVerification = async (verified?: boolean): Promise<any[]> => {
  const response = await apiClient.get('admin/students', {
    params: { verified }
  });
  // Handle paginated response structure
  if (response.data && response.data.students && Array.isArray(response.data.students)) {
    return response.data.students;
  }
  // Fallback for direct array response
  return Array.isArray(response.data) ? response.data : [];
};

const getStudentDetails = async (id: string): Promise<any> => {
  const response = await apiClient.get(`admin/students/${id}`);
  const data = response.data;
  // Normalize fields to ensure the UI can safely render
  if (data) {
    // skills can arrive as a comma-separated string; convert to array
    if (typeof data.skills === 'string') {
      data.skills = data.skills
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
    } else if (!Array.isArray(data.skills)) {
      data.skills = [];
    }

    // Ensure list fields are arrays
    data.certifications = Array.isArray(data.certifications) ? data.certifications : [];
    data.experiences = Array.isArray(data.experiences) ? data.experiences : [];
    data.applications = Array.isArray(data.applications) ? data.applications : [];
    data.cvs = Array.isArray(data.cvs) ? data.cvs : [];
  }
  return data;
};

const verifyStudent = async (id: string, notes?: string): Promise<any> => {
  const response = await apiClient.put(`admin/students/${id}/verify`, { notes });
  return response.data;
};

const unverifyStudent = async (id: string, notes?: string): Promise<any> => {
  const response = await apiClient.put(`admin/students/${id}/unverify`, { notes });
  return response.data;
};

const adminService = {
  // Statistics
  getStats,
  getDetailedStats,
  // User Management
  getAllUsers,
  getPaginatedUsers,
  searchUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRoles,
  toggleUserStatus,
  // Jobs Management
  getPaginatedJobs,
  deleteJob,
  // Applications Management
  getPaginatedApplications,
  getApplicationById,
  deleteApplication,
  // Student Verification
  getStudentsForVerification,
  getStudentDetails,
  verifyStudent,
  unverifyStudent,
};

export default adminService;
