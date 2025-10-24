package com.ojtechapi.spring.jwtoauth.dtos.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

public class AdminJobStatisticsDto {

    // Basic counts
    private long totalJobs;
    private long activeJobs;
    private long inactiveJobs;
    private long featuredJobs;
    private long pendingModerationJobs;
    private long approvedJobs;
    private long rejectedJobs;
    private long flaggedJobs;

    // Application statistics
    private long totalApplications;
    private long pendingApplications;
    private long acceptedApplications;
    private long rejectedApplications;
    private double averageApplicationsPerJob;

    // Performance metrics
    private long totalJobViews;
    private double averageViewsPerJob;
    private BigDecimal averageConversionRate;
    private BigDecimal averageClickThroughRate;
    private double averageTimeToFirstApplication;

    // Employer statistics
    private long totalEmployers;
    private long activeEmployers;
    private double averageJobsPerEmployer;
    private long employersAtJobLimit;
    private long employersAtFeaturedLimit;

    // Category statistics
    private long totalCategories;
    private long activeCategories;
    private Map<String, Long> jobsByCategory;
    private Map<String, Long> applicationsByCategory;

    // Location statistics
    private Map<String, Long> jobsByLocation;
    private Map<String, BigDecimal> averageConversionByLocation;

    // Employment type statistics
    private Map<String, Long> jobsByEmploymentType;
    private Map<String, BigDecimal> averageConversionByEmploymentType;

    // Salary statistics
    private Double averageMinSalary;
    private Double averageMaxSalary;
    private Map<String, Double> averageSalaryByLocation;
    private Map<String, Double> averageSalaryByEmploymentType;

    // Time-based statistics
    private Map<String, Long> jobsCreatedByMonth;
    private Map<String, Long> applicationsByMonth;
    private LocalDateTime oldestJobDate;
    private LocalDateTime newestJobDate;

    // Priority statistics
    private Map<Integer, Long> jobsByPriority;
    private double averagePriority;

    // Generated metadata
    private LocalDateTime generatedAt;
    private String generatedBy;
    private String period;

    // Constructors
    public AdminJobStatisticsDto() {
        this.generatedAt = LocalDateTime.now();
    }

    public AdminJobStatisticsDto(String period, String generatedBy) {
        this();
        this.period = period;
        this.generatedBy = generatedBy;
    }

    // Getters and Setters
    public long getTotalJobs() {
        return totalJobs;
    }

    public void setTotalJobs(long totalJobs) {
        this.totalJobs = totalJobs;
    }

    public long getActiveJobs() {
        return activeJobs;
    }

    public void setActiveJobs(long activeJobs) {
        this.activeJobs = activeJobs;
    }

    public long getInactiveJobs() {
        return inactiveJobs;
    }

    public void setInactiveJobs(long inactiveJobs) {
        this.inactiveJobs = inactiveJobs;
    }

    public long getFeaturedJobs() {
        return featuredJobs;
    }

    public void setFeaturedJobs(long featuredJobs) {
        this.featuredJobs = featuredJobs;
    }

    public long getPendingModerationJobs() {
        return pendingModerationJobs;
    }

    public void setPendingModerationJobs(long pendingModerationJobs) {
        this.pendingModerationJobs = pendingModerationJobs;
    }

    public long getApprovedJobs() {
        return approvedJobs;
    }

    public void setApprovedJobs(long approvedJobs) {
        this.approvedJobs = approvedJobs;
    }

    public long getRejectedJobs() {
        return rejectedJobs;
    }

    public void setRejectedJobs(long rejectedJobs) {
        this.rejectedJobs = rejectedJobs;
    }

    public long getFlaggedJobs() {
        return flaggedJobs;
    }

    public void setFlaggedJobs(long flaggedJobs) {
        this.flaggedJobs = flaggedJobs;
    }

    public long getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(long totalApplications) {
        this.totalApplications = totalApplications;
    }

    public long getPendingApplications() {
        return pendingApplications;
    }

    public void setPendingApplications(long pendingApplications) {
        this.pendingApplications = pendingApplications;
    }

    public long getAcceptedApplications() {
        return acceptedApplications;
    }

    public void setAcceptedApplications(long acceptedApplications) {
        this.acceptedApplications = acceptedApplications;
    }

    public long getRejectedApplications() {
        return rejectedApplications;
    }

    public void setRejectedApplications(long rejectedApplications) {
        this.rejectedApplications = rejectedApplications;
    }

    public double getAverageApplicationsPerJob() {
        return averageApplicationsPerJob;
    }

    public void setAverageApplicationsPerJob(double averageApplicationsPerJob) {
        this.averageApplicationsPerJob = averageApplicationsPerJob;
    }

    public long getTotalJobViews() {
        return totalJobViews;
    }

    public void setTotalJobViews(long totalJobViews) {
        this.totalJobViews = totalJobViews;
    }

    public double getAverageViewsPerJob() {
        return averageViewsPerJob;
    }

    public void setAverageViewsPerJob(double averageViewsPerJob) {
        this.averageViewsPerJob = averageViewsPerJob;
    }

    public BigDecimal getAverageConversionRate() {
        return averageConversionRate;
    }

    public void setAverageConversionRate(BigDecimal averageConversionRate) {
        this.averageConversionRate = averageConversionRate;
    }

    public BigDecimal getAverageClickThroughRate() {
        return averageClickThroughRate;
    }

    public void setAverageClickThroughRate(BigDecimal averageClickThroughRate) {
        this.averageClickThroughRate = averageClickThroughRate;
    }

    public double getAverageTimeToFirstApplication() {
        return averageTimeToFirstApplication;
    }

    public void setAverageTimeToFirstApplication(double averageTimeToFirstApplication) {
        this.averageTimeToFirstApplication = averageTimeToFirstApplication;
    }

    public long getTotalEmployers() {
        return totalEmployers;
    }

    public void setTotalEmployers(long totalEmployers) {
        this.totalEmployers = totalEmployers;
    }

    public long getActiveEmployers() {
        return activeEmployers;
    }

    public void setActiveEmployers(long activeEmployers) {
        this.activeEmployers = activeEmployers;
    }

    public double getAverageJobsPerEmployer() {
        return averageJobsPerEmployer;
    }

    public void setAverageJobsPerEmployer(double averageJobsPerEmployer) {
        this.averageJobsPerEmployer = averageJobsPerEmployer;
    }

    public long getEmployersAtJobLimit() {
        return employersAtJobLimit;
    }

    public void setEmployersAtJobLimit(long employersAtJobLimit) {
        this.employersAtJobLimit = employersAtJobLimit;
    }

    public long getEmployersAtFeaturedLimit() {
        return employersAtFeaturedLimit;
    }

    public void setEmployersAtFeaturedLimit(long employersAtFeaturedLimit) {
        this.employersAtFeaturedLimit = employersAtFeaturedLimit;
    }

    public long getTotalCategories() {
        return totalCategories;
    }

    public void setTotalCategories(long totalCategories) {
        this.totalCategories = totalCategories;
    }

    public long getActiveCategories() {
        return activeCategories;
    }

    public void setActiveCategories(long activeCategories) {
        this.activeCategories = activeCategories;
    }

    public Map<String, Long> getJobsByCategory() {
        return jobsByCategory;
    }

    public void setJobsByCategory(Map<String, Long> jobsByCategory) {
        this.jobsByCategory = jobsByCategory;
    }

    public Map<String, Long> getApplicationsByCategory() {
        return applicationsByCategory;
    }

    public void setApplicationsByCategory(Map<String, Long> applicationsByCategory) {
        this.applicationsByCategory = applicationsByCategory;
    }

    public Map<String, Long> getJobsByLocation() {
        return jobsByLocation;
    }

    public void setJobsByLocation(Map<String, Long> jobsByLocation) {
        this.jobsByLocation = jobsByLocation;
    }

    public Map<String, BigDecimal> getAverageConversionByLocation() {
        return averageConversionByLocation;
    }

    public void setAverageConversionByLocation(Map<String, BigDecimal> averageConversionByLocation) {
        this.averageConversionByLocation = averageConversionByLocation;
    }

    public Map<String, Long> getJobsByEmploymentType() {
        return jobsByEmploymentType;
    }

    public void setJobsByEmploymentType(Map<String, Long> jobsByEmploymentType) {
        this.jobsByEmploymentType = jobsByEmploymentType;
    }

    public Map<String, BigDecimal> getAverageConversionByEmploymentType() {
        return averageConversionByEmploymentType;
    }

    public void setAverageConversionByEmploymentType(Map<String, BigDecimal> averageConversionByEmploymentType) {
        this.averageConversionByEmploymentType = averageConversionByEmploymentType;
    }

    public Double getAverageMinSalary() {
        return averageMinSalary;
    }

    public void setAverageMinSalary(Double averageMinSalary) {
        this.averageMinSalary = averageMinSalary;
    }

    public Double getAverageMaxSalary() {
        return averageMaxSalary;
    }

    public void setAverageMaxSalary(Double averageMaxSalary) {
        this.averageMaxSalary = averageMaxSalary;
    }

    public Map<String, Double> getAverageSalaryByLocation() {
        return averageSalaryByLocation;
    }

    public void setAverageSalaryByLocation(Map<String, Double> averageSalaryByLocation) {
        this.averageSalaryByLocation = averageSalaryByLocation;
    }

    public Map<String, Double> getAverageSalaryByEmploymentType() {
        return averageSalaryByEmploymentType;
    }

    public void setAverageSalaryByEmploymentType(Map<String, Double> averageSalaryByEmploymentType) {
        this.averageSalaryByEmploymentType = averageSalaryByEmploymentType;
    }

    public Map<String, Long> getJobsCreatedByMonth() {
        return jobsCreatedByMonth;
    }

    public void setJobsCreatedByMonth(Map<String, Long> jobsCreatedByMonth) {
        this.jobsCreatedByMonth = jobsCreatedByMonth;
    }

    public Map<String, Long> getApplicationsByMonth() {
        return applicationsByMonth;
    }

    public void setApplicationsByMonth(Map<String, Long> applicationsByMonth) {
        this.applicationsByMonth = applicationsByMonth;
    }

    public LocalDateTime getOldestJobDate() {
        return oldestJobDate;
    }

    public void setOldestJobDate(LocalDateTime oldestJobDate) {
        this.oldestJobDate = oldestJobDate;
    }

    public LocalDateTime getNewestJobDate() {
        return newestJobDate;
    }

    public void setNewestJobDate(LocalDateTime newestJobDate) {
        this.newestJobDate = newestJobDate;
    }

    public Map<Integer, Long> getJobsByPriority() {
        return jobsByPriority;
    }

    public void setJobsByPriority(Map<Integer, Long> jobsByPriority) {
        this.jobsByPriority = jobsByPriority;
    }

    public double getAveragePriority() {
        return averagePriority;
    }

    public void setAveragePriority(double averagePriority) {
        this.averagePriority = averagePriority;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public String getGeneratedBy() {
        return generatedBy;
    }

    public void setGeneratedBy(String generatedBy) {
        this.generatedBy = generatedBy;
    }

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    // Helper methods
    public double getJobActivationRate() {
        if (totalJobs == 0) return 0.0;
        return (double) activeJobs / totalJobs * 100;
    }

    public double getFeaturedJobRate() {
        if (totalJobs == 0) return 0.0;
        return (double) featuredJobs / totalJobs * 100;
    }

    public double getModerationApprovalRate() {
        long totalModerated = approvedJobs + rejectedJobs;
        if (totalModerated == 0) return 0.0;
        return (double) approvedJobs / totalModerated * 100;
    }

    public double getApplicationAcceptanceRate() {
        long totalProcessed = acceptedApplications + rejectedApplications;
        if (totalProcessed == 0) return 0.0;
        return (double) acceptedApplications / totalProcessed * 100;
    }

    public double getEmployerUtilizationRate() {
        if (totalEmployers == 0) return 0.0;
        return (double) activeEmployers / totalEmployers * 100;
    }

    @Override
    public String toString() {
        return "AdminJobStatisticsDto{" +
                "totalJobs=" + totalJobs +
                ", activeJobs=" + activeJobs +
                ", featuredJobs=" + featuredJobs +
                ", totalApplications=" + totalApplications +
                ", averageApplicationsPerJob=" + averageApplicationsPerJob +
                ", totalEmployers=" + totalEmployers +
                ", activeEmployers=" + activeEmployers +
                ", period='" + period + '\'' +
                ", generatedAt=" + generatedAt +
                ", generatedBy='" + generatedBy + '\'' +
                '}';
    }
}
