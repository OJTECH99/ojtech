package com.melardev.spring.jwtoauth.repositories;

import com.melardev.spring.jwtoauth.entities.JobAuditTrail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface JobAuditTrailRepository extends JpaRepository<JobAuditTrail, UUID> {

    List<JobAuditTrail> findByJobIdOrderByTimestampDesc(UUID jobId);

    Page<JobAuditTrail> findByJobIdOrderByTimestampDesc(UUID jobId, Pageable pageable);

    List<JobAuditTrail> findByUserIdOrderByTimestampDesc(UUID userId);

    Page<JobAuditTrail> findByUserIdOrderByTimestampDesc(UUID userId, Pageable pageable);

    List<JobAuditTrail> findByActionOrderByTimestampDesc(String action);

    Page<JobAuditTrail> findByActionOrderByTimestampDesc(String action, Pageable pageable);

    @Query("SELECT jat FROM JobAuditTrail jat WHERE jat.timestamp BETWEEN :startDate AND :endDate ORDER BY jat.timestamp DESC")
    List<JobAuditTrail> findByTimestampBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT jat FROM JobAuditTrail jat WHERE jat.timestamp BETWEEN :startDate AND :endDate ORDER BY jat.timestamp DESC")
    Page<JobAuditTrail> findByTimestampBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query("SELECT jat FROM JobAuditTrail jat WHERE jat.job.id = :jobId AND jat.timestamp BETWEEN :startDate AND :endDate ORDER BY jat.timestamp DESC")
    List<JobAuditTrail> findByJobIdAndTimestampBetween(@Param("jobId") UUID jobId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT jat FROM JobAuditTrail jat WHERE jat.user.id = :userId AND jat.action = :action ORDER BY jat.timestamp DESC")
    List<JobAuditTrail> findByUserIdAndAction(@Param("userId") UUID userId, @Param("action") String action);

    @Query("SELECT jat FROM JobAuditTrail jat WHERE jat.userRole = :userRole ORDER BY jat.timestamp DESC")
    List<JobAuditTrail> findByUserRole(@Param("userRole") String userRole);

    @Query("SELECT jat FROM JobAuditTrail jat WHERE jat.userRole = :userRole ORDER BY jat.timestamp DESC")
    Page<JobAuditTrail> findByUserRole(@Param("userRole") String userRole, Pageable pageable);

    @Query("SELECT jat FROM JobAuditTrail jat WHERE jat.job.employer.id = :employerId ORDER BY jat.timestamp DESC")
    List<JobAuditTrail> findByEmployerId(@Param("employerId") UUID employerId);

    @Query("SELECT jat FROM JobAuditTrail jat WHERE jat.job.employer.id = :employerId ORDER BY jat.timestamp DESC")
    Page<JobAuditTrail> findByEmployerId(@Param("employerId") UUID employerId, Pageable pageable);

    @Query("SELECT COUNT(jat) FROM JobAuditTrail jat WHERE jat.action = :action")
    long countByAction(@Param("action") String action);

    @Query("SELECT COUNT(jat) FROM JobAuditTrail jat WHERE jat.user.id = :userId AND jat.timestamp BETWEEN :startDate AND :endDate")
    long countByUserIdAndTimestampBetween(@Param("userId") UUID userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT DISTINCT jat.action FROM JobAuditTrail jat ORDER BY jat.action")
    List<String> findDistinctActions();

    @Query("SELECT jat FROM JobAuditTrail jat WHERE " +
           "(jat.action LIKE %:keyword% OR " +
           "jat.user.username LIKE %:keyword% OR " +
           "jat.job.title LIKE %:keyword%) " +
           "ORDER BY jat.timestamp DESC")
    Page<JobAuditTrail> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT jat FROM JobAuditTrail jat WHERE jat.ipAddress = :ipAddress ORDER BY jat.timestamp DESC")
    List<JobAuditTrail> findByIpAddress(@Param("ipAddress") String ipAddress);

    void deleteByJobId(UUID jobId);

    @Query("DELETE FROM JobAuditTrail jat WHERE jat.timestamp < :cutoffDate")
    void deleteOldAuditTrails(@Param("cutoffDate") LocalDateTime cutoffDate);
}