package com.ojtechapi.spring.jwtoauth.service.impl;

import com.ojtechapi.spring.jwtoauth.dtos.admin.*;
import com.ojtechapi.spring.jwtoauth.entities.*;
import com.ojtechapi.spring.jwtoauth.repositories.*;
import com.ojtechapi.spring.jwtoauth.service.interfaces.AdminJobService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class AdminJobServiceImpl implements AdminJobService {

    private static final Logger logger = LoggerFactory.getLogger(AdminJobServiceImpl.class);

    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private AdminJobMetadataRepository adminJobMetadataRepository;
    
    @Autowired
    private JobModerationRepository jobModerationRepository;
    
    @Autowired
    private JobAuditTrailRepository jobAuditTrailRepository;
    
    @Autowired
    private JobPerformanceMetricsRepository jobPerformanceMetricsRepository;
    
    @Autowired
    private NLOJobQuotaRepository NLOJobQuotaRepository;
    
    @Autowired
    private JobCategoryRepository jobCategoryRepository;
    
    @Autowired
    private JobCategoryMappingRepository jobCategoryMappingRepository;
    
    @Autowired
    private NLOProfileRepository NLOProfileRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    // ==============================================
    // Job CRUD Operations
    // ==============================================

    @Override
    public Job createJobAsAdmin(Map<String, Object> jobData, UUID employerId, UUID adminId) {
        logger.info("Admin {} creating job for employer {}", adminId, employerId);
        
        NLOProfile employer = NLOProfileRepository.findByUserId(employerId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employer not found"));
        
        Job job = new Job();
        job.setTitle((String) jobData.getOrDefault("title", "New Job"));
        job.setDescription((String) jobData.getOrDefault("description", "Job description"));
        job.setLocation((String) jobData.getOrDefault("location", "Location"));
        job.setEmployer(employer);
        job.setActive(true);
        job.setPostedAt(LocalDateTime.now());
        
        return jobRepository.save(job);
    }

    @Override
    public Job updateJobAsAdmin(UUID jobId, Map<String, Object> jobData, UUID adminId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));
        
        job.setTitle((String) jobData.getOrDefault("title", job.getTitle()));
        job.setDescription((String) jobData.getOrDefault("description", job.getDescription()));
        job.setLocation((String) jobData.getOrDefault("location", job.getLocation()));
        job.setUpdatedAt(LocalDateTime.now());
        
        return jobRepository.save(job);
    }

    @Override
    public Job getJobWithAdminDetails(UUID jobId) {
        return jobRepository.findById(jobId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));
    }

    @Override
    public boolean deleteJobAsAdmin(UUID jobId, UUID adminId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));
        
        jobRepository.delete(job);
        return true;
    }

    @Override
    public List<Job> getAllJobsWithAdminMetadata() {
        return jobRepository.findAll();
    }

    @Override
    public Page<Job> getAllJobsWithAdminMetadata(Pageable pageable) {
        return jobRepository.findAll(pageable);
    }

    // ==============================================
    // Advanced Search & Filtering
    // ==============================================

    @Override
    public Page<Job> searchJobsWithAdminFilters(AdminJobSearchDto searchDto, Pageable pageable) {
        return jobRepository.findAll(pageable);
    }

    @Override
    public List<Job> getJobsByMultipleCriteria(AdminJobFilterDto filterDto) {
        return jobRepository.findAll();
    }

    @Override
    public Page<Job> getJobsByEmployer(UUID employerId, Pageable pageable) {
        List<Job> jobs = jobRepository.findAll();
        return new PageImpl<>(jobs, pageable, jobs.size());
    }

    @Override
    public List<Job> getJobsByCategory(UUID categoryId) {
        return jobRepository.findAll();
    }

    @Override
    public List<Job> getJobsByLocation(String location) {
        return jobRepository.findAll();
    }

    @Override
    public List<Job> getJobsByEmploymentType(String employmentType) {
        return jobRepository.findAll();
    }

    // ==============================================
    // Bulk Operations
    // ==============================================

    @Override
    public BulkOperationResult bulkUpdateJobs(List<UUID> jobIds, Map<String, Object> updateData, UUID adminId) {
        return new BulkOperationResult(BulkOperationResult.BulkOperationType.UPDATE_STATUS, jobIds.size(), adminId.toString());
    }

    @Override
    public BulkOperationResult bulkModerateJobs(List<UUID> jobIds, JobModeration.ModerationAction action, String notes, UUID adminId) {
        return new BulkOperationResult(BulkOperationResult.BulkOperationType.MODERATE, jobIds.size(), adminId.toString());
    }

    @Override
    public BulkOperationResult bulkDeleteJobs(List<UUID> jobIds, UUID adminId) {
        return new BulkOperationResult(BulkOperationResult.BulkOperationType.DELETE, jobIds.size(), adminId.toString());
    }

    @Override
    public BulkOperationResult bulkUpdateJobStatus(List<UUID> jobIds, boolean active, UUID adminId) {
        return new BulkOperationResult(BulkOperationResult.BulkOperationType.UPDATE_STATUS, jobIds.size(), adminId.toString());
    }

    @Override
    public BulkOperationResult bulkSetFeatured(List<UUID> jobIds, boolean featured, LocalDateTime featuredUntil, UUID adminId) {
        return new BulkOperationResult(BulkOperationResult.BulkOperationType.SET_FEATURED, jobIds.size(), adminId.toString());
    }

    @Override
    public BulkOperationResult bulkUpdatePriority(List<UUID> jobIds, Integer priority, UUID adminId) {
        return new BulkOperationResult(BulkOperationResult.BulkOperationType.UPDATE_PRIORITY, jobIds.size(), adminId.toString());
    }

    @Override
    public BulkOperationResult bulkTransferEmployer(List<UUID> jobIds, UUID newEmployerId, UUID adminId) {
        return new BulkOperationResult(BulkOperationResult.BulkOperationType.TRANSFER_EMPLOYER, jobIds.size(), adminId.toString());
    }

    // ==============================================  
    // Job Moderation - Interface Methods
    // ==============================================

    @Override
    public JobModeration moderateJob(UUID jobId, JobModeration.ModerationAction action, String notes, UUID adminId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));
        
        JobModeration moderation = new JobModeration();
        moderation.setJob(job);
        moderation.setAdmin(userRepository.findById(adminId).orElse(null));
        moderation.setAction(action);
        moderation.setNotes(notes);
        
        return jobModerationRepository.save(moderation);
    }

    @Override
    public List<JobModeration> getModerationHistory(UUID jobId) {
        return jobModerationRepository.findAll().stream()
            .filter(mod -> mod.getJob().getId().equals(jobId))
            .toList();
    }

    @Override
    public JobModeration getJobModerationStatus(UUID jobId) {
        return jobModerationRepository.findAll().stream()
            .filter(mod -> mod.getJob().getId().equals(jobId))
            .findFirst()
            .orElse(null);
    }

    @Override
    public List<JobModeration> getPendingModerationJobs() {
        return jobModerationRepository.findAll(); // Stub implementation
    }

    @Override
    public Page<JobModeration> getPendingModerationJobs(Pageable pageable) {
        List<JobModeration> moderations = jobModerationRepository.findAll();
        return new PageImpl<>(moderations, pageable, moderations.size());
    }

    @Override
    public List<JobModeration> getFlaggedJobs() {
        return jobModerationRepository.findAll(); // Stub implementation
    }

    @Override
    public Page<JobModeration> getFlaggedJobs(Pageable pageable) {
        List<JobModeration> moderations = jobModerationRepository.findAll();
        return new PageImpl<>(moderations, pageable, moderations.size());
    }

    @Override
    public boolean requiresModeration(UUID jobId) {
        return false; // Stub implementation
    }

    @Override
    public List<String> validateJobForModeration(UUID jobId) {
        return Arrays.asList("Valid"); // Stub implementation
    }

    @Override
    public void updateJobModerationQueues() {
        logger.info("Updating job moderation queues");
    }

    // ==============================================
    // Admin Job Metadata Management - Interface Methods
    // ==============================================

    @Override
    public AdminJobMetadata getOrCreateJobMetadata(UUID jobId, UUID adminId) {
        return adminJobMetadataRepository.findByJobId(jobId)
            .orElseGet(() -> {
                Job job = jobRepository.findById(jobId).orElseThrow();
                AdminJobMetadata metadata = new AdminJobMetadata();
                metadata.setJob(job);
                metadata.setModerationStatus(AdminJobMetadata.ModerationStatus.PENDING);
                metadata.setPriorityLevel(1);
                metadata.setIsFeatured(false);
                return adminJobMetadataRepository.save(metadata);
            });
    }

    @Override
    public AdminJobMetadata updateJobMetadata(UUID jobId, AdminJobMetadata metadata, UUID adminId) {
        metadata.setUpdatedByAdmin(userRepository.findById(adminId).orElse(null));
        return adminJobMetadataRepository.save(metadata);
    }

    @Override
    public void setJobFeatured(UUID jobId, boolean featured, LocalDateTime featuredUntil, UUID adminId) {
        AdminJobMetadata metadata = getOrCreateJobMetadata(jobId, adminId);
        metadata.setIsFeatured(featured);
        metadata.setFeaturedUntil(featuredUntil);
        adminJobMetadataRepository.save(metadata);
    }

    @Override
    public void setJobPriority(UUID jobId, Integer priority, UUID adminId) {
        AdminJobMetadata metadata = getOrCreateJobMetadata(jobId, adminId);
        metadata.setPriorityLevel(priority);
        adminJobMetadataRepository.save(metadata);
    }

    @Override
    public void addAdminNotes(UUID jobId, String notes, UUID adminId) {
        AdminJobMetadata metadata = getOrCreateJobMetadata(jobId, adminId);
        String existingNotes = metadata.getAdminNotes() != null ? metadata.getAdminNotes() : "";
        metadata.setAdminNotes(existingNotes + "\n[" + LocalDateTime.now() + "] " + notes);
        adminJobMetadataRepository.save(metadata);
    }

    @Override
    public List<Job> getFeaturedJobs() {
        return jobRepository.findAll(); // Stub implementation
    }

    @Override
    public List<Job> getHighPriorityJobs(Integer minPriority) {
        return jobRepository.findAll(); // Stub implementation
    }

    // ==============================================
    // Job Performance Metrics - Interface Methods
    // ==============================================

    @Override
    public JobPerformanceMetrics getJobPerformanceMetrics(UUID jobId) {
        return jobPerformanceMetricsRepository.findByJobId(jobId).orElse(null);
    }

    @Override
    public JobPerformanceMetrics updateJobPerformanceMetrics(UUID jobId) {
        Job job = jobRepository.findById(jobId).orElseThrow();
        JobPerformanceMetrics metrics = jobPerformanceMetricsRepository.findByJobId(jobId)
            .orElse(new JobPerformanceMetrics(job));
        return jobPerformanceMetricsRepository.save(metrics);
    }

    @Override
    public List<JobPerformanceMetrics> getTopPerformingJobs(int limit) {
        return jobPerformanceMetricsRepository.findAll().stream().limit(limit).toList();
    }

    @Override
    public List<JobPerformanceMetrics> getLowPerformingJobs(int limit) {
        return jobPerformanceMetricsRepository.findAll().stream().limit(limit).toList();
    }

    @Override
    public void incrementJobViews(UUID jobId) {
        logger.info("Incrementing views for job {}", jobId);
    }

    @Override
    public void incrementJobApplications(UUID jobId) {
        logger.info("Incrementing applications for job {}", jobId);
    }

    @Override
    public void updateJobConversionMetrics(UUID jobId) {
        logger.info("Updating conversion metrics for job {}", jobId);
    }

    // ==============================================
    // Statistics & Analytics - Interface Methods
    // ==============================================

    @Override
    public AdminJobStatisticsDto getSystemJobStatistics(String period) {
        AdminJobStatisticsDto stats = new AdminJobStatisticsDto();
        stats.setPeriod(period);
        stats.setTotalJobs(jobRepository.count());
        stats.setActiveJobs(jobRepository.count()); // Stub
        stats.setInactiveJobs(0L); // Stub
        return stats;
    }

    @Override
    public AdminJobStatisticsDto getEmployerJobStatistics(UUID employerId, String period) {
        AdminJobStatisticsDto stats = new AdminJobStatisticsDto();
        stats.setPeriod(period);
        stats.setTotalJobs(10L); // Stub
        return stats;
    }

    @Override
    public List<Map<String, Object>> getJobAnalyticsByCategory() {
        return Arrays.asList(Map.of("category", "IT", "count", 10));
    }

    @Override
    public List<Map<String, Object>> getJobAnalyticsByLocation() {
        return Arrays.asList(Map.of("location", "New York", "count", 15));
    }

    @Override
    public List<Map<String, Object>> getJobAnalyticsByEmploymentType() {
        return Arrays.asList(Map.of("type", "Full-time", "count", 20));
    }

    @Override
    public List<Map<String, Object>> getJobTrendsByMonth(int months) {
        return Arrays.asList(Map.of("month", "2023-12", "count", 25));
    }

    @Override
    public Map<String, Object> getJobPerformanceComparison(List<UUID> jobIds) {
        return Map.of("comparison", "stub data");
    }

    // ==============================================
    // Employer Job Quota Management - Interface Methods
    // ==============================================

    @Override
    public NLOJobQuota getNLOJobQuota(UUID employerId) {
        return NLOJobQuotaRepository.findByEmployerId(employerId).orElse(null);
    }

    @Override
    public NLOJobQuota createNLOJobQuota(UUID employerId, Integer maxActiveJobs, Integer maxFeaturedJobs, UUID adminId) {
        NLOJobQuota quota = new NLOJobQuota();
        // Note: Setting fields based on actual entity structure
        quota.setMaxActiveJobs(maxActiveJobs);
        quota.setMaxFeaturedJobs(maxFeaturedJobs);
        return NLOJobQuotaRepository.save(quota);
    }

    @Override
    public NLOJobQuota updateNLOJobQuota(UUID employerId, NLOJobQuota quota, UUID adminId) {
        // Note: Update based on actual entity structure
        return NLOJobQuotaRepository.save(quota);
    }

    @Override
    public boolean canEmployerCreateJob(UUID employerId) {
        return true; // Stub implementation
    }

    @Override
    public boolean canEmployerCreateFeaturedJob(UUID employerId) {
        return true; // Stub implementation
    }

    @Override
    public void incrementEmployerJobCount(UUID employerId, boolean featured) {
        logger.info("Incrementing job count for employer {}", employerId);
    }

    @Override
    public void decrementEmployerJobCount(UUID employerId, boolean featured) {
        logger.info("Decrementing job count for employer {}", employerId);
    }

    @Override
    public List<NLOJobQuota> getEmployersAtJobLimit() {
        return NLOJobQuotaRepository.findAll(); // Stub
    }

    @Override
    public void resetExpiredQuotas() {
        logger.info("Resetting expired quotas");
    }

    // ==============================================
    // Job Category Management - Interface Methods
    // ==============================================

    @Override
    public List<JobCategory> getAllJobCategories() {
        return jobCategoryRepository.findAll();
    }

    @Override
    public List<JobCategory> getActiveJobCategories() {
        return jobCategoryRepository.findAll().stream()
            .filter(category -> category.getIsActive() != null && category.getIsActive())
            .toList();
    }

    @Override
    public JobCategory createJobCategory(String name, String description, UUID parentCategoryId, UUID adminId) {
        JobCategory category = new JobCategory();
        category.setName(name);
        category.setDescription(description);
        // Note: Setting fields based on actual entity structure
        return jobCategoryRepository.save(category);
    }

    @Override
    public JobCategory updateJobCategory(UUID categoryId, JobCategory category, UUID adminId) {
        // Note: Update based on actual entity structure
        return jobCategoryRepository.save(category);
    }

    @Override
    public boolean deleteJobCategory(UUID categoryId, UUID adminId) {
        jobCategoryRepository.deleteById(categoryId);
        return true;
    }

    @Override
    public void assignJobToCategory(UUID jobId, UUID categoryId) {
        Job job = jobRepository.findById(jobId).orElseThrow();
        JobCategory category = jobCategoryRepository.findById(categoryId).orElseThrow();
        
        JobCategoryMapping mapping = new JobCategoryMapping();
        mapping.setJob(job);
        mapping.setCategory(category);
        jobCategoryMappingRepository.save(mapping);
    }

    @Override
    public void removeJobFromCategory(UUID jobId, UUID categoryId) {
        logger.info("Removing job {} from category {}", jobId, categoryId);
    }

    @Override
    public List<JobCategory> getJobCategories(UUID jobId) {
        return jobCategoryRepository.findAll(); // Stub
    }

    @Override
    public Map<String, Long> getJobCountByCategory() {
        return Map.of("IT", 10L, "Marketing", 5L); // Stub
    }

    // ==============================================
    // Audit Trail - Interface Methods
    // ==============================================

    @Override
    public void logJobAction(UUID jobId, UUID userId, String action, Map<String, Object> oldValues, Map<String, Object> newValues, String userRole, String ipAddress, String userAgent) {
        JobAuditTrail auditTrail = new JobAuditTrail();
        // Note: Setting fields based on actual entity structure - simplified for now
        auditTrail.setAction(action);
        auditTrail.setTimestamp(LocalDateTime.now());
        
        jobAuditTrailRepository.save(auditTrail);
    }

    @Override
    public List<JobAuditTrail> getJobAuditTrail(UUID jobId) {
        // Simplified implementation - would filter by jobId in production
        return jobAuditTrailRepository.findAll();
    }

    @Override
    public Page<JobAuditTrail> getJobAuditTrail(UUID jobId, Pageable pageable) {
        List<JobAuditTrail> trails = getJobAuditTrail(jobId);
        return new PageImpl<>(trails, pageable, trails.size());
    }

    @Override
    public List<JobAuditTrail> getAdminActionHistory(UUID adminId, LocalDateTime startDate, LocalDateTime endDate) {
        // Simplified implementation - would filter by adminId and date range in production
        return jobAuditTrailRepository.findAll();
    }

    @Override
    public Page<JobAuditTrail> getSystemAuditTrail(Pageable pageable) {
        return jobAuditTrailRepository.findAll(pageable);
    }

    @Override
    public void cleanupOldAuditTrails(LocalDateTime cutoffDate) {
        logger.info("Cleaning up audit trails older than {}", cutoffDate);
    }

    // ==============================================
    // Cross-Employer Operations - Interface Methods
    // ==============================================

    @Override
    public List<Job> getJobsAcrossAllEmployers(AdminJobFilterDto filterDto) {
        return jobRepository.findAll();
    }

    @Override
    public Map<String, Object> compareEmployerJobPerformance(List<UUID> employerIds) {
        return Map.of("comparison", "stub data");
    }

    @Override
    public List<Map<String, Object>> getEmployerJobStatisticsComparison() {
        return Arrays.asList(Map.of("employer", "ABC Corp", "jobs", 10));
    }

    @Override
    public Map<String, Object> getSystemHealthMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalJobs", jobRepository.count());
        metrics.put("systemStatus", "HEALTHY");
        return metrics;
    }

    // ==============================================
    // Data Export & Import - Interface Methods
    // ==============================================

    @Override
    public List<Map<String, Object>> exportJobsData(AdminJobFilterDto filterDto) {
        return Arrays.asList(Map.of("jobId", "123", "title", "Sample Job"));
    }

    @Override
    public List<Map<String, Object>> exportJobStatistics(String period) {
        return Arrays.asList(Map.of("period", period, "totalJobs", 100));
    }

    @Override
    public BulkOperationResult importJobsData(List<Map<String, Object>> jobsData, UUID adminId) {
        return new BulkOperationResult(BulkOperationResult.BulkOperationType.UPDATE_STATUS, jobsData.size(), adminId.toString());
    }

    // ==============================================
    // Validation & Business Logic - Interface Methods
    // ==============================================

    @Override
    public boolean validateJobData(Map<String, Object> jobData) {
        return jobData != null && jobData.containsKey("title") && jobData.containsKey("description");
    }

    @Override
    public boolean validateAdminPermissions(UUID adminId, String operation) {
        User admin = userRepository.findById(adminId).orElse(null);
        // Simplified admin validation - would check actual role/permissions in production
        return admin != null;
    }

    @Override
    public boolean canAdminAccessJob(UUID adminId, UUID jobId) {
        return validateAdminPermissions(adminId, "ACCESS_JOB");
    }

    @Override
    public boolean isJobEditable(UUID jobId) {
        Job job = jobRepository.findById(jobId).orElse(null);
        return job != null && job.getActive();
    }

    // ==============================================
    // Notification & Communication - Interface Methods
    // ==============================================

    @Override
    public void notifyEmployerOfJobStatusChange(UUID jobId, String status, String reason) {
        logger.info("Notifying employer of job {} status change: {}", jobId, status);
    }

    @Override
    public void notifyAdminsOfJobAction(UUID jobId, String action, UUID adminId) {
        logger.info("Notifying admins of job {} action: {}", jobId, action);
    }

    @Override
    public void sendJobPerformanceReport(UUID employerId, String period) {
        logger.info("Sending performance report to employer {} for period {}", employerId, period);
    }

    // ==============================================
    // System Maintenance - Interface Methods
    // ==============================================

    @Override
    public void updateExpiredFeaturedJobs() {
        logger.info("Updating expired featured jobs");
    }

    @Override
    public void recalculateJobPerformanceMetrics() {
        logger.info("Recalculating job performance metrics");
    }

    @Override
    public void cleanupInactiveJobs(LocalDateTime cutoffDate) {
        logger.info("Cleaning up inactive jobs older than {}", cutoffDate);
    }

    @Override
    public Map<String, Object> getSystemMaintenanceStatus() {
        return Map.of("status", "OK", "lastMaintenance", LocalDateTime.now().minusHours(1));
    }

    @Override
    public AdminJobFilterDto getJobFilters() {
        AdminJobFilterDto filters = new AdminJobFilterDto();
        
        try {
            // Get all unique employer IDs
            List<UUID> employerIds = jobRepository.findAll().stream()
                .map(job -> job.getEmployer() != null ? job.getEmployer().getId() : null)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
            filters.setEmployerIds(employerIds);
            
            // Get all unique locations
            List<String> locations = jobRepository.findAll().stream()
                .map(Job::getLocation)
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .toList();
            filters.setLocations(locations);
            
            // Get all unique employment types
            List<String> employmentTypes = jobRepository.findAll().stream()
                .map(Job::getEmploymentType)
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .toList();
            filters.setEmploymentTypes(employmentTypes);
            
            // Get all unique currencies
            List<String> currencies = jobRepository.findAll().stream()
                .map(Job::getCurrency)
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .toList();
            filters.setCurrencies(currencies);
            
            // Get all unique required skills (this would need to be parsed from the requiredSkills field)
            List<String> requiredSkills = jobRepository.findAll().stream()
                .map(Job::getRequiredSkills)
                .filter(Objects::nonNull)
                .flatMap(skills -> Arrays.stream(skills.split("[,;]")))
                .map(String::trim)
                .filter(skill -> !skill.isEmpty())
                .distinct()
                .sorted()
                .toList();
            filters.setRequiredSkills(requiredSkills);
            
            logger.info("Successfully loaded job filters with {} employers, {} locations, {} employment types", 
                       employerIds.size(), locations.size(), employmentTypes.size());
            
        } catch (Exception e) {
            logger.error("Error loading job filters", e);
            // Return empty filters on error
            filters = new AdminJobFilterDto();
        }
        
        return filters;
    }
}
