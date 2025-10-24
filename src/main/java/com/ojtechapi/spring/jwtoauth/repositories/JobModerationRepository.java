package com.ojtechapi.spring.jwtoauth.repositories;

import com.ojtechapi.spring.jwtoauth.entities.JobModeration;
import com.ojtechapi.spring.jwtoauth.entities.JobModeration.ModerationAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobModerationRepository extends JpaRepository<JobModeration, UUID> {

    Optional<JobModeration> findByJobId(UUID jobId);

    List<JobModeration> findByAdminId(UUID adminId);

    List<JobModeration> findByAction(ModerationAction action);

    Page<JobModeration> findByAction(ModerationAction action, Pageable pageable);

    @Query("SELECT jm FROM JobModeration jm WHERE jm.admin.id = :adminId AND jm.action = :action")
    Page<JobModeration> findByAdminIdAndAction(@Param("adminId") UUID adminId, @Param("action") ModerationAction action, Pageable pageable);

    @Query("SELECT jm FROM JobModeration jm WHERE jm.createdAt BETWEEN :startDate AND :endDate")
    List<JobModeration> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT jm FROM JobModeration jm WHERE jm.job.employer.id = :employerId")
    List<JobModeration> findByEmployerId(@Param("employerId") UUID employerId);

    @Query("SELECT jm FROM JobModeration jm WHERE jm.job.employer.id = :employerId AND jm.action = :action")
    List<JobModeration> findByEmployerIdAndAction(@Param("employerId") UUID employerId, @Param("action") ModerationAction action);

    @Query("SELECT COUNT(jm) FROM JobModeration jm WHERE jm.action = :action")
    long countByAction(@Param("action") ModerationAction action);

    @Query("SELECT COUNT(jm) FROM JobModeration jm WHERE jm.admin.id = :adminId AND jm.createdAt BETWEEN :startDate AND :endDate")
    long countByAdminIdAndCreatedAtBetween(@Param("adminId") UUID adminId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT jm FROM JobModeration jm WHERE jm.action = :action ORDER BY jm.createdAt ASC")
    List<JobModeration> findPendingModerationsByDate(@Param("action") ModerationAction action);

    @Query("SELECT jm FROM JobModeration jm WHERE jm.job.title LIKE %:keyword% OR jm.notes LIKE %:keyword%")
    Page<JobModeration> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT jm FROM JobModeration jm JOIN jm.job j WHERE j.active = true AND jm.action = :action")
    List<JobModeration> findByActionForActiveJobs(@Param("action") ModerationAction action);

    void deleteByJobId(UUID jobId);

    boolean existsByJobId(UUID jobId);
}
