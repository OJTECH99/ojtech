package com.ojtechapi.spring.jwtoauth.repositories;

import com.ojtechapi.spring.jwtoauth.entities.WorkExperience;
import com.ojtechapi.spring.jwtoauth.entities.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Repository
public interface WorkExperienceRepository extends JpaRepository<WorkExperience, UUID> {
    Set<WorkExperience> findByStudentId(UUID studentId);
    Set<WorkExperience> findByStudent(StudentProfile student);
    Set<WorkExperience> findByCvId(UUID cvId);
} 
