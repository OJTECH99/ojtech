package com.melardev.spring.jwtoauth.service.interfaces;

import com.melardev.spring.jwtoauth.dtos.admin.*;
import com.melardev.spring.jwtoauth.entities.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface AdminJobService {

    // Job CRUD Operations
    Job createJobAsAdmin(Map<String, Object> jobData, UUID employerId, UUID adminId);
    Job updateJobAsAdmin(UUID jobId, Map<String, Object> jobData, UUID adminId);
    Job getJobWithAdminDetails(UUID jobId);
    boolean deleteJobAsAdmin(UUID jobId, UUID adminId);
    List<Job> getAllJobsWithAdminMetadata();
    Page<Job> getAllJobsWithAdminMetadata(Pageable pageable);

    // Advanced Search & Filtering
    Page<Job> searchJobsWithAdminFilters(AdminJobSearchDto searchDto, Pageable pageable);
    List<Job> getJobsByMultipleCriteria(AdminJobFilterDto filterDto);
    Page<Job> getJobsByEmployer(UUID employerId, Pageable pageable);
    List<Job> getJobsByCategory(UUID categoryId);
    List<Job> getJobsByLocation(String location);
    List<Job> getJobsByEmploymentType(String employmentType);

    // Bulk Operations
    BulkOperationResult bulkUpdateJobs(List<UUID> jobIds, Map<String, Object> updateData, UUID adminId);
    BulkOperationResult bulkModerateJobs(List<UUID> jobIds, JobModeration.ModerationAction action, String notes, UUID adminId);
    BulkOperationResult bulkDeleteJobs(List<UUID> jobIds, UUID adminId);
    BulkOperationResult bulkUpdateJobStatus(List<UUID> jobIds, boolean active, UUID adminId);
    BulkOperationResult bulkSetFeatured(List<UUID> jobIds, boolean featured, LocalDateTime featuredUntil, UUID adminId);
    BulkOperationResult bulkUpdatePriority(List<UUID> jobIds, Integer priority, UUID adminId);
    BulkOperationResult bulkTransferEmployer(List<UUID> jobIds, UUID newEmployerId, UUID adminId);

    // Job Moderation
    JobModeration moderateJob(UUID jobId, JobModeration.ModerationAction action, String notes, UUID adminId);
    List<JobModeration> getPendingModerationJobs();
    Page<JobModeration> getPendingModerationJobs(Pageable pageable);
    List<JobModeration> getFlaggedJobs();
    Page<JobModeration> getFlaggedJobs(Pageable pageable);
    List<JobModeration> getModerationHistory(UUID jobId);
    JobModeration getJobModerationStatus(UUID jobId);
    boolean requiresModeration(UUID jobId);

    // Admin Job Metadata Management
    AdminJobMetadata getOrCreateJobMetadata(UUID jobId, UUID adminId);
    AdminJobMetadata updateJobMetadata(UUID jobId, AdminJobMetadata metadata, UUID adminId);
    void setJobFeatured(UUID jobId, boolean featured, LocalDateTime featuredUntil, UUID adminId);
    void setJobPriority(UUID jobId, Integer priority, UUID adminId);
    void addAdminNotes(UUID jobId, String notes, UUID adminId);
    List<Job> getFeaturedJobs();
    List<Job> getHighPriorityJobs(Integer minPriority);

    // Job Performance Metrics
    JobPerformanceMetrics getJobPerformanceMetrics(UUID jobId);
    JobPerformanceMetrics updateJobPerformanceMetrics(UUID jobId);
    List<JobPerformanceMetrics> getTopPerformingJobs(int limit);
    List<JobPerformanceMetrics> getLowPerformingJobs(int limit);
    void incrementJobViews(UUID jobId);
    void incrementJobApplications(UUID jobId);
    void updateJobConversionMetrics(UUID jobId);

    // Statistics & Analytics
    AdminJobStatisticsDto getSystemJobStatistics(String period);
    AdminJobStatisticsDto getEmployerJobStatistics(UUID employerId, String period);
    List<Map<String, Object>> getJobAnalyticsByCategory();
    List<Map<String, Object>> getJobAnalyticsByLocation();
    List<Map<String, Object>> getJobAnalyticsByEmploymentType();
    List<Map<String, Object>> getJobTrendsByMonth(int months);
    Map<String, Object> getJobPerformanceComparison(List<UUID> jobIds);

    // Employer Job Quota Management
    EmployerJobQuota getEmployerJobQuota(UUID employerId);
    EmployerJobQuota createEmployerJobQuota(UUID employerId, Integer maxActiveJobs, Integer maxFeaturedJobs, UUID adminId);
    EmployerJobQuota updateEmployerJobQuota(UUID employerId, EmployerJobQuota quota, UUID adminId);
    boolean canEmployerCreateJob(UUID employerId);
    boolean canEmployerCreateFeaturedJob(UUID employerId);
    void incrementEmployerJobCount(UUID employerId, boolean featured);
    void decrementEmployerJobCount(UUID employerId, boolean featured);
    List<EmployerJobQuota> getEmployersAtJobLimit();
    void resetExpiredQuotas();

    // Job Category Management
    List<JobCategory> getAllJobCategories();
    List<JobCategory> getActiveJobCategories();
    JobCategory createJobCategory(String name, String description, UUID parentCategoryId, UUID adminId);
    JobCategory updateJobCategory(UUID categoryId, JobCategory category, UUID adminId);
    boolean deleteJobCategory(UUID categoryId, UUID adminId);
    void assignJobToCategory(UUID jobId, UUID categoryId);
    void removeJobFromCategory(UUID jobId, UUID categoryId);
    List<JobCategory> getJobCategories(UUID jobId);
    Map<String, Long> getJobCountByCategory();

    // Audit Trail
    void logJobAction(UUID jobId, UUID userId, String action, Map<String, Object> oldValues, Map<String, Object> newValues, String userRole, String ipAddress, String userAgent);
    List<JobAuditTrail> getJobAuditTrail(UUID jobId);
    Page<JobAuditTrail> getJobAuditTrail(UUID jobId, Pageable pageable);
    List<JobAuditTrail> getAdminActionHistory(UUID adminId, LocalDateTime startDate, LocalDateTime endDate);
    Page<JobAuditTrail> getSystemAuditTrail(Pageable pageable);
    void cleanupOldAuditTrails(LocalDateTime cutoffDate);

    // Cross-Employer Operations
    List<Job> getJobsAcrossAllEmployers(AdminJobFilterDto filterDto);
    Map<String, Object> compareEmployerJobPerformance(List<UUID> employerIds);
    List<Map<String, Object>> getEmployerJobStatisticsComparison();
    Map<String, Object> getSystemHealthMetrics();

    // Data Export & Import
    List<Map<String, Object>> exportJobsData(AdminJobFilterDto filterDto);
    List<Map<String, Object>> exportJobStatistics(String period);
    BulkOperationResult importJobsData(List<Map<String, Object>> jobsData, UUID adminId);

    // Validation & Business Logic
    boolean validateJobData(Map<String, Object> jobData);
    boolean validateAdminPermissions(UUID adminId, String operation);
    boolean canAdminAccessJob(UUID adminId, UUID jobId);
    boolean isJobEditable(UUID jobId);
    List<String> validateJobForModeration(UUID jobId);

    // Notification & Communication
    void notifyEmployerOfJobStatusChange(UUID jobId, String status, String reason);
    void notifyAdminsOfJobAction(UUID jobId, String action, UUID adminId);
    void sendJobPerformanceReport(UUID employerId, String period);

    // System Maintenance
    void updateExpiredFeaturedJobs();
    void recalculateJobPerformanceMetrics();
    void updateJobModerationQueues();
    void cleanupInactiveJobs(LocalDateTime cutoffDate);
    Map<String, Object> getSystemMaintenanceStatus();
    
    // Job Filters
    AdminJobFilterDto getJobFilters();
}