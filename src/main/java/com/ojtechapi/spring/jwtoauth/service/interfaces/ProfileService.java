package com.ojtechapi.spring.jwtoauth.service.interfaces;

import com.ojtechapi.spring.jwtoauth.entities.ERole;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

public interface ProfileService {
    
    // Multi-role Profile Management
    Map<String, Object> getCurrentUserProfile(UUID userId);
    boolean hasProfile(UUID userId, ERole role);
    Object getProfileByRole(UUID userId, ERole role);
    Map<String, Object> createProfileByRole(UUID userId, ERole role, Map<String, Object> profileData);
    
    // Common Profile Operations
    String uploadAvatar(UUID userId, ERole role, MultipartFile file);
    Map<String, Object> updateProfileByRole(UUID userId, ERole role, Map<String, Object> profileData);
    
    // Profile Validation
    boolean isProfileComplete(UUID userId, ERole role);
    double calculateProfileCompleteness(UUID userId, ERole role);
    
    // Utility Methods
    ERole determineUserRole(UUID userId);
    Map<String, Object> getProfileSummary(UUID userId);
} 
