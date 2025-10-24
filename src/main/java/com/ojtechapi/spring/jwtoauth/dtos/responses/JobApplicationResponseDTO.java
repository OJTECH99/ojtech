package com.ojtechapi.spring.jwtoauth.dtos.responses;

import com.ojtechapi.spring.jwtoauth.entities.ApplicationStatus;
import com.ojtechapi.spring.jwtoauth.entities.JobApplication;

import java.time.LocalDateTime;
import java.util.UUID;

public class JobApplicationResponseDTO {
    private UUID id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String coverLetter;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;
    private LocalDateTime lastUpdatedAt;
    private boolean active;
    
    // Student details
    private UUID studentId;
    private String studentFullName;
    private String studentFirstName;
    private String studentLastName;
    private String studentUniversity;
    private String studentMajor;
    private Integer studentGraduationYear;
    private String studentSkills;
    
    // CV details
    private UUID cvId;
    
    // Job details
    private UUID jobId;
    private String jobTitle;
    private String jobDescription;
    private String jobLocation;
    private String jobRequiredSkills;
    private String jobEmploymentType;
    private Double jobMinSalary;
    private Double jobMaxSalary;
    private String jobCurrency;
    private LocalDateTime jobPostedAt;
    
    // Employer details
    private UUID employerId;
    private String employerName;
    private String employerCompanyName;
    
    // Match score (if available)
    private Double matchScore;
    
    public JobApplicationResponseDTO(JobApplication application) {
        this.id = application.getId();
        this.createdAt = application.getCreatedAt();
        this.updatedAt = application.getUpdatedAt();
        this.coverLetter = application.getCoverLetter();
        this.status = application.getStatus();
        this.appliedAt = application.getAppliedAt();
        this.lastUpdatedAt = application.getLastUpdatedAt();
        this.active = application.getActive() != null ? application.getActive() : true;
        
        // Student details
        if (application.getStudent() != null) {
            this.studentId = application.getStudent().getId();
            this.studentFullName = application.getStudent().getFullName();
            this.studentFirstName = application.getStudent().getFirstName();
            this.studentLastName = application.getStudent().getLastName();
            this.studentUniversity = application.getStudent().getUniversity();
            this.studentMajor = application.getStudent().getMajor();
            this.studentGraduationYear = application.getStudent().getGraduationYear();
            this.studentSkills = application.getStudent().getSkills();
        }
        
        // CV details
        if (application.getCv() != null) {
            this.cvId = application.getCv().getId();
        }
        
        // Job details
        if (application.getJob() != null) {
            this.jobId = application.getJob().getId();
            this.jobTitle = application.getJob().getTitle();
            this.jobDescription = application.getJob().getDescription();
            this.jobLocation = application.getJob().getLocation();
            this.jobRequiredSkills = application.getJob().getRequiredSkills();
            this.jobEmploymentType = application.getJob().getEmploymentType();
            this.jobMinSalary = application.getJob().getMinSalary();
            this.jobMaxSalary = application.getJob().getMaxSalary();
            this.jobCurrency = application.getJob().getCurrency();
            this.jobPostedAt = application.getJob().getPostedAt();
            
            // Employer details
            if (application.getJob().getEmployer() != null) {
                this.employerId = application.getJob().getEmployer().getId();
                this.employerName = application.getJob().getEmployer().getFullName();
                this.employerCompanyName = application.getJob().getEmployer().getCompanyName();
            }
            
            // Try to find match score from job's matches
            if (application.getStudent() != null) {
                application.getJob().getJobMatches().stream()
                    .filter(match -> match.getStudent().getId().equals(application.getStudent().getId()))
                    .findFirst()
                    .ifPresent(match -> this.matchScore = match.getMatchScore());
            }
        }
        
        // If match score is still null, try to find it from student's matches
        if (this.matchScore == null && application.getStudent() != null && application.getJob() != null) {
            application.getStudent().getJobMatches().stream()
                .filter(match -> match.getJob().getId().equals(application.getJob().getId()))
                .findFirst()
                .ifPresent(match -> this.matchScore = match.getMatchScore());
        }
        
        // If no match score found, set a default based on skill matching
        if (this.matchScore == null && application.getStudent() != null && application.getJob() != null) {
            this.matchScore = calculateDefaultMatchScore(application);
        }
    }
    
    /**
     * Calculate a default match score based on skill matching if no explicit match exists
     */
    private Double calculateDefaultMatchScore(JobApplication application) {
        if (application.getStudent() == null || application.getJob() == null) {
            return 0.0;
        }
        
        String studentSkills = application.getStudent().getSkills();
        String jobSkills = application.getJob().getRequiredSkills();
        
        if (studentSkills == null || jobSkills == null) {
            return 0.0;
        }
        
        // Simple skill matching algorithm
        String[] studentSkillsArray = studentSkills.split(",");
        String[] jobSkillsArray = jobSkills.split(",");
        
        int matchCount = 0;
        for (String studentSkill : studentSkillsArray) {
            for (String jobSkill : jobSkillsArray) {
                if (studentSkill.trim().equalsIgnoreCase(jobSkill.trim())) {
                    matchCount++;
                    break;
                }
            }
        }
        
        // Calculate score as percentage of matched skills out of required skills
        double matchPercentage = jobSkillsArray.length > 0 ? 
            (double) matchCount / jobSkillsArray.length * 100.0 : 0.0;
            
        // Cap at 100%
        return Math.min(matchPercentage, 100.0);
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

    public String getCoverLetter() {
        return coverLetter;
    }

    public void setCoverLetter(String coverLetter) {
        this.coverLetter = coverLetter;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }

    public LocalDateTime getLastUpdatedAt() {
        return lastUpdatedAt;
    }

    public void setLastUpdatedAt(LocalDateTime lastUpdatedAt) {
        this.lastUpdatedAt = lastUpdatedAt;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public UUID getStudentId() {
        return studentId;
    }

    public void setStudentId(UUID studentId) {
        this.studentId = studentId;
    }

    public String getStudentFullName() {
        return studentFullName;
    }

    public void setStudentFullName(String studentFullName) {
        this.studentFullName = studentFullName;
    }

    public String getStudentFirstName() {
        return studentFirstName;
    }

    public void setStudentFirstName(String studentFirstName) {
        this.studentFirstName = studentFirstName;
    }

    public String getStudentLastName() {
        return studentLastName;
    }

    public void setStudentLastName(String studentLastName) {
        this.studentLastName = studentLastName;
    }

    public String getStudentUniversity() {
        return studentUniversity;
    }

    public void setStudentUniversity(String studentUniversity) {
        this.studentUniversity = studentUniversity;
    }

    public String getStudentMajor() {
        return studentMajor;
    }

    public void setStudentMajor(String studentMajor) {
        this.studentMajor = studentMajor;
    }

    public Integer getStudentGraduationYear() {
        return studentGraduationYear;
    }

    public void setStudentGraduationYear(Integer studentGraduationYear) {
        this.studentGraduationYear = studentGraduationYear;
    }

    public String getStudentSkills() {
        return studentSkills;
    }

    public void setStudentSkills(String studentSkills) {
        this.studentSkills = studentSkills;
    }

    public UUID getCvId() {
        return cvId;
    }

    public void setCvId(UUID cvId) {
        this.cvId = cvId;
    }

    public UUID getJobId() {
        return jobId;
    }

    public void setJobId(UUID jobId) {
        this.jobId = jobId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }

    public Double getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(Double matchScore) {
        this.matchScore = matchScore;
    }

    public String getJobLocation() {
        return jobLocation;
    }

    public void setJobLocation(String jobLocation) {
        this.jobLocation = jobLocation;
    }

    public String getJobRequiredSkills() {
        return jobRequiredSkills;
    }

    public void setJobRequiredSkills(String jobRequiredSkills) {
        this.jobRequiredSkills = jobRequiredSkills;
    }

    public String getJobEmploymentType() {
        return jobEmploymentType;
    }

    public void setJobEmploymentType(String jobEmploymentType) {
        this.jobEmploymentType = jobEmploymentType;
    }

    public Double getJobMinSalary() {
        return jobMinSalary;
    }

    public void setJobMinSalary(Double jobMinSalary) {
        this.jobMinSalary = jobMinSalary;
    }

    public Double getJobMaxSalary() {
        return jobMaxSalary;
    }

    public void setJobMaxSalary(Double jobMaxSalary) {
        this.jobMaxSalary = jobMaxSalary;
    }

    public String getJobCurrency() {
        return jobCurrency;
    }

    public void setJobCurrency(String jobCurrency) {
        this.jobCurrency = jobCurrency;
    }

    public LocalDateTime getJobPostedAt() {
        return jobPostedAt;
    }

    public void setJobPostedAt(LocalDateTime jobPostedAt) {
        this.jobPostedAt = jobPostedAt;
    }

    public UUID getEmployerId() {
        return employerId;
    }

    public void setEmployerId(UUID employerId) {
        this.employerId = employerId;
    }

    public String getEmployerName() {
        return employerName;
    }

    public void setEmployerName(String employerName) {
        this.employerName = employerName;
    }

    public String getEmployerCompanyName() {
        return employerCompanyName;
    }

    public void setEmployerCompanyName(String employerCompanyName) {
        this.employerCompanyName = employerCompanyName;
    }
} 
