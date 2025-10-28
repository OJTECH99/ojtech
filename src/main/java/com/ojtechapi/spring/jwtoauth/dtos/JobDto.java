package com.ojtechapi.spring.jwtoauth.dtos;

import com.ojtechapi.spring.jwtoauth.entities.Job;

import java.time.LocalDateTime;
import java.util.UUID;

public class JobDto {
    private UUID id;
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
    private NLOProfileDto employer;
    
    public JobDto() {
    }
    
    public JobDto(Job job) {
        this.id = job.getId();
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
        if (job.getEmployer() != null) {
            this.employer = new NLOProfileDto(job.getEmployer());
        }
    }
    
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
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
    
    public NLOProfileDto getEmployer() {
        return employer;
    }
    
    public void setEmployer(NLOProfileDto employer) {
        this.employer = employer;
    }
} 
