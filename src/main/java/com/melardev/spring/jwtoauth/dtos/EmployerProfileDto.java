package com.melardev.spring.jwtoauth.dtos;

import com.melardev.spring.jwtoauth.entities.EmployerProfile;

import java.util.UUID;

public class EmployerProfileDto {
    private UUID id;
    private String companyName;
    private String industry;
    private String location;
    private String companySize;
    private String companyDescription;
    private String websiteUrl;
    private String logoUrl;
    private String email;
    
    public EmployerProfileDto() {
    }
    
    public EmployerProfileDto(EmployerProfile employerProfile) {
        this.id = employerProfile.getId();
        this.companyName = employerProfile.getCompanyName();
        this.industry = employerProfile.getIndustry();
        this.location = employerProfile.getLocation();
        this.companySize = employerProfile.getCompanySize();
        this.companyDescription = employerProfile.getCompanyDescription();
        this.websiteUrl = employerProfile.getWebsiteUrl();
        this.logoUrl = employerProfile.getLogoUrl();
        this.email = employerProfile.getContactPersonEmail();
    }
    
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }
    
    public String getCompanyName() {
        return companyName;
    }
    
    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }
    
    public String getIndustry() {
        return industry;
    }
    
    public void setIndustry(String industry) {
        this.industry = industry;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public String getCompanySize() {
        return companySize;
    }
    
    public void setCompanySize(String companySize) {
        this.companySize = companySize;
    }
    
    public String getCompanyDescription() {
        return companyDescription;
    }
    
    public void setCompanyDescription(String companyDescription) {
        this.companyDescription = companyDescription;
    }
    
    public String getWebsiteUrl() {
        return websiteUrl;
    }
    
    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }
    
    public String getLogoUrl() {
        return logoUrl;
    }
    
    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    // For compatibility with JobDto
    public String getWebsite() {
        return websiteUrl;
    }
    
    public String getDescription() {
        return companyDescription;
    }
} 