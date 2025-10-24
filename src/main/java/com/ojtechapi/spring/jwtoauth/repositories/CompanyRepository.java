package com.ojtechapi.spring.jwtoauth.repositories;

import com.ojtechapi.spring.jwtoauth.entities.Company;
import com.ojtechapi.spring.jwtoauth.entities.NLOProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Company entity
 * Manages partner companies created by NLO Staff
 */
@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {
    
    /**
     * Find all companies created by a specific NLO staff member
     */
    List<Company> findByCreatedByNLO(NLOProfile nloProfile);
    
    /**
     * Find all active companies
     */
    List<Company> findByActiveTrue();
    
    /**
     * Find company by name
     */
    Optional<Company> findByName(String name);
    
    /**
     * Find company by email
     */
    Optional<Company> findByEmail(String email);
    
    /**
     * Check if company exists by name
     */
    boolean existsByName(String name);
    
    /**
     * Check if company exists by email
     */
    boolean existsByEmail(String email);
}
