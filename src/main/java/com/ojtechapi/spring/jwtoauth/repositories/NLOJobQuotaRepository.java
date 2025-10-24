package com.ojtechapi.spring.jwtoauth.repositories;

import com.ojtechapi.spring.jwtoauth.entities.NLOJobQuota;
import com.ojtechapi.spring.jwtoauth.entities.NLOJobQuota.QuotaPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NLOJobQuotaRepository extends JpaRepository<NLOJobQuota, UUID> {

    Optional<NLOJobQuota> findByEmployerId(UUID employerId);

    List<NLOJobQuota> findByQuotaPeriod(QuotaPeriod quotaPeriod);

    @Query("SELECT ejq FROM NLOJobQuota ejq WHERE ejq.resetDate <= :currentTime")
    List<NLOJobQuota> findQuotasNeedingReset(@Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT ejq FROM NLOJobQuota ejq WHERE ejq.currentActiveCount >= ejq.maxActiveJobs")
    List<NLOJobQuota> findEmployersAtActiveJobLimit();

    @Query("SELECT ejq FROM NLOJobQuota ejq WHERE ejq.currentFeaturedCount >= ejq.maxFeaturedJobs")
    List<NLOJobQuota> findEmployersAtFeaturedJobLimit();

    @Query("SELECT ejq FROM NLOJobQuota ejq WHERE ejq.currentActiveCount < ejq.maxActiveJobs")
    List<NLOJobQuota> findEmployersUnderActiveJobLimit();

    @Query("SELECT ejq FROM NLOJobQuota ejq WHERE ejq.currentFeaturedCount < ejq.maxFeaturedJobs")
    List<NLOJobQuota> findEmployersUnderFeaturedJobLimit();

    @Query("SELECT AVG(ejq.maxActiveJobs) FROM NLOJobQuota ejq")
    Double findAverageMaxActiveJobs();

    @Query("SELECT AVG(ejq.maxFeaturedJobs) FROM NLOJobQuota ejq")
    Double findAverageMaxFeaturedJobs();

    @Query("SELECT AVG(ejq.currentActiveCount) FROM NLOJobQuota ejq")
    Double findAverageCurrentActiveCount();

    @Query("SELECT AVG(ejq.currentFeaturedCount) FROM NLOJobQuota ejq")
    Double findAverageCurrentFeaturedCount();

    @Query("SELECT SUM(ejq.maxActiveJobs) FROM NLOJobQuota ejq")
    Long findTotalMaxActiveJobs();

    @Query("SELECT SUM(ejq.currentActiveCount) FROM NLOJobQuota ejq")
    Long findTotalCurrentActiveJobs();

    @Query("SELECT ejq FROM NLOJobQuota ejq WHERE ejq.createdByAdmin.id = :adminId")
    List<NLOJobQuota> findByCreatedByAdminId(@Param("adminId") UUID adminId);

    @Query("SELECT COUNT(ejq) FROM NLOJobQuota ejq WHERE ejq.currentActiveCount >= ejq.maxActiveJobs")
    long countEmployersAtActiveJobLimit();

    @Query("SELECT COUNT(ejq) FROM NLOJobQuota ejq WHERE ejq.currentFeaturedCount >= ejq.maxFeaturedJobs")
    long countEmployersAtFeaturedJobLimit();

    @Query("SELECT ejq FROM NLOJobQuota ejq WHERE " +
           "(ejq.employer.companyName LIKE %:keyword% OR " +
           "ejq.employer.user.username LIKE %:keyword%)")
    List<NLOJobQuota> searchByKeyword(@Param("keyword") String keyword);

    boolean existsByEmployerId(UUID employerId);

    void deleteByEmployerId(UUID employerId);
}
