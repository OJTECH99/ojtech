package com.melardev.spring.jwtoauth.service.interfaces;

import com.melardev.spring.jwtoauth.entities.ApplicationStatus;
import com.melardev.spring.jwtoauth.entities.JobApplication;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface JobApplicationService {
    
    // Application Management
    List<JobApplication> getApplicationsByStudent(UUID studentId);
    List<JobApplication> getApplicationsByJob(UUID jobId);
    List<JobApplication> getApplicationsByEmployer(UUID employerId);
    JobApplication getApplicationById(UUID applicationId);
    JobApplication applyToJob(UUID studentId, UUID jobId, String coverLetter, UUID cvId);
    JobApplication updateApplicationStatus(UUID applicationId, ApplicationStatus status, String notes);
    boolean deleteApplication(UUID applicationId, UUID userId);
    
    // Cover Letter Generation
    String generateCoverLetter(UUID studentId, UUID jobId);
    
    // Validation & Business Logic
    boolean hasUserAppliedToJob(UUID studentId, UUID jobId);
    boolean canUpdateApplicationStatus(UUID applicationId, UUID userId);
    boolean canDeleteApplication(UUID applicationId, UUID userId);
    Map<String, Object> getApplicationStatistics(UUID employerId);
    
    // Application Processing
    JobApplication processApplicationSubmission(UUID studentId, UUID jobId, String coverLetter, UUID cvId);
    boolean validateApplicationOwnership(UUID applicationId, UUID userId);
} 