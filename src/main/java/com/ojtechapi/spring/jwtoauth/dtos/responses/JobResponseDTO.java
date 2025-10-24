package com.ojtechapi.spring.jwtoauth.dtos.responses;

import com.ojtechapi.spring.jwtoauth.entities.Job;
import com.ojtechapi.spring.jwtoauth.entities.JobApplication;
import com.ojtechapi.spring.jwtoauth.entities.JobMatch;

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
    
    // Company information
    private String companyName;
    private String companyWebsite;
    private String companyDescription;
    private String companyLocation;
    private String companyEmail;
    private String companyPhone;
    private String companyIndustry;
    private String companySize;
    private String companyLogoUrl;
    private String hrName;
    private String hrEmail;
    private String hrPhone;
    
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
        
        // Populate company information from Company entity
        if (job.getCompany() != null) {
            this.companyName = job.getCompany().getName();
            this.companyWebsite = job.getCompany().getWebsite();
            this.companyDescription = job.getCompany().getDescription();
            this.companyLocation = job.getCompany().getLocation();
            this.companyEmail = job.getCompany().getEmail();
            this.companyPhone = job.getCompany().getPhone();
            this.companyIndustry = job.getCompany().getIndustry();
            this.companySize = job.getCompany().getCompanySize();
            this.companyLogoUrl = job.getCompany().getLogoUrl();
            this.hrName = job.getCompany().getHrName();
            this.hrEmail = job.getCompany().getHrEmail();
            this.hrPhone = job.getCompany().getHrPhone();
        }
        
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

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyWebsite() {
        return companyWebsite;
    }

    public void setCompanyWebsite(String companyWebsite) {
        this.companyWebsite = companyWebsite;
    }

    public String getCompanyDescription() {
        return companyDescription;
    }

    public void setCompanyDescription(String companyDescription) {
        this.companyDescription = companyDescription;
    }

    public String getCompanyLocation() {
        return companyLocation;
    }

    public void setCompanyLocation(String companyLocation) {
        this.companyLocation = companyLocation;
    }

    public String getCompanyEmail() {
        return companyEmail;
    }

    public void setCompanyEmail(String companyEmail) {
        this.companyEmail = companyEmail;
    }

    public String getCompanyPhone() {
        return companyPhone;
    }

    public void setCompanyPhone(String companyPhone) {
        this.companyPhone = companyPhone;
    }

    public String getCompanyIndustry() {
        return companyIndustry;
    }

    public void setCompanyIndustry(String companyIndustry) {
        this.companyIndustry = companyIndustry;
    }

    public String getCompanySize() {
        return companySize;
    }

    public void setCompanySize(String companySize) {
        this.companySize = companySize;
    }

    public String getCompanyLogoUrl() {
        return companyLogoUrl;
    }

    public void setCompanyLogoUrl(String companyLogoUrl) {
        this.companyLogoUrl = companyLogoUrl;
    }

    public String getHrName() {
        return hrName;
    }

    public void setHrName(String hrName) {
        this.hrName = hrName;
    }

    public String getHrEmail() {
        return hrEmail;
    }

    public void setHrEmail(String hrEmail) {
        this.hrEmail = hrEmail;
    }

    public String getHrPhone() {
        return hrPhone;
    }

    public void setHrPhone(String hrPhone) {
        this.hrPhone = hrPhone;
    }
} 
