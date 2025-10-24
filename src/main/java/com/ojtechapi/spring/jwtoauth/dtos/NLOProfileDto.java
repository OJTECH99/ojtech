package com.ojtechapi.spring.jwtoauth.dtos;

import com.ojtechapi.spring.jwtoauth.entities.NLOProfile;

import java.util.UUID;

public class NLOProfileDto {
    private UUID id;
    private String companyName;
    private String industry;
    private String location;
    private String companySize;
    private String companyDescription;
    private String websiteUrl;
    private String logoUrl;
    private String email;
    
    public NLOProfileDto() {
    }
    
    public NLOProfileDto(NLOProfile nloProfile) {
        this.id = nloProfile.getId();
        this.companyName = nloProfile.getCompanyName();
        this.industry = nloProfile.getIndustry();
        this.location = nloProfile.getLocation();
        this.companySize = nloProfile.getCompanySize();
        this.companyDescription = nloProfile.getCompanyDescription();
        this.websiteUrl = nloProfile.getWebsiteUrl();
        this.logoUrl = nloProfile.getLogoUrl();
        this.email = nloProfile.getContactPersonEmail();
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
