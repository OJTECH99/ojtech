package com.melardev.spring.jwtoauth.repositories;

import com.melardev.spring.jwtoauth.entities.JobCategoryMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobCategoryMappingRepository extends JpaRepository<JobCategoryMapping, UUID> {

    List<JobCategoryMapping> findByJobId(UUID jobId);

    List<JobCategoryMapping> findByCategoryId(UUID categoryId);

    @Query("SELECT jcm FROM JobCategoryMapping jcm WHERE jcm.job.id = :jobId AND jcm.category.id = :categoryId")
    JobCategoryMapping findByJobIdAndCategoryId(@Param("jobId") UUID jobId, @Param("categoryId") UUID categoryId);

    @Query("SELECT jcm.job.id FROM JobCategoryMapping jcm WHERE jcm.category.id = :categoryId")
    List<UUID> findJobIdsByCategoryId(@Param("categoryId") UUID categoryId);

    @Query("SELECT jcm.category.id FROM JobCategoryMapping jcm WHERE jcm.job.id = :jobId")
    List<UUID> findCategoryIdsByJobId(@Param("jobId") UUID jobId);

    @Query("SELECT COUNT(jcm) FROM JobCategoryMapping jcm WHERE jcm.category.id = :categoryId")
    long countJobsByCategoryId(@Param("categoryId") UUID categoryId);

    @Query("SELECT COUNT(jcm) FROM JobCategoryMapping jcm WHERE jcm.job.id = :jobId")
    long countCategoriesByJobId(@Param("jobId") UUID jobId);

    @Query("SELECT jcm FROM JobCategoryMapping jcm WHERE jcm.job.active = true AND jcm.category.id = :categoryId")
    List<JobCategoryMapping> findActiveJobsByCategoryId(@Param("categoryId") UUID categoryId);

    @Query("SELECT COUNT(jcm) FROM JobCategoryMapping jcm WHERE jcm.job.active = true AND jcm.category.id = :categoryId")
    long countActiveJobsByCategoryId(@Param("categoryId") UUID categoryId);

    @Query("SELECT jcm.category.id, COUNT(jcm) FROM JobCategoryMapping jcm GROUP BY jcm.category.id")
    List<Object[]> countJobsByCategory();

    @Query("SELECT jcm.category.id, COUNT(jcm) FROM JobCategoryMapping jcm WHERE jcm.job.active = true GROUP BY jcm.category.id")
    List<Object[]> countActiveJobsByCategory();

    void deleteByJobId(UUID jobId);

    void deleteByCategoryId(UUID categoryId);

    void deleteByJobIdAndCategoryId(UUID jobId, UUID categoryId);

    boolean existsByJobIdAndCategoryId(UUID jobId, UUID categoryId);

    @Query("SELECT jcm FROM JobCategoryMapping jcm WHERE jcm.job.employer.id = :employerId")
    List<JobCategoryMapping> findByEmployerId(@Param("employerId") UUID employerId);

    @Query("SELECT DISTINCT jcm.category FROM JobCategoryMapping jcm WHERE jcm.job.employer.id = :employerId")
    List<UUID> findDistinctCategoryIdsByEmployerId(@Param("employerId") UUID employerId);
}