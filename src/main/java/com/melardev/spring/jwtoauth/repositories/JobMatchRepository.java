package com.melardev.spring.jwtoauth.repositories;

import com.melardev.spring.jwtoauth.entities.JobMatch;
import com.melardev.spring.jwtoauth.entities.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobMatchRepository extends JpaRepository<JobMatch, UUID> {
    
    List<JobMatch> findByStudentIdOrderByMatchScoreDesc(UUID studentId);
    
    List<JobMatch> findByJobIdOrderByMatchScoreDesc(UUID jobId);
    
    List<JobMatch> findByStudentIdAndMatchScoreGreaterThanEqual(UUID studentId, Double minScore);
    
    List<JobMatch> findByStudentIdAndJobId(UUID studentId, UUID jobId);
    
    void deleteByStudentIdAndJobId(UUID studentId, UUID jobId);
} 