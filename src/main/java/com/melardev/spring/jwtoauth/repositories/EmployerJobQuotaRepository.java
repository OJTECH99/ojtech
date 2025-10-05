package com.melardev.spring.jwtoauth.repositories;

import com.melardev.spring.jwtoauth.entities.EmployerJobQuota;
import com.melardev.spring.jwtoauth.entities.EmployerJobQuota.QuotaPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployerJobQuotaRepository extends JpaRepository<EmployerJobQuota, UUID> {

    Optional<EmployerJobQuota> findByEmployerId(UUID employerId);

    List<EmployerJobQuota> findByQuotaPeriod(QuotaPeriod quotaPeriod);

    @Query("SELECT ejq FROM EmployerJobQuota ejq WHERE ejq.resetDate <= :currentTime")
    List<EmployerJobQuota> findQuotasNeedingReset(@Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT ejq FROM EmployerJobQuota ejq WHERE ejq.currentActiveCount >= ejq.maxActiveJobs")
    List<EmployerJobQuota> findEmployersAtActiveJobLimit();

    @Query("SELECT ejq FROM EmployerJobQuota ejq WHERE ejq.currentFeaturedCount >= ejq.maxFeaturedJobs")
    List<EmployerJobQuota> findEmployersAtFeaturedJobLimit();

    @Query("SELECT ejq FROM EmployerJobQuota ejq WHERE ejq.currentActiveCount < ejq.maxActiveJobs")
    List<EmployerJobQuota> findEmployersUnderActiveJobLimit();

    @Query("SELECT ejq FROM EmployerJobQuota ejq WHERE ejq.currentFeaturedCount < ejq.maxFeaturedJobs")
    List<EmployerJobQuota> findEmployersUnderFeaturedJobLimit();

    @Query("SELECT AVG(ejq.maxActiveJobs) FROM EmployerJobQuota ejq")
    Double findAverageMaxActiveJobs();

    @Query("SELECT AVG(ejq.maxFeaturedJobs) FROM EmployerJobQuota ejq")
    Double findAverageMaxFeaturedJobs();

    @Query("SELECT AVG(ejq.currentActiveCount) FROM EmployerJobQuota ejq")
    Double findAverageCurrentActiveCount();

    @Query("SELECT AVG(ejq.currentFeaturedCount) FROM EmployerJobQuota ejq")
    Double findAverageCurrentFeaturedCount();

    @Query("SELECT SUM(ejq.maxActiveJobs) FROM EmployerJobQuota ejq")
    Long findTotalMaxActiveJobs();

    @Query("SELECT SUM(ejq.currentActiveCount) FROM EmployerJobQuota ejq")
    Long findTotalCurrentActiveJobs();

    @Query("SELECT ejq FROM EmployerJobQuota ejq WHERE ejq.createdByAdmin.id = :adminId")
    List<EmployerJobQuota> findByCreatedByAdminId(@Param("adminId") UUID adminId);

    @Query("SELECT COUNT(ejq) FROM EmployerJobQuota ejq WHERE ejq.currentActiveCount >= ejq.maxActiveJobs")
    long countEmployersAtActiveJobLimit();

    @Query("SELECT COUNT(ejq) FROM EmployerJobQuota ejq WHERE ejq.currentFeaturedCount >= ejq.maxFeaturedJobs")
    long countEmployersAtFeaturedJobLimit();

    @Query("SELECT ejq FROM EmployerJobQuota ejq WHERE " +
           "(ejq.employer.companyName LIKE %:keyword% OR " +
           "ejq.employer.user.username LIKE %:keyword%)")
    List<EmployerJobQuota> searchByKeyword(@Param("keyword") String keyword);

    boolean existsByEmployerId(UUID employerId);

    void deleteByEmployerId(UUID employerId);
}