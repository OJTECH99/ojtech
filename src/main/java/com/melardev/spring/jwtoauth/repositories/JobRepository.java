package com.melardev.spring.jwtoauth.repositories;

import com.melardev.spring.jwtoauth.entities.EmployerProfile;
import com.melardev.spring.jwtoauth.entities.Job;
import com.melardev.spring.jwtoauth.entities.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {
    List<Job> findByEmployer(EmployerProfile employer);
    
    List<Job> findByActiveTrue();
    
    List<Job> findByActiveTrueAndEmployer(EmployerProfile employer);
    
    List<Job> findByStatus(JobStatus status);
    
    Page<Job> findByActive(boolean active, Pageable pageable);
    
    @Query("SELECT j FROM Job j WHERE j.active = true AND " +
           "(:location IS NULL OR j.location LIKE %:location%) AND " +
           "(:title IS NULL OR j.title LIKE %:title%)")
    Page<Job> searchJobs(String location, String title, Pageable pageable);
    
    @Query("SELECT j FROM Job j WHERE j.active = true AND " +
           "(:keyword IS NULL OR (j.title LIKE %:keyword% OR j.description LIKE %:keyword%))")
    Page<Job> searchJobsByKeyword(String keyword, Pageable pageable);
} 