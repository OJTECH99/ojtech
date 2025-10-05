package com.melardev.spring.jwtoauth.service.interfaces;

import com.melardev.spring.jwtoauth.entities.Job;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface JobService {
    
    // Job Management
    List<Job> getAllActiveJobs();
    Job getJobById(UUID jobId);
    List<Job> getJobsByEmployer(UUID employerId);
    Job getJobByIdForEmployer(UUID jobId, UUID employerId);
    Job createJob(UUID employerId, Map<String, Object> jobData);
    Job updateJob(UUID jobId, UUID employerId, Map<String, Object> jobData);
    boolean deleteJob(UUID jobId, UUID employerId);
    
    // Search & Filtering
    List<Job> searchJobs(String title, String location, String employmentType, List<String> skills);
    List<Job> getJobsBySkills(List<String> skills);
    List<Job> getJobsByLocation(String location);
    
    // Validation & Business Logic
    boolean validateJobOwnership(UUID jobId, UUID employerId);
    boolean isJobActive(UUID jobId);
    Map<String, Object> getJobStatistics(UUID employerId);
    
    // Job Data Processing
    Job buildJobFromData(Map<String, Object> jobData);
    List<String> parseSkillsFromString(String skillsString);
} 