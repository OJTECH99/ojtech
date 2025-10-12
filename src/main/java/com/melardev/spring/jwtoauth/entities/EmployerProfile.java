package com.melardev.spring.jwtoauth.entities;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "employer_profiles")
public class EmployerProfile extends Profile {
    
    @Column(name = "company_name")
    private String companyName;
    
    @Column(name = "company_size")
    private String companySize;
    
    @Column(name = "industry")
    private String industry;
    
    @Column(name = "company_description", length = 2000)
    private String companyDescription;
    
    @Column(name = "website_url")
    private String websiteUrl;
    
    @Column(name = "logo_url")
    private String logoUrl;
    
    @Column(name = "contact_person_name")
    private String contactPersonName;
    
    @Column(name = "contact_person_position")
    private String contactPersonPosition;
    
    @Column(name = "contact_person_email")
    private String contactPersonEmail;
    
    @Column(name = "contact_person_phone")
    private String contactPersonPhone;
    
    @Column(name = "company_address")
    private String companyAddress;
    
    @Column(name = "verified")
    private Boolean verified = false;
    
    @OneToMany(mappedBy = "employer", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Job> jobs = new ArrayList<>();
    
    public EmployerProfile() {
        this.setRole(UserRole.NLO);
    }
    
    public String getCompanyName() {
        return companyName;
    }
    
    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }
    
    public String getCompanySize() {
        return companySize;
    }
    
    public void setCompanySize(String companySize) {
        this.companySize = companySize;
    }
    
    public String getIndustry() {
        return industry;
    }
    
    public void setIndustry(String industry) {
        this.industry = industry;
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
    
    public String getContactPersonName() {
        return contactPersonName;
    }
    
    public void setContactPersonName(String contactPersonName) {
        this.contactPersonName = contactPersonName;
    }
    
    public String getContactPersonPosition() {
        return contactPersonPosition;
    }
    
    public void setContactPersonPosition(String contactPersonPosition) {
        this.contactPersonPosition = contactPersonPosition;
    }
    
    public String getContactPersonEmail() {
        return contactPersonEmail;
    }
    
    public void setContactPersonEmail(String contactPersonEmail) {
        this.contactPersonEmail = contactPersonEmail;
    }
    
    public String getContactPersonPhone() {
        return contactPersonPhone;
    }
    
    public void setContactPersonPhone(String contactPersonPhone) {
        this.contactPersonPhone = contactPersonPhone;
    }
    
    public String getCompanyAddress() {
        return companyAddress;
    }
    
    public void setCompanyAddress(String companyAddress) {
        this.companyAddress = companyAddress;
    }
    
    public Boolean getVerified() {
        return verified;
    }
    
    public void setVerified(Boolean verified) {
        this.verified = verified;
    }
    
    public List<Job> getJobs() {
        return jobs;
    }
    
    public void setJobs(List<Job> jobs) {
        this.jobs = jobs;
    }
    
    public void addJob(Job job) {
        jobs.add(job);
        job.setEmployer(this);
    }
    
    public void removeJob(Job job) {
        jobs.remove(job);
        job.setEmployer(null);
    }
} 