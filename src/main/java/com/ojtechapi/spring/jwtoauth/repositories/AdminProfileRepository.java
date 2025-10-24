package com.ojtechapi.spring.jwtoauth.repositories;

import com.ojtechapi.spring.jwtoauth.entities.AdminProfile;
import com.ojtechapi.spring.jwtoauth.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdminProfileRepository extends JpaRepository<AdminProfile, UUID> {
    Optional<AdminProfile> findByUser(User user);
    Optional<AdminProfile> findByUserId(UUID userId);
} 
