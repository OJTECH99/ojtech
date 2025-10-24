package com.ojtechapi.spring.jwtoauth.repositories;

import com.ojtechapi.spring.jwtoauth.entities.JobCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobCategoryRepository extends JpaRepository<JobCategory, UUID> {

    Optional<JobCategory> findByName(String name);

    List<JobCategory> findByIsActive(Boolean isActive);

    List<JobCategory> findByParentCategoryIsNullOrderBySortOrder();

    List<JobCategory> findByParentCategoryIsNullAndIsActiveTrueOrderBySortOrder();

    List<JobCategory> findByParentCategoryIdOrderBySortOrder(UUID parentCategoryId);

    List<JobCategory> findByParentCategoryIdAndIsActiveTrueOrderBySortOrder(UUID parentCategoryId);

    @Query("SELECT jc FROM JobCategory jc WHERE jc.parentCategory IS NULL ORDER BY jc.sortOrder")
    List<JobCategory> findRootCategories();

    @Query("SELECT jc FROM JobCategory jc WHERE jc.parentCategory IS NULL AND jc.isActive = true ORDER BY jc.sortOrder")
    List<JobCategory> findActiveRootCategories();

    @Query("SELECT jc FROM JobCategory jc WHERE jc.parentCategory.id = :parentId ORDER BY jc.sortOrder")
    List<JobCategory> findSubCategories(@Param("parentId") UUID parentId);

    @Query("SELECT jc FROM JobCategory jc WHERE jc.parentCategory.id = :parentId AND jc.isActive = true ORDER BY jc.sortOrder")
    List<JobCategory> findActiveSubCategories(@Param("parentId") UUID parentId);

    @Query("SELECT jc FROM JobCategory jc WHERE jc.name LIKE %:keyword% OR jc.description LIKE %:keyword%")
    List<JobCategory> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT jc FROM JobCategory jc WHERE (jc.name LIKE %:keyword% OR jc.description LIKE %:keyword%) AND jc.isActive = true")
    List<JobCategory> searchActiveByKeyword(@Param("keyword") String keyword);

    @Query("SELECT COUNT(jc) FROM JobCategory jc WHERE jc.parentCategory.id = :parentId")
    long countSubCategories(@Param("parentId") UUID parentId);

    @Query("SELECT COUNT(jc) FROM JobCategory jc WHERE jc.parentCategory.id = :parentId AND jc.isActive = true")
    long countActiveSubCategories(@Param("parentId") UUID parentId);

    @Query("SELECT jc FROM JobCategory jc WHERE jc.createdByAdmin.id = :adminId")
    List<JobCategory> findByCreatedByAdminId(@Param("adminId") UUID adminId);

    @Query("SELECT MAX(jc.sortOrder) FROM JobCategory jc WHERE jc.parentCategory IS NULL")
    Integer findMaxSortOrderForRootCategories();

    @Query("SELECT MAX(jc.sortOrder) FROM JobCategory jc WHERE jc.parentCategory.id = :parentId")
    Integer findMaxSortOrderForSubCategories(@Param("parentId") UUID parentId);

    @Query("SELECT DISTINCT jc FROM JobCategory jc LEFT JOIN FETCH jc.subCategories WHERE jc.parentCategory IS NULL ORDER BY jc.sortOrder")
    List<JobCategory> findRootCategoriesWithSubCategories();

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, UUID id);

    @Query("SELECT COUNT(jcm) FROM JobCategoryMapping jcm WHERE jcm.category.id = :categoryId")
    long countJobsByCategoryId(@Param("categoryId") UUID categoryId);

    @Query("SELECT jc FROM JobCategory jc WHERE SIZE(jc.subCategories) = 0")
    List<JobCategory> findLeafCategories();

    @Query("SELECT jc FROM JobCategory jc WHERE SIZE(jc.subCategories) > 0")
    List<JobCategory> findParentCategories();
}
