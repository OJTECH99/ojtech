import { 
  AdminJob, 
  AdminJobSearchDto, 
  AdminJobFilterDto,
  AdminJobStatisticsDto,
  AdminJobListResponse,
  AdminJobDetailsResponse,
  AdminJobFormData,
  BulkOperationRequest,
  BulkOperationResult,
  JobModeration,
  JobCategory,
  ModerationFormData,
  JobPerformanceMetrics,
  JobAuditTrail
} from '../types/adminJob';
import { normalizedApiBaseUrl } from '../../apiConfig';

const API_BASE_URL = normalizedApiBaseUrl;

class AdminJobService {
  private getAuthHeaders(): HeadersInit {
    const userStr = localStorage.getItem('user');
    let token = '';
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        token = userData.accessToken || '';
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // ===========================
  // Job CRUD Operations
  // ===========================

  /**
   * Get all jobs with admin metadata (paginated)
   */
  async getAllJobs(
    page = 0, 
    size = 10, 
    sortBy = 'postedAt', 
    direction = 'desc'
  ): Promise<AdminJobListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      direction,
    });

    const response = await fetch(`${API_BASE_URL}/admin/jobs?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<AdminJobListResponse>(response);
  }

  /**
   * Search jobs with admin filters
   */
  async searchJobs(
    searchDto: AdminJobSearchDto,
    page = 0,
    size = 10
  ): Promise<AdminJobListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/admin/jobs/search?${params}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(searchDto),
    });

    return this.handleResponse<AdminJobListResponse>(response);
  }

  /**
   * Get job with admin details
   */
  async getJobDetails(jobId: string): Promise<AdminJobDetailsResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/jobs/${jobId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<AdminJobDetailsResponse>(response);
  }

  /**
   * Create job as admin
   */
  async createJob(jobData: AdminJobFormData): Promise<AdminJob> {
    const response = await fetch(`${API_BASE_URL}/admin/jobs`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(jobData),
    });

    return this.handleResponse<AdminJob>(response);
  }

  /**
   * Update job as admin
   */
  async updateJob(jobId: string, jobData: Partial<AdminJobFormData>): Promise<AdminJob> {
    const response = await fetch(`${API_BASE_URL}/admin/jobs/${jobId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(jobData),
    });

    return this.handleResponse<AdminJob>(response);
  }

  /**
   * Delete job as admin
   */
  async deleteJob(jobId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/jobs/${jobId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  // ===========================
  // Bulk Operations
  // ===========================

  /**
   * Perform bulk operation on jobs
   */
  async performBulkOperation(
    operation: string,
    jobIds: string[],
    parameters?: Record<string, any>
  ): Promise<BulkOperationResult> {
    const operationData = {
      jobIds,
      ...parameters,
    };

    const response = await fetch(`${API_BASE_URL}/admin/jobs/bulk/${operation}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(operationData),
    });

    return this.handleResponse<BulkOperationResult>(response);
  }

  /**
   * Bulk delete jobs
   */
  async bulkDeleteJobs(jobIds: string[]): Promise<BulkOperationResult> {
    return this.performBulkOperation('delete', jobIds);
  }

  /**
   * Bulk activate jobs
   */
  async bulkActivateJobs(jobIds: string[]): Promise<BulkOperationResult> {
    return this.performBulkOperation('activate', jobIds);
  }

  /**
   * Bulk deactivate jobs
   */
  async bulkDeactivateJobs(jobIds: string[]): Promise<BulkOperationResult> {
    return this.performBulkOperation('deactivate', jobIds);
  }

  /**
   * Bulk feature jobs
   */
  async bulkFeatureJobs(jobIds: string[], featuredUntil?: string): Promise<BulkOperationResult> {
    return this.performBulkOperation('feature', jobIds, { featuredUntil });
  }

  /**
   * Bulk unfeature jobs
   */
  async bulkUnfeatureJobs(jobIds: string[]): Promise<BulkOperationResult> {
    return this.performBulkOperation('unfeature', jobIds);
  }

  /**
   * Bulk update priority
   */
  async bulkUpdatePriority(jobIds: string[], priority: number): Promise<BulkOperationResult> {
    return this.performBulkOperation('priority', jobIds, { priority });
  }

  // ===========================
  // Moderation System
  // ===========================

  /**
   * Moderate job
   */
  async moderateJob(jobId: string, moderationData: ModerationFormData): Promise<JobModeration> {
    const response = await fetch(`${API_BASE_URL}/admin/jobs/${jobId}/moderate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(moderationData),
    });

    return this.handleResponse<JobModeration>(response);
  }

  /**
   * Get job moderation history
   */
  async getModerationHistory(jobId: string): Promise<JobModeration[]> {
    const response = await fetch(`${API_BASE_URL}/admin/jobs/${jobId}/moderation-history`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<JobModeration[]>(response);
  }

  /**
   * Get pending moderation jobs
   */
  async getPendingModerationJobs(page = 0, size = 10): Promise<{
    moderations: JobModeration[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/admin/jobs/pending-moderation?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  // ===========================
  // Statistics and Analytics
  // ===========================

  /**
   * Get job statistics
   */
  async getJobStatistics(period = 'monthly'): Promise<AdminJobStatisticsDto> {
    const params = new URLSearchParams({ period });

    const response = await fetch(`${API_BASE_URL}/admin/statistics/jobs?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<AdminJobStatisticsDto>(response);
  }

  /**
   * Get employer job statistics
   */
  async getEmployerJobStatistics(employerId: string, period = 'monthly'): Promise<AdminJobStatisticsDto> {
    const params = new URLSearchParams({ period });

    const response = await fetch(`${API_BASE_URL}/admin/statistics/employers/${employerId}/jobs?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<AdminJobStatisticsDto>(response);
  }

  /**
   * Get system health metrics
   */
  async getSystemHealthMetrics(): Promise<Record<string, any>> {
    const response = await fetch(`${API_BASE_URL}/admin/system/health`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Record<string, any>>(response);
  }

  // ===========================
  // Job Categories
  // ===========================

  /**
   * Get all job categories
   */
  async getJobCategories(): Promise<JobCategory[]> {
    const response = await fetch(`${API_BASE_URL}/admin/job-categories`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<JobCategory[]>(response);
  }

  /**
   * Create job category
   */
  async createJobCategory(categoryData: {
    name: string;
    description?: string;
    parentCategoryId?: string;
  }): Promise<JobCategory> {
    const response = await fetch(`${API_BASE_URL}/admin/job-categories`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(categoryData),
    });

    return this.handleResponse<JobCategory>(response);
  }

  // ===========================
  // Filter and Search Helpers
  // ===========================

  /**
   * Get available filters for jobs
   */
  async getJobFilters(): Promise<AdminJobFilterDto> {
    // This would typically be a separate endpoint, but for now we'll simulate it
    // In a real implementation, this might be `/admin/jobs/filters`
    const response = await fetch(`${API_BASE_URL}/admin/jobs/filters`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<AdminJobFilterDto>(response);
  }

  /**
   * Get employers for dropdown/filter
   */
  async getEmployers(): Promise<Array<{ id: string; name: string; jobCount?: number }>> {
    const response = await fetch(`${API_BASE_URL}/admin/employers`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Array<{ id: string; name: string; jobCount?: number }>>(response);
  }

  // ===========================
  // Export and Reporting
  // ===========================

  /**
   * Export jobs data
   */
  async exportJobs(format: 'csv' | 'excel' | 'pdf', filters?: AdminJobSearchDto): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/admin/jobs/export/${format}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(filters || {}),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Generate job report
   */
  async generateJobReport(reportType: string, parameters?: Record<string, any>): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/admin/reports/jobs/${reportType}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(parameters || {}),
    });

    if (!response.ok) {
      throw new Error(`Report generation failed: ${response.statusText}`);
    }

    return response.blob();
  }

  // ===========================
  // Real-time Updates
  // ===========================

  /**
   * Get bulk operation status
   */
  async getBulkOperationStatus(operationId: string): Promise<BulkOperationResult> {
    const response = await fetch(`${API_BASE_URL}/admin/bulk-operations/${operationId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<BulkOperationResult>(response);
  }

  /**
   * Cancel bulk operation
   */
  async cancelBulkOperation(operationId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/bulk-operations/${operationId}/cancel`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<{ message: string }>(response);
  }
}

// Create and export singleton instance
export const adminJobService = new AdminJobService();
export default adminJobService;