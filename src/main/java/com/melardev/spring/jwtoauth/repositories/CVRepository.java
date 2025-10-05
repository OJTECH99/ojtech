package com.melardev.spring.jwtoauth.repositories;

import com.melardev.spring.jwtoauth.entities.CV;
import com.melardev.spring.jwtoauth.entities.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CVRepository extends JpaRepository<CV, UUID> {
    List<CV> findByStudent(StudentProfile student);
    
    List<CV> findByStudentAndActive(StudentProfile student, boolean active);
    
    List<CV> findByStudentOrderByLastUpdatedDesc(StudentProfile student);
} 