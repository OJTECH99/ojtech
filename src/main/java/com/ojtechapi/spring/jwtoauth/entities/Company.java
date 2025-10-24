package com.ojtechapi.spring.jwtoauth.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Company entity - Represents partner companies managed by NLO Staff
 * One-to-one relationship with Job entity
 */
@Entity
@Table(name = "companies")
public class Company extends BaseEntity {
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "website")
    private String website;
    
    @Column(name = "description", length = 2000)
    private String description;
    
    @Column(name = "location")
    private String location;
    
    @Column(name = "email", nullable = false)
    private String email;
    
    @Column(name = "phone")
    private String phone;
    
    @Column(name = "industry")
    private String industry;
    
    @Column(name = "company_size")
    private String companySize;
    
    @Column(name = "logo_url")
    private String logoUrl;
    
    @Column(name = "hr_name")
    private String hrName;
    
    @Column(name = "hr_email")
    private String hrEmail;
    
    @Column(name = "hr_phone")
    private String hrPhone;
    
    @Column(name = "active")
    private boolean active = true;
    
    @ManyToOne
    @JoinColumn(name = "created_by_nlo_id")
    @JsonIgnoreProperties({"jobs", "applications"})
    private NLOProfile createdByNLO;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToOne(mappedBy = "company", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"company", "employer"})
    private Job job;
    
    public Company() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    
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
    
    public NLOProfile getCreatedByNLO() {
        return createdByNLO;
    }
    
    public void setCreatedByNLO(NLOProfile createdByNLO) {
        this.createdByNLO = createdByNLO;
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
    
    public Job getJob() {
        return job;
    }
    
    public void setJob(Job job) {
        this.job = job;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
