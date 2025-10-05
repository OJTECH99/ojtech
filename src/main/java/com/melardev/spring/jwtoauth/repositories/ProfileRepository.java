package com.melardev.spring.jwtoauth.repositories;

import com.melardev.spring.jwtoauth.entities.Profile;
import com.melardev.spring.jwtoauth.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    Optional<Profile> findByUser(User user);
    Optional<Profile> findByUserId(UUID userId);
} 