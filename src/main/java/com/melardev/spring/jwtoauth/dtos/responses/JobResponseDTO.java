package com.melardev.spring.jwtoauth.dtos.responses;

import com.melardev.spring.jwtoauth.entities.Job;
import com.melardev.spring.jwtoauth.entities.JobApplication;
import com.melardev.spring.jwtoauth.entities.JobMatch;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class JobResponseDTO {
    private UUID id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String title;
    private String description;
    private String location;
    private String requiredSkills;
    private String employmentType;
    private Double minSalary;
    private Double maxSalary;
    private String currency;
    private LocalDateTime postedAt;
    private boolean active;
    
    // Enhanced applications with student details
    private List<JobApplicationResponseDTO> applications = new ArrayList<>();
    
    // Job matches
    private List<JobMatchResponseDTO> jobMatches = new ArrayList<>();
    
    public JobResponseDTO(Job job) {
        this.id = job.getId();
        this.createdAt = job.getCreatedAt();
        this.updatedAt = job.getUpdatedAt();
        this.title = job.getTitle();
        this.description = job.getDescription();
        this.location = job.getLocation();
        this.requiredSkills = job.getRequiredSkills();
        this.employmentType = job.getEmploymentType();
        this.minSalary = job.getMinSalary();
        this.maxSalary = job.getMaxSalary();
        this.currency = job.getCurrency();
        this.postedAt = job.getPostedAt();
        this.active = job.isActive();
        
        // Convert applications to DTOs
        if (job.getApplications() != null) {
            this.applications = job.getApplications().stream()
                .map(JobApplicationResponseDTO::new)
                .collect(Collectors.toList());
        }
        
        // Convert job matches to DTOs
        if (job.getJobMatches() != null) {
            this.jobMatches = job.getJobMatches().stream()
                .map(JobMatchResponseDTO::new)
                .collect(Collectors.toList());
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(String requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public Double getMinSalary() {
        return minSalary;
    }

    public void setMinSalary(Double minSalary) {
        this.minSalary = minSalary;
    }

    public Double getMaxSalary() {
        return maxSalary;
    }

    public void setMaxSalary(Double maxSalary) {
        this.maxSalary = maxSalary;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public LocalDateTime getPostedAt() {
        return postedAt;
    }

    public void setPostedAt(LocalDateTime postedAt) {
        this.postedAt = postedAt;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public List<JobApplicationResponseDTO> getApplications() {
        return applications;
    }

    public void setApplications(List<JobApplicationResponseDTO> applications) {
        this.applications = applications;
    }

    public List<JobMatchResponseDTO> getJobMatches() {
        return jobMatches;
    }

    public void setJobMatches(List<JobMatchResponseDTO> jobMatches) {
        this.jobMatches = jobMatches;
    }
} 