package com.melardev.spring.jwtoauth.dtos;

import com.melardev.spring.jwtoauth.entities.JobMatch;

import java.time.LocalDateTime;
import java.util.UUID;

public class JobMatchDto {
    private UUID id;
    private JobDto job;
    private Double matchScore;
    private LocalDateTime matchedAt;
    private String matchDetails;
    private boolean viewed;
    
    public JobMatchDto() {
    }
    
    public JobMatchDto(JobMatch jobMatch) {
        this.id = jobMatch.getId();
        this.job = new JobDto(jobMatch.getJob());
        this.matchScore = jobMatch.getMatchScore();
        this.matchedAt = jobMatch.getMatchedAt();
        this.matchDetails = jobMatch.getMatchDetails();
        this.viewed = jobMatch.isViewed();
    }
    
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public JobDto getJob() {
        return job;
    }
    
    public void setJob(JobDto job) {
        this.job = job;
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
    
    public boolean isViewed() {
        return viewed;
    }
    
    public void setViewed(boolean viewed) {
        this.viewed = viewed;
    }
} 