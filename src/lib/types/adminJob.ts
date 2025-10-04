// Admin Job Management Types

export interface AdminJob {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  jobType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'TEMPORARY';
  workMode?: 'REMOTE' | 'ON_SITE' | 'HYBRID';
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'EXPIRED' | 'DRAFT';
  postedAt: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  employer?: {
    id: string;
    companyName: string;
    email: string;
  };
  category?: {
    id: string;
    name: string;
  };
  // Admin-specific fields
  adminMetadata?: AdminJobMetadata;
  moderationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
  isFeatured: boolean;
  featuredUntil?: string;
  priority: number;
  viewCount: number;
  applicationCount: number;
  lastModeratedAt?: string;
  lastModeratedBy?: string;
}

export interface AdminJobMetadata {
  id: string;
  jobId: string;
  adminNotes?: string;
  internalTags?: string[];
  qualityScore: number;
  flagReason?: string;
  isHighPriority: boolean;
  sourceChannel?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

export interface JobModeration {
  id: string;
  jobId: string;
  action: 'APPROVE' | 'REJECT' | 'FLAG' | 'UNFLAG';
  notes?: string;
  moderatedAt: string;
  moderatedBy: string;
  previousStatus?: string;
  newStatus?: string;
}

export interface JobPerformanceMetrics {
  id: string;
  jobId: string;
  viewCount: number;
  applicationCount: number;
  clickThroughRate: number;
  conversionRate: number;
  avgTimeOnPage: number;
  bounceRate: number;
  geographicViews: Record<string, number>;
  deviceBreakdown: Record<string, number>;
  trafficSources: Record<string, number>;
  lastCalculatedAt: string;
}

export interface JobAuditTrail {
  id: string;
  jobId: string;
  action: string;
  fieldName?: string;
  oldValue?: any;
  newValue?: any;
  changedBy: string;
  changedAt: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface JobCategory {
  id: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  isActive: boolean;
  sortOrder: number;
  jobCount: number;
  createdAt: string;
  updatedAt: string;
  children?: JobCategory[];
  parent?: JobCategory;
}

export interface JobQuota {
  id: string;
  employerId: string;
  quotaType: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'TOTAL';
  maxJobs: number;
  usedJobs: number;
  resetDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Search and Filter DTOs
export interface AdminJobSearchDto {
  keywords?: string;
  employerId?: string;
  categoryId?: string;
  status?: string[];
  jobType?: string[];
  workMode?: string[];
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  postedAfter?: string;
  postedBefore?: string;
  expiringBefore?: string;
  moderationStatus?: string[];
  isFeatured?: boolean;
  priority?: number;
  minApplications?: number;
  maxApplications?: number;
  minViews?: number;
  maxViews?: number;
  hasAdminNotes?: boolean;
  internalTags?: string[];
  qualityScoreMin?: number;
  qualityScoreMax?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface AdminJobFilterDto {
  employers: Array<{ id: string; name: string; jobCount: number }>;
  categories: Array<{ id: string; name: string; jobCount: number }>;
  statuses: Array<{ value: string; label: string; count: number }>;
  jobTypes: Array<{ value: string; label: string; count: number }>;
  workModes: Array<{ value: string; label: string; count: number }>;
  moderationStatuses: Array<{ value: string; label: string; count: number }>;
  locations: Array<{ value: string; label: string; count: number }>;
  salaryRanges: Array<{ min: number; max: number; count: number }>;
  dateRanges: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    last3Months: number;
  };
}

// Bulk Operations
export interface BulkOperationRequest {
  jobIds: string[];
  operation: 'DELETE' | 'ACTIVATE' | 'DEACTIVATE' | 'FEATURE' | 'UNFEATURE' | 'PRIORITY' | 'MODERATE';
  parameters?: Record<string, any>;
}

export interface BulkOperationResult {
  id: string;
  operation: string;
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  processingTimeMs: number;
  startedAt: string;
  completedAt?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  errorMessage?: string;
  jobResults: Array<{
    jobId: string;
    success: boolean;
    errorMessage?: string;
  }>;
  initiatedBy: string;
}

// Statistics and Analytics
export interface AdminJobStatisticsDto {
  totalJobs: number;
  activeJobs: number;
  pendingModeration: number;
  featuredJobs: number;
  expiredJobs: number;
  jobsByStatus: Record<string, number>;
  jobsByCategory: Array<{ categoryName: string; count: number; percentage: number }>;
  jobsByEmployer: Array<{ employerName: string; count: number; percentage: number }>;
  jobsByJobType: Record<string, number>;
  jobsByWorkMode: Record<string, number>;
  averageApplicationsPerJob: number;
  averageViewsPerJob: number;
  topPerformingJobs: Array<{
    id: string;
    title: string;
    applicationCount: number;
    viewCount: number;
  }>;
  recentActivity: Array<{
    date: string;
    newJobs: number;
    applications: number;
    views: number;
  }>;
  salaryAnalytics: {
    averageSalary: number;
    medianSalary: number;
    salaryDistribution: Array<{ range: string; count: number }>;
  };
  geographicDistribution: Record<string, number>;
  moderationMetrics: {
    pendingCount: number;
    approvedToday: number;
    rejectedToday: number;
    avgModerationTime: number;
  };
}

// API Response Types
export interface AdminJobListResponse {
  jobs: AdminJob[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface AdminJobDetailsResponse {
  job: AdminJob;
  metadata: AdminJobMetadata;
  metrics: JobPerformanceMetrics;
  auditTrail: JobAuditTrail[];
  moderationHistory: JobModeration[];
}

// Form Types
export interface AdminJobFormData {
  title: string;
  description: string;
  requirements: string;
  location: string;
  jobType: string;
  workMode: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  categoryId?: string;
  expiresAt?: string;
  employerId: string;
  // Admin-specific fields
  status: string;
  isFeatured: boolean;
  featuredUntil?: string;
  priority: number;
  adminNotes?: string;
  internalTags?: string[];
  qualityScore: number;
  isHighPriority: boolean;
  sourceChannel?: string;
}

export interface ModerationFormData {
  action: 'APPROVE' | 'REJECT' | 'FLAG' | 'UNFLAG';
  notes?: string;
}

// UI State Types
export interface AdminJobsPageState {
  jobs: AdminJob[];
  filters: AdminJobFilterDto | null;
  searchCriteria: AdminJobSearchDto;
  selectedJobs: string[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  bulkOperation: {
    isProcessing: boolean;
    operation: string | null;
    result: BulkOperationResult | null;
  };
}

export interface AdminJobFormState {
  formData: AdminJobFormData;
  employers: Array<{ id: string; name: string }>;
  categories: JobCategory[];
  loading: boolean;
  saving: boolean;
  errors: Record<string, string>;
  isEditMode: boolean;
}

// Constants
export const JOB_STATUSES = [
  { value: 'ACTIVE', label: 'Active', color: 'green' },
  { value: 'INACTIVE', label: 'Inactive', color: 'gray' },
  { value: 'PENDING', label: 'Pending', color: 'yellow' },
  { value: 'EXPIRED', label: 'Expired', color: 'red' },
  { value: 'DRAFT', label: 'Draft', color: 'blue' },
] as const;

export const JOB_TYPES = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'TEMPORARY', label: 'Temporary' },
] as const;

export const WORK_MODES = [
  { value: 'REMOTE', label: 'Remote' },
  { value: 'ON_SITE', label: 'On-site' },
  { value: 'HYBRID', label: 'Hybrid' },
] as const;

export const MODERATION_STATUSES = [
  { value: 'PENDING', label: 'Pending', color: 'yellow' },
  { value: 'APPROVED', label: 'Approved', color: 'green' },
  { value: 'REJECTED', label: 'Rejected', color: 'red' },
  { value: 'FLAGGED', label: 'Flagged', color: 'orange' },
] as const;

export const BULK_OPERATIONS = [
  { value: 'DELETE', label: 'Delete Jobs', icon: 'trash', dangerous: true },
  { value: 'ACTIVATE', label: 'Activate Jobs', icon: 'play', dangerous: false },
  { value: 'DEACTIVATE', label: 'Deactivate Jobs', icon: 'pause', dangerous: false },
  { value: 'FEATURE', label: 'Feature Jobs', icon: 'star', dangerous: false },
  { value: 'UNFEATURE', label: 'Unfeature Jobs', icon: 'star-outline', dangerous: false },
  { value: 'PRIORITY', label: 'Set Priority', icon: 'flag', dangerous: false },
] as const;