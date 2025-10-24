package com.ojtechapi.spring.jwtoauth.dtos.responses;

import com.ojtechapi.spring.jwtoauth.entities.Company;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for Company responses
 */
public class CompanyResponseDTO {
    
    private UUID id;
    private String name;
    private String website;
    private String description;
    private String location;
    private String email;
    private String phone;
    private String industry;
    private String companySize;
    private String logoUrl;
    private String hrName;
    private String hrEmail;
    private String hrPhone;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UUID jobId; // ID of associated job if exists
    
    public CompanyResponseDTO() {
    }
    
    public CompanyResponseDTO(Company company) {
        this.id = company.getId();
        this.name = company.getName();
        this.website = company.getWebsite();
        this.description = company.getDescription();
        this.location = company.getLocation();
        this.email = company.getEmail();
        this.phone = company.getPhone();
        this.industry = company.getIndustry();
        this.companySize = company.getCompanySize();
        this.logoUrl = company.getLogoUrl();
        this.hrName = company.getHrName();
        this.hrEmail = company.getHrEmail();
        this.hrPhone = company.getHrPhone();
        this.active = company.isActive();
        this.createdAt = company.getCreatedAt();
        this.updatedAt = company.getUpdatedAt();
        this.jobId = company.getJob() != null ? company.getJob().getId() : null;
    }
    
    // Getters and Setters
    
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getWebsite() {
        return website;
    }
    
    public void setWebsite(String website) {
        this.website = website;
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
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getIndustry() {
        return industry;
    }
    
    public void setIndustry(String industry) {
        this.industry = industry;
    }
    
    public String getCompanySize() {
        return companySize;
    }
    
    public void setCompanySize(String companySize) {
        this.companySize = companySize;
    }
    
    public String getLogoUrl() {
        return logoUrl;
    }
    
    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
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
    
    public boolean isActive() {
        return active;
    }
    
    public void setActive(boolean active) {
        this.active = active;
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
    
    public UUID getJobId() {
        return jobId;
    }
    
    public void setJobId(UUID jobId) {
        this.jobId = jobId;
    }
}
