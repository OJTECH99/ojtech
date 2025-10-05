package com.melardev.spring.jwtoauth.dtos.admin;

import com.melardev.spring.jwtoauth.entities.AdminJobMetadata.ModerationStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class AdminJobSearchDto {

    private String keyword;
    private String title;
    private String description;
    private String location;
    private String employmentType;
    private ModerationStatus moderationStatus;
    private UUID employerId;
    private String employerName;
    private Boolean isActive;
    private Boolean isFeatured;
    private Integer priorityLevel;
    private Double minSalary;
    private Double maxSalary;
    private String currency;
    private LocalDateTime postedAfter;
    private LocalDateTime postedBefore;
    private LocalDateTime updatedAfter;
    private LocalDateTime updatedBefore;
    private List<String> requiredSkills;
    private List<UUID> categoryIds;
    private String sortBy;
    private String sortDirection;
    private Integer page;
    private Integer size;

    // Constructors
    public AdminJobSearchDto() {}

    public AdminJobSearchDto(String keyword, String location, String employmentType) {
        this.keyword = keyword;
        this.location = location;
        this.employmentType = employmentType;
    }

    // Getters and Setters
    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
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

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public ModerationStatus getModerationStatus() {
        return moderationStatus;
    }

    public void setModerationStatus(ModerationStatus moderationStatus) {
        this.moderationStatus = moderationStatus;
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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsFeatured() {
        return isFeatured;
    }

    public void setIsFeatured(Boolean isFeatured) {
        this.isFeatured = isFeatured;
    }

    public Integer getPriorityLevel() {
        return priorityLevel;
    }

    public void setPriorityLevel(Integer priorityLevel) {
        this.priorityLevel = priorityLevel;
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

    public LocalDateTime getPostedAfter() {
        return postedAfter;
    }

    public void setPostedAfter(LocalDateTime postedAfter) {
        this.postedAfter = postedAfter;
    }

    public LocalDateTime getPostedBefore() {
        return postedBefore;
    }

    public void setPostedBefore(LocalDateTime postedBefore) {
        this.postedBefore = postedBefore;
    }

    public LocalDateTime getUpdatedAfter() {
        return updatedAfter;
    }

    public void setUpdatedAfter(LocalDateTime updatedAfter) {
        this.updatedAfter = updatedAfter;
    }

    public LocalDateTime getUpdatedBefore() {
        return updatedBefore;
    }

    public void setUpdatedBefore(LocalDateTime updatedBefore) {
        this.updatedBefore = updatedBefore;
    }

    public List<String> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(List<String> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public List<UUID> getCategoryIds() {
        return categoryIds;
    }

    public void setCategoryIds(List<UUID> categoryIds) {
        this.categoryIds = categoryIds;
    }

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }

    public String getSortDirection() {
        return sortDirection;
    }

    public void setSortDirection(String sortDirection) {
        this.sortDirection = sortDirection;
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getSize() {
        return size;
    }

    public void setSize(Integer size) {
        this.size = size;
    }

    // Helper methods
    public boolean hasKeywordSearch() {
        return keyword != null && !keyword.trim().isEmpty();
    }

    public boolean hasLocationFilter() {
        return location != null && !location.trim().isEmpty();
    }

    public boolean hasEmployerFilter() {
        return employerId != null || (employerName != null && !employerName.trim().isEmpty());
    }

    public boolean hasSalaryFilter() {
        return minSalary != null || maxSalary != null;
    }

    public boolean hasDateFilter() {
        return postedAfter != null || postedBefore != null || updatedAfter != null || updatedBefore != null;
    }

    public boolean hasCategoryFilter() {
        return categoryIds != null && !categoryIds.isEmpty();
    }

    public boolean hasSkillsFilter() {
        return requiredSkills != null && !requiredSkills.isEmpty();
    }

    @Override
    public String toString() {
        return "AdminJobSearchDto{" +
                "keyword='" + keyword + '\'' +
                ", location='" + location + '\'' +
                ", employmentType='" + employmentType + '\'' +
                ", moderationStatus=" + moderationStatus +
                ", employerId=" + employerId +
                ", isActive=" + isActive +
                ", isFeatured=" + isFeatured +
                ", priorityLevel=" + priorityLevel +
                ", minSalary=" + minSalary +
                ", maxSalary=" + maxSalary +
                ", page=" + page +
                ", size=" + size +
                '}';
    }
}