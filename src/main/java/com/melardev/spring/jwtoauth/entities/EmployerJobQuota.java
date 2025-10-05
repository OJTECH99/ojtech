package com.melardev.spring.jwtoauth.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "employer_job_quotas")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class EmployerJobQuota {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false, unique = true)
    private EmployerProfile employer;

    @Column(name = "max_active_jobs", nullable = false)
    private Integer maxActiveJobs = 10;

    @Column(name = "max_featured_jobs", nullable = false)
    private Integer maxFeaturedJobs = 2;

    @Enumerated(EnumType.STRING)
    @Column(name = "quota_period", nullable = false)
    private QuotaPeriod quotaPeriod = QuotaPeriod.MONTHLY;

    @Column(name = "current_active_count", nullable = false)
    private Integer currentActiveCount = 0;

    @Column(name = "current_featured_count", nullable = false)
    private Integer currentFeaturedCount = 0;

    @Column(name = "reset_date", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime resetDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_admin")
    private User createdByAdmin;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    // Constructors
    public EmployerJobQuota() {
        this.resetDate = LocalDateTime.now();
    }

    public EmployerJobQuota(EmployerProfile employer, Integer maxActiveJobs, Integer maxFeaturedJobs, QuotaPeriod quotaPeriod) {
        this.employer = employer;
        this.maxActiveJobs = maxActiveJobs;
        this.maxFeaturedJobs = maxFeaturedJobs;
        this.quotaPeriod = quotaPeriod;
        this.resetDate = calculateNextResetDate();
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public EmployerProfile getEmployer() {
        return employer;
    }

    public void setEmployer(EmployerProfile employer) {
        this.employer = employer;
    }

    public Integer getMaxActiveJobs() {
        return maxActiveJobs;
    }

    public void setMaxActiveJobs(Integer maxActiveJobs) {
        this.maxActiveJobs = maxActiveJobs;
    }

    public Integer getMaxFeaturedJobs() {
        return maxFeaturedJobs;
    }

    public void setMaxFeaturedJobs(Integer maxFeaturedJobs) {
        this.maxFeaturedJobs = maxFeaturedJobs;
    }

    public QuotaPeriod getQuotaPeriod() {
        return quotaPeriod;
    }

    public void setQuotaPeriod(QuotaPeriod quotaPeriod) {
        this.quotaPeriod = quotaPeriod;
        this.resetDate = calculateNextResetDate();
    }

    public Integer getCurrentActiveCount() {
        return currentActiveCount;
    }

    public void setCurrentActiveCount(Integer currentActiveCount) {
        this.currentActiveCount = currentActiveCount;
    }

    public Integer getCurrentFeaturedCount() {
        return currentFeaturedCount;
    }

    public void setCurrentFeaturedCount(Integer currentFeaturedCount) {
        this.currentFeaturedCount = currentFeaturedCount;
    }

    public LocalDateTime getResetDate() {
        return resetDate;
    }

    public void setResetDate(LocalDateTime resetDate) {
        this.resetDate = resetDate;
    }

    public User getCreatedByAdmin() {
        return createdByAdmin;
    }

    public void setCreatedByAdmin(User createdByAdmin) {
        this.createdByAdmin = createdByAdmin;
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

    // Helper methods
    public boolean canCreateActiveJob() {
        return currentActiveCount < maxActiveJobs;
    }

    public boolean canCreateFeaturedJob() {
        return currentFeaturedCount < maxFeaturedJobs;
    }

    public Integer getRemainingActiveJobs() {
        return Math.max(0, maxActiveJobs - currentActiveCount);
    }

    public Integer getRemainingFeaturedJobs() {
        return Math.max(0, maxFeaturedJobs - currentFeaturedCount);
    }

    public boolean isResetDue() {
        return LocalDateTime.now().isAfter(resetDate);
    }

    public void resetCounters() {
        this.currentActiveCount = 0;
        this.currentFeaturedCount = 0;
        this.resetDate = calculateNextResetDate();
    }

    public void incrementActiveCount() {
        this.currentActiveCount++;
    }

    public void decrementActiveCount() {
        if (this.currentActiveCount > 0) {
            this.currentActiveCount--;
        }
    }

    public void incrementFeaturedCount() {
        this.currentFeaturedCount++;
    }

    public void decrementFeaturedCount() {
        if (this.currentFeaturedCount > 0) {
            this.currentFeaturedCount--;
        }
    }

    private LocalDateTime calculateNextResetDate() {
        LocalDateTime now = LocalDateTime.now();
        switch (quotaPeriod) {
            case DAILY:
                return now.plusDays(1);
            case WEEKLY:
                return now.plusWeeks(1);
            case MONTHLY:
                return now.plusMonths(1);
            case YEARLY:
                return now.plusYears(1);
            default:
                return now.plusMonths(1);
        }
    }

    // Enum for quota periods
    public enum QuotaPeriod {
        DAILY("Daily"),
        WEEKLY("Weekly"), 
        MONTHLY("Monthly"),
        YEARLY("Yearly");

        private final String displayName;

        QuotaPeriod(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    @Override
    public String toString() {
        return "EmployerJobQuota{" +
                "id=" + id +
                ", employerId=" + (employer != null ? employer.getId() : null) +
                ", maxActiveJobs=" + maxActiveJobs +
                ", maxFeaturedJobs=" + maxFeaturedJobs +
                ", quotaPeriod=" + quotaPeriod +
                ", currentActiveCount=" + currentActiveCount +
                ", currentFeaturedCount=" + currentFeaturedCount +
                ", resetDate=" + resetDate +
                '}';
    }
}