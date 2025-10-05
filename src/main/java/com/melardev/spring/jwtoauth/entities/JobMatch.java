package com.melardev.spring.jwtoauth.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_matches")
public class JobMatch extends BaseEntity {
    
    @ManyToOne
    @JoinColumn(name = "job_id")
    @JsonBackReference
    private Job job;
    
    @ManyToOne
    @JoinColumn(name = "student_id")
    @JsonBackReference
    private StudentProfile student;
    
    @Column(name = "match_score")
    private Double matchScore;
    
    @Column(name = "matched_at")
    private LocalDateTime matchedAt;
    
    @Column(name = "match_details", length = 2000)
    private String matchDetails;
    
    @Column(name = "detailed_analysis", columnDefinition = "TEXT")
    private String detailedAnalysis;
    
    @Column(name = "is_viewed")
    private boolean viewed = false;
    
    public JobMatch() {
        this.matchedAt = LocalDateTime.now();
    }
    
    public JobMatch(Job job, StudentProfile student, Double matchScore) {
        this();
        this.job = job;
        this.student = student;
        this.matchScore = matchScore;
    }
    
    public Job getJob() {
        return job;
    }
    
    public void setJob(Job job) {
        this.job = job;
    }
    
    public StudentProfile getStudent() {
        return student;
    }
    
    public void setStudent(StudentProfile student) {
        this.student = student;
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
} 