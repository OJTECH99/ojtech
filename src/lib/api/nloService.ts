import apiClient from './apiClient';

// Types
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  university: string;
  major: string;
  graduationYear: number;
  profilePictureUrl?: string;
  verified: boolean;
  verifiedAt?: string;
  verificationNotes?: string;
  hasCompletedOnboarding: boolean;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  cvCount?: number;
  applicationCount?: number;
  certificationCount?: number;
  experienceCount?: number;
  location?: string;
  role?: string;
  skills?: string[] | string;
  certifications?: any[];
  experiences?: any[];
  githubProjects?: any[];
  cvs?: any[];
  bio?: string;
  preojtOrientationUrl?: string;
  activeCvId?: string;
}

interface VerificationStats {
  totalStudents: number;
  verifiedStudents: number;
  unverifiedStudents: number;
  verificationRate: number;
}

// Student Verification Management
const getStudentsForVerification = async (verified?: boolean): Promise<Student[]> => {
  const response = await apiClient.get('nlo/students', {
    params: { verified }
  });
  // Handle direct array response
  return Array.isArray(response.data) ? response.data : [];
};

const getStudentDetails = async (id: string): Promise<Student> => {
  const response = await apiClient.get(`nlo/students/${id}`);
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
    data.githubProjects = Array.isArray(data.githubProjects) ? data.githubProjects : [];
    data.cvs = Array.isArray(data.cvs) ? data.cvs : [];
  }
  
  return data;
};

const verifyStudent = async (id: string, notes?: string): Promise<any> => {
  const response = await apiClient.put(`nlo/students/${id}/verify`, { notes });
  return response.data;
};

const unverifyStudent = async (id: string, notes?: string): Promise<any> => {
  const response = await apiClient.put(`nlo/students/${id}/unverify`, { notes });
  return response.data;
};

const getVerificationStats = async (): Promise<VerificationStats> => {
  const response = await apiClient.get('nlo/students/verification-stats');
  return response.data;
};

// Batch operations for NLO efficiency
const batchVerifyStudents = async (studentIds: string[], notes?: string): Promise<any> => {
  const promises = studentIds.map(id => verifyStudent(id, notes));
  return Promise.all(promises);
};

const batchUnverifyStudents = async (studentIds: string[], notes?: string): Promise<any> => {
  const promises = studentIds.map(id => unverifyStudent(id, notes));
  return Promise.all(promises);
};

// Search and filter functions for NLO workflow
const searchStudentsByUniversity = async (university: string, verified?: boolean): Promise<Student[]> => {
  const students = await getStudentsForVerification(verified);
  return students.filter(student => 
    student.university?.toLowerCase().includes(university.toLowerCase())
  );
};

const searchStudentsByMajor = async (major: string, verified?: boolean): Promise<Student[]> => {
  const students = await getStudentsForVerification(verified);
  return students.filter(student => 
    student.major?.toLowerCase().includes(major.toLowerCase())
  );
};

const getStudentsByGraduationYear = async (year: number, verified?: boolean): Promise<Student[]> => {
  const students = await getStudentsForVerification(verified);
  return students.filter(student => student.graduationYear === year);
};

// Company Management Types
interface Company {
  id: string;
  name: string;
  website?: string;
  description?: string;
  location?: string;
  email: string;
  phone?: string;
  industry?: string;
  companySize?: string;
  logoUrl?: string;
  hrName?: string;
  hrEmail?: string;
  hrPhone?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  jobId?: string;
}

interface CompanyCreateRequest {
  name: string;
  website?: string;
  description?: string;
  location?: string;
  email: string;
  phone?: string;
  industry?: string;
  companySize?: string;
  logoUrl?: string;
  hrName?: string;
  hrEmail?: string;
  hrPhone?: string;
}

// Company Management Functions
const getAllCompanies = async (): Promise<Company[]> => {
  const response = await apiClient.get('nlo/companies');
  return Array.isArray(response.data) ? response.data : [];
};

const getActiveCompanies = async (): Promise<Company[]> => {
  const response = await apiClient.get('nlo/companies/active');
  return Array.isArray(response.data) ? response.data : [];
};

const getCompanyById = async (id: string): Promise<Company> => {
  const response = await apiClient.get(`nlo/companies/${id}`);
  return response.data;
};

const createCompany = async (companyData: CompanyCreateRequest): Promise<Company> => {
  const response = await apiClient.post('nlo/companies', companyData);
  return response.data;
};

const updateCompany = async (id: string, companyData: CompanyCreateRequest): Promise<Company> => {
  const response = await apiClient.put(`nlo/companies/${id}`, companyData);
  return response.data;
};

const deactivateCompany = async (id: string): Promise<Company> => {
  const response = await apiClient.patch(`nlo/companies/${id}/deactivate`);
  return response.data;
};

const activateCompany = async (id: string): Promise<Company> => {
  const response = await apiClient.patch(`nlo/companies/${id}/activate`);
  return response.data;
};

const nloService = {
  // Core verification functions
  getStudentsForVerification,
  getStudentDetails,
  verifyStudent,
  unverifyStudent,
  getVerificationStats,
  
  // Batch operations
  batchVerifyStudents,
  batchUnverifyStudents,
  
  // Search and filter functions
  searchStudentsByUniversity,
  searchStudentsByMajor,
  getStudentsByGraduationYear,
  
  // Company management functions
  getAllCompanies,
  getActiveCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deactivateCompany,
  activateCompany,
};

export default nloService;
export type { Student, VerificationStats, Company, CompanyCreateRequest };
