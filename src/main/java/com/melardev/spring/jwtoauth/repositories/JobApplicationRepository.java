package com.melardev.spring.jwtoauth.repositories;

import com.melardev.spring.jwtoauth.entities.ApplicationStatus;
import com.melardev.spring.jwtoauth.entities.Job;
import com.melardev.spring.jwtoauth.entities.JobApplication;
import com.melardev.spring.jwtoauth.entities.StudentProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {
    List<JobApplication> findByStudent(StudentProfile student);
    Page<JobApplication> findByStudent(StudentProfile student, Pageable pageable);
    
    List<JobApplication> findByJob(Job job);
    Page<JobApplication> findByJob(Job job, Pageable pageable);
    
    List<JobApplication> findByJobAndStatus(Job job, ApplicationStatus status);
    List<JobApplication> findByStudentAndStatus(StudentProfile student, ApplicationStatus status);
    
    Optional<JobApplication> findByStudentAndJob(StudentProfile student, Job job);
    boolean existsByJobAndStudent(Job job, StudentProfile student);
} 