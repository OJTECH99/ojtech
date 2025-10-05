package com.melardev.spring.jwtoauth.repositories;

import com.melardev.spring.jwtoauth.entities.AdminJobMetadata;
import com.melardev.spring.jwtoauth.entities.AdminJobMetadata.ModerationStatus;
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
public interface AdminJobMetadataRepository extends JpaRepository<AdminJobMetadata, UUID> {

    Optional<AdminJobMetadata> findByJobId(UUID jobId);

    List<AdminJobMetadata> findByModerationStatus(ModerationStatus moderationStatus);

    Page<AdminJobMetadata> findByModerationStatus(ModerationStatus moderationStatus, Pageable pageable);

    List<AdminJobMetadata> findByIsFeatured(Boolean isFeatured);

    Page<AdminJobMetadata> findByIsFeatured(Boolean isFeatured, Pageable pageable);

    @Query("SELECT ajm FROM AdminJobMetadata ajm WHERE ajm.isFeatured = true AND (ajm.featuredUntil IS NULL OR ajm.featuredUntil > :currentTime)")
    List<AdminJobMetadata> findCurrentlyFeatured(@Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT ajm FROM AdminJobMetadata ajm WHERE ajm.isFeatured = true AND ajm.featuredUntil IS NOT NULL AND ajm.featuredUntil <= :currentTime")
    List<AdminJobMetadata> findExpiredFeatured(@Param("currentTime") LocalDateTime currentTime);

    List<AdminJobMetadata> findByPriorityLevel(Integer priorityLevel);

    Page<AdminJobMetadata> findByPriorityLevel(Integer priorityLevel, Pageable pageable);

    @Query("SELECT ajm FROM AdminJobMetadata ajm WHERE ajm.priorityLevel >= :minPriority ORDER BY ajm.priorityLevel DESC")
    List<AdminJobMetadata> findByMinPriorityLevel(@Param("minPriority") Integer minPriority);

    List<AdminJobMetadata> findByCreatedByAdminId(UUID adminId);

    Page<AdminJobMetadata> findByCreatedByAdminId(UUID adminId, Pageable pageable);

    List<AdminJobMetadata> findByUpdatedByAdminId(UUID adminId);

    @Query("SELECT ajm FROM AdminJobMetadata ajm WHERE ajm.createdAt BETWEEN :startDate AND :endDate")
    List<AdminJobMetadata> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT ajm FROM AdminJobMetadata ajm WHERE ajm.job.employer.id = :employerId")
    List<AdminJobMetadata> findByEmployerId(@Param("employerId") UUID employerId);

    @Query("SELECT ajm FROM AdminJobMetadata ajm WHERE ajm.job.employer.id = :employerId AND ajm.moderationStatus = :status")
    List<AdminJobMetadata> findByEmployerIdAndModerationStatus(@Param("employerId") UUID employerId, @Param("status") ModerationStatus status);

    @Query("SELECT COUNT(ajm) FROM AdminJobMetadata ajm WHERE ajm.moderationStatus = :status")
    long countByModerationStatus(@Param("status") ModerationStatus status);

    @Query("SELECT COUNT(ajm) FROM AdminJobMetadata ajm WHERE ajm.isFeatured = true AND (ajm.featuredUntil IS NULL OR ajm.featuredUntil > :currentTime)")
    long countCurrentlyFeatured(@Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT COUNT(ajm) FROM AdminJobMetadata ajm WHERE ajm.priorityLevel = :priority")
    long countByPriorityLevel(@Param("priority") Integer priority);

    @Query("SELECT ajm FROM AdminJobMetadata ajm WHERE " +
           "(ajm.job.title LIKE %:keyword% OR " +
           "ajm.adminNotes LIKE %:keyword% OR " +
           "ajm.job.description LIKE %:keyword%)")
    Page<AdminJobMetadata> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT ajm FROM AdminJobMetadata ajm WHERE ajm.moderationStatus = :status AND ajm.job.active = true")
    List<AdminJobMetadata> findByModerationStatusForActiveJobs(@Param("status") ModerationStatus status);

    @Query("SELECT ajm FROM AdminJobMetadata ajm WHERE ajm.isFeatured = true AND ajm.job.active = true ORDER BY ajm.priorityLevel DESC, ajm.updatedAt DESC")
    List<AdminJobMetadata> findFeaturedActiveJobs();

    @Query("SELECT ajm FROM AdminJobMetadata ajm WHERE ajm.isFeatured = true AND ajm.job.active = true ORDER BY ajm.priorityLevel DESC, ajm.updatedAt DESC")
    Page<AdminJobMetadata> findFeaturedActiveJobs(Pageable pageable);

    @Query("SELECT DISTINCT ajm.priorityLevel FROM AdminJobMetadata ajm ORDER BY ajm.priorityLevel")
    List<Integer> findDistinctPriorityLevels();

    void deleteByJobId(UUID jobId);

    boolean existsByJobId(UUID jobId);

    @Query("UPDATE AdminJobMetadata ajm SET ajm.isFeatured = false WHERE ajm.featuredUntil IS NOT NULL AND ajm.featuredUntil <= :currentTime")
    int updateExpiredFeatured(@Param("currentTime") LocalDateTime currentTime);
}