package com.melardev.spring.jwtoauth.repositories;

import com.melardev.spring.jwtoauth.entities.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, UUID> {
    Optional<StudentProfile> findByUserId(UUID userId);
    @Query("SELECT s FROM StudentProfile s WHERE s.activeCvId IS NOT NULL")
    List<StudentProfile> findAllWithActiveCVs();
    List<StudentProfile> findByVerified(boolean verified);
}