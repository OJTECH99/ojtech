package com.ojtechapi.spring.jwtoauth.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "jobs")
public class Job extends BaseEntity {
    
    @ManyToOne
    @JoinColumn(name = "employer_id")
    @JsonBackReference
    private NLOProfile employer;
    
    @ManyToOne
    @JoinColumn(name = "company_id")
    @JsonIgnoreProperties({"jobs"})
    private Company company;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "description", length = 5000, nullable = false)
    private String description;
    
    @Column(name = "location")
    private String location;
    
    @Column(name = "required_skills")
    private String requiredSkills;
    
    @Column(name = "employment_type")
    private String employmentType;
    
    @Column(name = "min_salary")
    private Double minSalary;
    
    @Column(name = "max_salary")
    private Double maxSalary;
    
    @Column(name = "currency")
    private String currency;
    
    @Column(name = "posted_at")
    private LocalDateTime postedAt;
    
    @Column(name = "active")
    private boolean active = true;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private JobStatus status = JobStatus.DRAFT;
    
    @Column(name = "salary_range")
    private String salaryRange;
    
    @Column(name = "requirements", length = 2000)
    private String requirements;
    
    @Column(name = "benefits", length = 2000)
    private String benefits;
    
    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL)
    @JsonManagedReference
    @JsonIgnoreProperties("job")
    private List<JobApplication> applications = new ArrayList<>();
    
    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL)
    @JsonManagedReference
    @JsonIgnoreProperties("job")
    private List<JobMatch> jobMatches = new ArrayList<>();
    
    public Job() {
    }
    
    public NLOProfile getEmployer() {
        return employer;
    }
    
    public void setEmployer(NLOProfile employer) {
        this.employer = employer;
    }
    
    public Company getCompany() {
        return company;
    }
    
    public void setCompany(Company company) {
        this.company = company;
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
    
    public JobStatus getStatus() {
        return status;
    }
    
    public void setStatus(JobStatus status) {
        this.status = status;
    }
    
    public String getSalaryRange() {
        return salaryRange;
    }
    
    public void setSalaryRange(String salaryRange) {
        this.salaryRange = salaryRange;
    }
    
    public String getRequirements() {
        return requirements;
    }
    
    public void setRequirements(String requirements) {
        this.requirements = requirements;
    }
    
    public String getBenefits() {
        return benefits;
    }
    
    public void setBenefits(String benefits) {
        this.benefits = benefits;
    }
    
    public List<JobApplication> getApplications() {
        return applications;
    }
    
    public void setApplications(List<JobApplication> applications) {
        this.applications = applications;
    }
    
    public List<JobMatch> getJobMatches() {
        return jobMatches;
    }
    
    public void setJobMatches(List<JobMatch> jobMatches) {
        this.jobMatches = jobMatches;
    }
    
    public void addJobMatch(JobMatch jobMatch) {
        jobMatches.add(jobMatch);
        jobMatch.setJob(this);
    }
    
    public void removeJobMatch(JobMatch jobMatch) {
        jobMatches.remove(jobMatch);
        jobMatch.setJob(null);
    }
}
