import apiClient from './apiClient';
import { JobApplication, ApplicationStatus } from '../types/application';

const API_URL = '/applications';

// Job matching interfaces
interface JobEmployer {
  id: string;
  companyName: string;
  industry?: string;
  location?: string;
  companySize?: string;
  companyDescription?: string;
  websiteUrl?: string;
  logoUrl?: string;
  description?: string;
  website?: string;
}

interface JobDetails {
  id: string;
  title: string;
  description: string;
  location: string;
  requiredSkills: string;
  employmentType: string;
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  postedAt: string;
  employer: JobEmployer;
}

interface JobMatch {
  id: string;
  job: JobDetails;
  matchScore: number;
  matchedAt: string;
  matchDetails?: string;
  viewed: boolean;
}

// Get all applications for the logged-in student
const getStudentApplications = async (): Promise<JobApplication[]> => {
  console.log('Fetching student applications from:', API_URL);
  const response = await apiClient.get(API_URL);
  return response.data;
};

// Get all applications for a specific job (for employers)
const getJobApplications = async (jobId: string): Promise<JobApplication[]> => {
  console.log("jobApplicationService.getJobApplications called with jobId:", jobId);
  const response = await apiClient.get(`${API_URL}/job/${jobId}`);
  return response.data;
};

// Get job matches for the logged-in student
const getStudentJobMatches = async (): Promise<JobMatch[]> => {
  const response = await apiClient.get('/student/job-matches');
  return response.data;
};

// Apply for a job
const applyForJob = async (
  jobId: string, 
  applicationData: { 
    cvId?: string, 
    coverLetter?: string 
  }
): Promise<JobApplication> => {
  const response = await apiClient.post(`${API_URL}/apply/${jobId}`, applicationData);
  return response.data;
};

// Update application status (for employers)
const updateApplicationStatus = async (
  applicationId: string, 
  statusData: { 
    status: ApplicationStatus, 
    feedback?: string 
  }
): Promise<JobApplication> => {
  console.log("jobApplicationService.updateApplicationStatus called with:", applicationId, statusData);
  const response = await apiClient.put(`${API_URL}/${applicationId}/status`, statusData);
  return response.data;
};

// Get a specific application by ID
const getApplicationById = async (applicationId: string): Promise<JobApplication> => {
  const response = await apiClient.get(`${API_URL}/${applicationId}`);
  return response.data;
};

// Get detailed application information by ID
const getApplicationDetails = async (applicationId: string): Promise<JobApplication> => {
  console.log("jobApplicationService.getApplicationDetails called with applicationId:", applicationId);
  const response = await apiClient.get(`${API_URL}/${applicationId}`);
  return response.data;
};

// Withdraw an application (for students)
const withdrawApplication = async (applicationId: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`${API_URL}/${applicationId}`);
  return response.data;
};

// Get CV details for employers
interface CV {
  id: string;
  createdAt: string;
  updatedAt: string;
  parsedResume: string;
  lastUpdated: string;
  active: boolean;
  generated: boolean;
  certifications: any[];
  experiences: any[];
}

const getEmployerCVDetails = async (cvId: string): Promise<CV> => {
  console.log("jobApplicationService.getEmployerCVDetails called with cvId:", cvId);
  const response = await apiClient.get(`/api/cvs/employer/view/${cvId}`);
  return response.data;
};

const markJobMatchViewed = async (matchId: string): Promise<{ success: boolean }> => {
  const response = await apiClient.put(`/api/student/job-matches/${matchId}/viewed`);
  return response.data;
};

// Find jobs using simple search endpoint
const findJobs = async (): Promise<JobDetails[]> => {
  const response = await apiClient.get('/simple-findjobs');
  return response.data;
};

// Email draft interface
export interface EmailDraft {
  to: string;
  toName: string;
  subject: string;
  body: string;
  cvUrl: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentUniversity: string;
  studentMajor: string;
}

// Prepare email draft for sending application
const prepareApplicationEmail = async (applicationId: string): Promise<EmailDraft> => {
  const response = await apiClient.get(`${API_URL}/${applicationId}/prepare-email`);
  return response.data;
};

// Send application email to employer
const sendApplicationEmail = async (
  applicationId: string,
  emailData: {
    subject: string;
    emailBody: string;
  },
  attachments?: File[]
): Promise<{ success: boolean; message: string; emailsSentToday: number; emailsRemaining: number }> => {
  const formData = new FormData();
  formData.append('subject', emailData.subject);
  formData.append('emailBody', emailData.emailBody);
  
  // Add file attachments if any
  if (attachments && attachments.length > 0) {
    attachments.forEach((file) => {
      formData.append('attachments', file);
    });
  }
  
  const response = await apiClient.post(`${API_URL}/${applicationId}/send-email`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const jobApplicationService = {
  getStudentApplications,
  getJobApplications,
  applyForJob,
  updateApplicationStatus,
  getApplicationById,
  withdrawApplication,
  getEmployerCVDetails,
  getStudentJobMatches,
  markJobMatchViewed,
  findJobs,
  getApplicationDetails,
  prepareApplicationEmail,
  sendApplicationEmail,
};

export default jobApplicationService;