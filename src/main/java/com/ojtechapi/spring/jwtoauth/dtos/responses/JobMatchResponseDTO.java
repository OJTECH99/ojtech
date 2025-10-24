package com.ojtechapi.spring.jwtoauth.dtos.responses;

import com.ojtechapi.spring.jwtoauth.entities.JobMatch;

import java.time.LocalDateTime;
import java.util.UUID;

public class JobMatchResponseDTO {
    private UUID id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Double matchScore;
    private LocalDateTime matchedAt;
    private String matchDetails;
    private String detailedAnalysis;
    private boolean viewed;
    
    // Student details
    private UUID studentId;
    private String studentFullName;
    private String studentFirstName;
    private String studentLastName;
    private String studentUniversity;
    private String studentMajor;
    private Integer studentGraduationYear;
    private String studentSkills;
    
    // Job details
    private UUID jobId;
    private String jobTitle;
    
    public JobMatchResponseDTO(JobMatch jobMatch) {
        this.id = jobMatch.getId();
        this.createdAt = jobMatch.getCreatedAt();
        this.updatedAt = jobMatch.getUpdatedAt();
        this.matchScore = jobMatch.getMatchScore();
        this.matchedAt = jobMatch.getMatchedAt();
        this.matchDetails = jobMatch.getMatchDetails();
        this.detailedAnalysis = jobMatch.getDetailedAnalysis();
        this.viewed = jobMatch.isViewed();
        
        // Student details
        if (jobMatch.getStudent() != null) {
            this.studentId = jobMatch.getStudent().getId();
            this.studentFullName = jobMatch.getStudent().getFullName();
            this.studentFirstName = jobMatch.getStudent().getFirstName();
            this.studentLastName = jobMatch.getStudent().getLastName();
            this.studentUniversity = jobMatch.getStudent().getUniversity();
            this.studentMajor = jobMatch.getStudent().getMajor();
            this.studentGraduationYear = jobMatch.getStudent().getGraduationYear();
            this.studentSkills = jobMatch.getStudent().getSkills();
        }
        
        // Job details
        if (jobMatch.getJob() != null) {
            this.jobId = jobMatch.getJob().getId();
            this.jobTitle = jobMatch.getJob().getTitle();
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

    public Double getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(Double matchScore) {
        this.matchScore = matchScore;
    }

    public LocalDateTime getMatchedAt() {
        return matchedAt;
    }

    public void setMatchedAt(LocalDateTime matchedAt) {
        this.matchedAt = matchedAt;
    }

    public String getMatchDetails() {
        return matchDetails;
    }

    public void setMatchDetails(String matchDetails) {
        this.matchDetails = matchDetails;
    }

    public String getDetailedAnalysis() {
        return detailedAnalysis;
    }

    public void setDetailedAnalysis(String detailedAnalysis) {
        this.detailedAnalysis = detailedAnalysis;
    }

    public boolean isViewed() {
        return viewed;
    }

    public void setViewed(boolean viewed) {
        this.viewed = viewed;
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
} 
