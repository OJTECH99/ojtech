package com.melardev.spring.jwtoauth.dtos.admin;

import com.melardev.spring.jwtoauth.entities.JobModeration.ModerationAction;

import java.time.LocalDateTime;
import java.util.UUID;

public class JobModerationDto {

    private UUID jobId;
    private String jobTitle;
    private String employerName;
    private UUID employerId;
    private ModerationAction action;
    private String notes;
    private String adminUsername;
    private UUID adminId;
    private LocalDateTime moderatedAt;
    private String reason;
    private Integer priority;
    private boolean requiresReview;

    // Additional job details for moderation context
    private String jobDescription;
    private String jobLocation;
    private String employmentType;
    private Double minSalary;
    private Double maxSalary;
    private String currency;
    private LocalDateTime jobPostedAt;
    private boolean jobActive;

    // Moderation workflow fields
    private ModerationAction previousAction;
    private String previousNotes;
    private LocalDateTime submittedForModerationAt;
    private boolean isRemoderation;
    private int moderationAttempts;

    // Constructors
    public JobModerationDto() {}

    public JobModerationDto(UUID jobId, String jobTitle, ModerationAction action, String notes) {
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.action = action;
        this.notes = notes;
        this.moderatedAt = LocalDateTime.now();
    }

    public JobModerationDto(UUID jobId, String jobTitle, String employerName, ModerationAction action, String notes, String adminUsername) {
        this(jobId, jobTitle, action, notes);
        this.employerName = employerName;
        this.adminUsername = adminUsername;
    }

    // Getters and Setters
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

    public String getEmployerName() {
        return employerName;
    }

    public void setEmployerName(String employerName) {
        this.employerName = employerName;
    }

    public UUID getEmployerId() {
        return employerId;
    }

    public void setEmployerId(UUID employerId) {
        this.employerId = employerId;
    }

    public ModerationAction getAction() {
        return action;
    }

    public void setAction(ModerationAction action) {
        this.action = action;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getAdminUsername() {
        return adminUsername;
    }

    public void setAdminUsername(String adminUsername) {
        this.adminUsername = adminUsername;
    }

    public UUID getAdminId() {
        return adminId;
    }

    public void setAdminId(UUID adminId) {
        this.adminId = adminId;
    }

    public LocalDateTime getModeratedAt() {
        return moderatedAt;
    }

    public void setModeratedAt(LocalDateTime moderatedAt) {
        this.moderatedAt = moderatedAt;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public boolean isRequiresReview() {
        return requiresReview;
    }

    public void setRequiresReview(boolean requiresReview) {
        this.requiresReview = requiresReview;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }

    public String getJobLocation() {
        return jobLocation;
    }

    public void setJobLocation(String jobLocation) {
        this.jobLocation = jobLocation;
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

    public LocalDateTime getJobPostedAt() {
        return jobPostedAt;
    }

    public void setJobPostedAt(LocalDateTime jobPostedAt) {
        this.jobPostedAt = jobPostedAt;
    }

    public boolean isJobActive() {
        return jobActive;
    }

    public void setJobActive(boolean jobActive) {
        this.jobActive = jobActive;
    }

    public ModerationAction getPreviousAction() {
        return previousAction;
    }

    public void setPreviousAction(ModerationAction previousAction) {
        this.previousAction = previousAction;
    }

    public String getPreviousNotes() {
        return previousNotes;
    }

    public void setPreviousNotes(String previousNotes) {
        this.previousNotes = previousNotes;
    }

    public LocalDateTime getSubmittedForModerationAt() {
        return submittedForModerationAt;
    }

    public void setSubmittedForModerationAt(LocalDateTime submittedForModerationAt) {
        this.submittedForModerationAt = submittedForModerationAt;
    }

    public boolean isRemoderation() {
        return isRemoderation;
    }

    public void setRemoderation(boolean remoderation) {
        isRemoderation = remoderation;
    }

    public int getModerationAttempts() {
        return moderationAttempts;
    }

    public void setModerationAttempts(int moderationAttempts) {
        this.moderationAttempts = moderationAttempts;
    }

    // Helper methods
    public boolean isApproved() {
        return action == ModerationAction.APPROVED;
    }

    public boolean isRejected() {
        return action == ModerationAction.REJECTED;
    }

    public boolean isFlagged() {
        return action == ModerationAction.FLAGGED;
    }

    public boolean isPending() {
        return action == ModerationAction.PENDING;
    }

    public boolean hasNotes() {
        return notes != null && !notes.trim().isEmpty();
    }

    public boolean hasPreviousModeration() {
        return previousAction != null;
    }

    public boolean requiresAdminAttention() {
        return isFlagged() || requiresReview || moderationAttempts > 1;
    }

    public String getSalaryRange() {
        if (minSalary == null && maxSalary == null) {
            return "Not specified";
        }
        
        String currencySymbol = currency != null ? currency : "$";
        
        if (minSalary != null && maxSalary != null) {
            return String.format("%s%.0f - %s%.0f", currencySymbol, minSalary, currencySymbol, maxSalary);
        } else if (minSalary != null) {
            return String.format("From %s%.0f", currencySymbol, minSalary);
        } else {
            return String.format("Up to %s%.0f", currencySymbol, maxSalary);
        }
    }

    public String getModerationSummary() {
        String actionText = action != null ? action.getDisplayName() : "Unknown";
        String by = adminUsername != null ? " by " + adminUsername : "";
        return actionText + by;
    }

    @Override
    public String toString() {
        return "JobModerationDto{" +
                "jobId=" + jobId +
                ", jobTitle='" + jobTitle + '\'' +
                ", employerName='" + employerName + '\'' +
                ", action=" + action +
                ", adminUsername='" + adminUsername + '\'' +
                ", moderatedAt=" + moderatedAt +
                ", requiresReview=" + requiresReview +
                ", moderationAttempts=" + moderationAttempts +
                '}';
    }
}