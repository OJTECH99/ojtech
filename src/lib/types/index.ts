export * from './application';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  hasCompletedOnboarding?: boolean;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  userId: string;
  role: 'student' | 'employer' | 'admin';
  avatar_url?: string;
  full_name?: string;
  // Student-specific fields
  university?: string;
  major?: string;
  graduationYear?: number;
  bio?: string;
  skills?: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  cvUrl?: string;
  // Employer-specific fields
  companyName?: string;
  companySize?: string;
  industry?: string;
  companyWebsite?: string;
  companyDescription?: string;
  companyAddress?: string;
  companyLogoUrl?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  jobType: string;
  salary?: string;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  applicationDeadline?: string;
  postedDate: string;
  employerId: string;
  companyLogo?: string;
  isActive: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
} 