package com.ojtechapi.spring.jwtoauth.repositories;

import com.ojtechapi.spring.jwtoauth.entities.NLOProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NLOProfileRepository extends JpaRepository<NLOProfile, UUID> {
    Optional<NLOProfile> findByUserId(UUID userId);
}
