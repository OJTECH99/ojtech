package com.melardev.spring.jwtoauth.dtos.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for creating a new company
 * Used by NLO Staff to add partner companies
 */
public class CompanyCreateRequest {
    
    @NotBlank(message = "Company name is required")
    @Size(min = 2, max = 200, message = "Company name must be between 2 and 200 characters")
    private String name;
    
    private String website;
    
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;
    
    private String location;
    
    @NotBlank(message = "Company email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    private String phone;
    
    private String industry;
    
    private String companySize;
    
    private String logoUrl;
    
    private String hrName;
    
    @Email(message = "Invalid HR email format")
    private String hrEmail;
    
    private String hrPhone;
    
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
}
