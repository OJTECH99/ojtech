package com.ojtechapi.spring.jwtoauth.repositories;

import com.ojtechapi.spring.jwtoauth.entities.JobPerformanceMetrics;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobPerformanceMetricsRepository extends JpaRepository<JobPerformanceMetrics, UUID> {

    Optional<JobPerformanceMetrics> findByJobId(UUID jobId);

    @Query("SELECT jpm FROM JobPerformanceMetrics jpm WHERE jpm.calculatedAt BETWEEN :startDate AND :endDate")
    List<JobPerformanceMetrics> findByCalculatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT jpm FROM JobPerformanceMetrics jpm WHERE jpm.job.employer.id = :employerId")
    List<JobPerformanceMetrics> findByEmployerId(@Param("employerId") UUID employerId);

    @Query("SELECT jpm FROM JobPerformanceMetrics jpm WHERE jpm.job.employer.id = :employerId")
    Page<JobPerformanceMetrics> findByEmployerId(@Param("employerId") UUID employerId, Pageable pageable);

    @Query("SELECT jpm FROM JobPerformanceMetrics jpm WHERE jpm.conversionRate >= :minRate ORDER BY jpm.conversionRate DESC")
    List<JobPerformanceMetrics> findByMinConversionRate(@Param("minRate") BigDecimal minRate);

    @Query("SELECT jpm FROM JobPerformanceMetrics jpm WHERE jpm.clickThroughRate >= :minRate ORDER BY jpm.clickThroughRate DESC")
    List<JobPerformanceMetrics> findByMinClickThroughRate(@Param("minRate") BigDecimal minRate);

    @Query("SELECT jpm FROM JobPerformanceMetrics jpm WHERE jpm.viewsCount >= :minViews ORDER BY jpm.viewsCount DESC")
    List<JobPerformanceMetrics> findByMinViewsCount(@Param("minViews") Integer minViews);

    @Query("SELECT jpm FROM JobPerformanceMetrics jpm WHERE jpm.applicationsCount >= :minApplications ORDER BY jpm.applicationsCount DESC")
    List<JobPerformanceMetrics> findByMinApplicationsCount(@Param("minApplications") Integer minApplications);

    @Query("SELECT jpm FROM JobPerformanceMetrics jpm ORDER BY jpm.conversionRate DESC")
    List<JobPerformanceMetrics> findTopPerformingByConversionRate(Pageable pageable);

    @Query("SELECT jpm FROM JobPerformanceMetrics jpm ORDER BY jpm.viewsCount DESC")
    List<JobPerformanceMetrics> findTopPerformingByViews(Pageable pageable);

    @Query("SELECT jpm FROM JobPerformanceMetrics jpm ORDER BY jpm.applicationsCount DESC")
    List<JobPerformanceMetrics> findTopPerformingByApplications(Pageable pageable);

    @Query("SELECT jpm FROM JobPerformanceMetrics jpm WHERE jpm.job.active = true ORDER BY jpm.conversionRate DESC")
    List<JobPerformanceMetrics> findTopPerformingActiveJobs(Pageable pageable);

    @Query("SELECT AVG(jpm.conversionRate) FROM JobPerformanceMetrics jpm")
    BigDecimal findAverageConversionRate();

    @Query("SELECT AVG(jpm.clickThroughRate) FROM JobPerformanceMetrics jpm")
    BigDecimal findAverageClickThroughRate();

    @Query("SELECT AVG(jpm.viewsCount) FROM JobPerformanceMetrics jpm")
    Double findAverageViewsCount();

    @Query("SELECT AVG(jpm.applicationsCount) FROM JobPerformanceMetrics jpm")
    Double findAverageApplicationsCount();

    @Query("SELECT AVG(jpm.conversionRate) FROM JobPerformanceMetrics jpm WHERE jpm.job.employer.id = :employerId")
    BigDecimal findAverageConversionRateByEmployer(@Param("employerId") UUID employerId);

    @Query("SELECT SUM(jpm.viewsCount) FROM JobPerformanceMetrics jpm")
    Long findTotalViewsCount();

    @Query("SELECT SUM(jpm.applicationsCount) FROM JobPerformanceMetrics jpm")
    Long findTotalApplicationsCount();

    @Query("SELECT SUM(jpm.totalSearchAppearances) FROM JobPerformanceMetrics jpm")
    Long findTotalSearchAppearances();

    @Query("SELECT SUM(jpm.viewsCount) FROM JobPerformanceMetrics jpm WHERE jpm.job.employer.id = :employerId")
    Long findTotalViewsCountByEmployer(@Param("employerId") UUID employerId);

    @Query("SELECT SUM(jpm.applicationsCount) FROM JobPerformanceMetrics jpm WHERE jpm.job.employer.id = :employerId")
    Long findTotalApplicationsCountByEmployer(@Param("employerId") UUID employerId);

    @Query("SELECT jpm FROM JobPerformanceMetrics jpm WHERE jpm.timeToFirstApplicationHours IS NOT NULL ORDER BY jpm.timeToFirstApplicationHours ASC")
    List<JobPerformanceMetrics> findJobsWithFastestFirstApplication(Pageable pageable);

    @Query("SELECT AVG(jpm.timeToFirstApplicationHours) FROM JobPerformanceMetrics jpm WHERE jpm.timeToFirstApplicationHours IS NOT NULL")
    Double findAverageTimeToFirstApplication();

    @Query("SELECT jpm FROM JobPerformanceMetrics jpm WHERE " +
           "(jpm.job.title LIKE %:keyword% OR " +
           "jpm.job.description LIKE %:keyword% OR " +
           "jpm.job.location LIKE %:keyword%)")
    Page<JobPerformanceMetrics> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT jpm FROM JobPerformanceMetrics jpm WHERE jpm.job.location = :location")
    List<JobPerformanceMetrics> findByJobLocation(@Param("location") String location);

    @Query("SELECT jpm.job.location, AVG(jpm.conversionRate) FROM JobPerformanceMetrics jpm GROUP BY jpm.job.location")
    List<Object[]> findAverageConversionRateByLocation();

    @Query("SELECT jpm.job.employmentType, AVG(jpm.conversionRate) FROM JobPerformanceMetrics jpm GROUP BY jpm.job.employmentType")
    List<Object[]> findAverageConversionRateByEmploymentType();

    void deleteByJobId(UUID jobId);

    boolean existsByJobId(UUID jobId);

    @Query("SELECT COUNT(jpm) FROM JobPerformanceMetrics jpm WHERE jpm.conversionRate > :rate")
    long countJobsWithConversionRateAbove(@Param("rate") BigDecimal rate);

    @Query("SELECT COUNT(jpm) FROM JobPerformanceMetrics jpm WHERE jpm.applicationsCount = 0")
    long countJobsWithNoApplications();
}
