package com.melardev.spring.jwtoauth.dtos.admin;

import com.melardev.spring.jwtoauth.entities.AdminJobMetadata.ModerationStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class AdminJobFilterDto {

    private List<UUID> employerIds;
    private List<String> locations;
    private List<String> employmentTypes;
    private List<ModerationStatus> moderationStatuses;
    private Boolean isActive;
    private Boolean isFeatured;
    private List<Integer> priorityLevels;
    private Double minSalary;
    private Double maxSalary;
    private List<String> currencies;
    private LocalDateTime postedAfter;
    private LocalDateTime postedBefore;
    private LocalDateTime updatedAfter;
    private LocalDateTime updatedBefore;
    private List<UUID> categoryIds;
    private List<String> requiredSkills;
    private Integer minApplications;
    private Integer maxApplications;
    private Integer minViews;
    private Integer maxViews;
    private Boolean hasApplications;
    private Boolean hasViews;

    // Constructors
    public AdminJobFilterDto() {}

    // Getters and Setters
    public List<UUID> getEmployerIds() {
        return employerIds;
    }

    public void setEmployerIds(List<UUID> employerIds) {
        this.employerIds = employerIds;
    }

    public List<String> getLocations() {
        return locations;
    }

    public void setLocations(List<String> locations) {
        this.locations = locations;
    }

    public List<String> getEmploymentTypes() {
        return employmentTypes;
    }

    public void setEmploymentTypes(List<String> employmentTypes) {
        this.employmentTypes = employmentTypes;
    }

    public List<ModerationStatus> getModerationStatuses() {
        return moderationStatuses;
    }

    public void setModerationStatuses(List<ModerationStatus> moderationStatuses) {
        this.moderationStatuses = moderationStatuses;
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

    public List<Integer> getPriorityLevels() {
        return priorityLevels;
    }

    public void setPriorityLevels(List<Integer> priorityLevels) {
        this.priorityLevels = priorityLevels;
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

    public List<String> getCurrencies() {
        return currencies;
    }

    public void setCurrencies(List<String> currencies) {
        this.currencies = currencies;
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

    public List<UUID> getCategoryIds() {
        return categoryIds;
    }

    public void setCategoryIds(List<UUID> categoryIds) {
        this.categoryIds = categoryIds;
    }

    public List<String> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(List<String> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public Integer getMinApplications() {
        return minApplications;
    }

    public void setMinApplications(Integer minApplications) {
        this.minApplications = minApplications;
    }

    public Integer getMaxApplications() {
        return maxApplications;
    }

    public void setMaxApplications(Integer maxApplications) {
        this.maxApplications = maxApplications;
    }

    public Integer getMinViews() {
        return minViews;
    }

    public void setMinViews(Integer minViews) {
        this.minViews = minViews;
    }

    public Integer getMaxViews() {
        return maxViews;
    }

    public void setMaxViews(Integer maxViews) {
        this.maxViews = maxViews;
    }

    public Boolean getHasApplications() {
        return hasApplications;
    }

    public void setHasApplications(Boolean hasApplications) {
        this.hasApplications = hasApplications;
    }

    public Boolean getHasViews() {
        return hasViews;
    }

    public void setHasViews(Boolean hasViews) {
        this.hasViews = hasViews;
    }

    // Helper methods
    public boolean hasEmployerFilter() {
        return employerIds != null && !employerIds.isEmpty();
    }

    public boolean hasLocationFilter() {
        return locations != null && !locations.isEmpty();
    }

    public boolean hasEmploymentTypeFilter() {
        return employmentTypes != null && !employmentTypes.isEmpty();
    }

    public boolean hasModerationStatusFilter() {
        return moderationStatuses != null && !moderationStatuses.isEmpty();
    }

    public boolean hasPriorityFilter() {
        return priorityLevels != null && !priorityLevels.isEmpty();
    }

    public boolean hasSalaryFilter() {
        return minSalary != null || maxSalary != null;
    }

    public boolean hasCurrencyFilter() {
        return currencies != null && !currencies.isEmpty();
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

    public boolean hasPerformanceFilter() {
        return minApplications != null || maxApplications != null || minViews != null || maxViews != null ||
               hasApplications != null || hasViews != null;
    }

    public boolean hasActiveFilters() {
        return hasEmployerFilter() || hasLocationFilter() || hasEmploymentTypeFilter() || 
               hasModerationStatusFilter() || hasPriorityFilter() || hasSalaryFilter() ||
               hasCurrencyFilter() || hasDateFilter() || hasCategoryFilter() || 
               hasSkillsFilter() || hasPerformanceFilter() || isActive != null || isFeatured != null;
    }

    @Override
    public String toString() {
        return "AdminJobFilterDto{" +
                "employerIds=" + (employerIds != null ? employerIds.size() : 0) + " items" +
                ", locations=" + (locations != null ? locations.size() : 0) + " items" +
                ", employmentTypes=" + (employmentTypes != null ? employmentTypes.size() : 0) + " items" +
                ", moderationStatuses=" + (moderationStatuses != null ? moderationStatuses.size() : 0) + " items" +
                ", isActive=" + isActive +
                ", isFeatured=" + isFeatured +
                ", minSalary=" + minSalary +
                ", maxSalary=" + maxSalary +
                ", hasActiveFilters=" + hasActiveFilters() +
                '}';
    }
}