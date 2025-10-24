package com.ojtechapi.spring.jwtoauth.repositories;

import com.ojtechapi.spring.jwtoauth.entities.StudentEmailTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentEmailTrackingRepository extends JpaRepository<StudentEmailTracking, UUID> {
    
    Optional<StudentEmailTracking> findByStudentIdAndEmailDate(UUID studentId, LocalDate emailDate);
    
}
