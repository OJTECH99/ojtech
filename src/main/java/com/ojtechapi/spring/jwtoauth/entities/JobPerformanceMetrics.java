package com.ojtechapi.spring.jwtoauth.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "job_performance_metrics")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class JobPerformanceMetrics {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false, unique = true)
    private Job job;

    @Column(name = "views_count", nullable = false)
    private Integer viewsCount = 0;

    @Column(name = "applications_count", nullable = false)
    private Integer applicationsCount = 0;

    @Column(name = "conversion_rate", precision = 5, scale = 2)
    private BigDecimal conversionRate = BigDecimal.ZERO;

    @Column(name = "avg_application_quality_score", precision = 3, scale = 2)
    private BigDecimal avgApplicationQualityScore;

    @Column(name = "time_to_first_application_hours")
    private Integer timeToFirstApplicationHours;

    @Column(name = "total_search_appearances", nullable = false)
    private Integer totalSearchAppearances = 0;

    @Column(name = "click_through_rate", precision = 5, scale = 2)
    private BigDecimal clickThroughRate = BigDecimal.ZERO;

    @UpdateTimestamp
    @Column(name = "calculated_at", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime calculatedAt;

    @Column(name = "period_start", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime periodStart;

    @Column(name = "period_end", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime periodEnd;

    // Constructors
    public JobPerformanceMetrics() {
        this.periodStart = LocalDateTime.now();
        this.periodEnd = LocalDateTime.now();
    }

    public JobPerformanceMetrics(Job job) {
        this.job = job;
        this.periodStart = LocalDateTime.now();
        this.periodEnd = LocalDateTime.now();
    }

    public JobPerformanceMetrics(Job job, Integer viewsCount, Integer applicationsCount) {
        this.job = job;
        this.viewsCount = viewsCount;
        this.applicationsCount = applicationsCount;
        this.periodStart = LocalDateTime.now();
        this.periodEnd = LocalDateTime.now();
        calculateConversionRate();
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public Integer getViewsCount() {
        return viewsCount;
    }

    public void setViewsCount(Integer viewsCount) {
        this.viewsCount = viewsCount;
        calculateConversionRate();
    }

    public Integer getApplicationsCount() {
        return applicationsCount;
    }

    public void setApplicationsCount(Integer applicationsCount) {
        this.applicationsCount = applicationsCount;
        calculateConversionRate();
    }

    public BigDecimal getConversionRate() {
        return conversionRate;
    }

    public void setConversionRate(BigDecimal conversionRate) {
        this.conversionRate = conversionRate;
    }

    public BigDecimal getAvgApplicationQualityScore() {
        return avgApplicationQualityScore;
    }

    public void setAvgApplicationQualityScore(BigDecimal avgApplicationQualityScore) {
        this.avgApplicationQualityScore = avgApplicationQualityScore;
    }

    public Integer getTimeToFirstApplicationHours() {
        return timeToFirstApplicationHours;
    }

    public void setTimeToFirstApplicationHours(Integer timeToFirstApplicationHours) {
        this.timeToFirstApplicationHours = timeToFirstApplicationHours;
    }

    public Integer getTotalSearchAppearances() {
        return totalSearchAppearances;
    }

    public void setTotalSearchAppearances(Integer totalSearchAppearances) {
        this.totalSearchAppearances = totalSearchAppearances;
        calculateClickThroughRate();
    }

    public BigDecimal getClickThroughRate() {
        return clickThroughRate;
    }

    public void setClickThroughRate(BigDecimal clickThroughRate) {
        this.clickThroughRate = clickThroughRate;
    }

    public LocalDateTime getCalculatedAt() {
        return calculatedAt;
    }

    public void setCalculatedAt(LocalDateTime calculatedAt) {
        this.calculatedAt = calculatedAt;
    }

    public LocalDateTime getPeriodStart() {
        return periodStart;
    }

    public void setPeriodStart(LocalDateTime periodStart) {
        this.periodStart = periodStart;
    }

    public LocalDateTime getPeriodEnd() {
        return periodEnd;
    }

    public void setPeriodEnd(LocalDateTime periodEnd) {
        this.periodEnd = periodEnd;
    }

    // Helper methods
    public void calculateConversionRate() {
        if (viewsCount != null && viewsCount > 0 && applicationsCount != null) {
            this.conversionRate = BigDecimal.valueOf(applicationsCount)
                    .divide(BigDecimal.valueOf(viewsCount), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        } else {
            this.conversionRate = BigDecimal.ZERO;
        }
    }

    public void calculateClickThroughRate() {
        if (totalSearchAppearances != null && totalSearchAppearances > 0 && viewsCount != null) {
            this.clickThroughRate = BigDecimal.valueOf(viewsCount)
                    .divide(BigDecimal.valueOf(totalSearchAppearances), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        } else {
            this.clickThroughRate = BigDecimal.ZERO;
        }
    }

    public void incrementViews() {
        this.viewsCount = (this.viewsCount == null) ? 1 : this.viewsCount + 1;
        calculateConversionRate();
        calculateClickThroughRate();
    }

    public void incrementApplications() {
        this.applicationsCount = (this.applicationsCount == null) ? 1 : this.applicationsCount + 1;
        calculateConversionRate();
    }

    public void incrementSearchAppearances() {
        this.totalSearchAppearances = (this.totalSearchAppearances == null) ? 1 : this.totalSearchAppearances + 1;
        calculateClickThroughRate();
    }

    @Override
    public String toString() {
        return "JobPerformanceMetrics{" +
                "id=" + id +
                ", jobId=" + (job != null ? job.getId() : null) +
                ", viewsCount=" + viewsCount +
                ", applicationsCount=" + applicationsCount +
                ", conversionRate=" + conversionRate +
                ", calculatedAt=" + calculatedAt +
                '}';
    }
}
