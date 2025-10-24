package com.ojtechapi.spring.jwtoauth.service.interfaces;

import com.ojtechapi.spring.jwtoauth.entities.NLOProfile;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

public interface NLOProfileService {
    
    // Profile Management
    NLOProfile getCurrentProfile(UUID userId);
    NLOProfile createProfile(UUID userId, Map<String, Object> profileData);
    NLOProfile updateProfile(UUID userId, Map<String, Object> profileData);
    
    // Profile Operations
    String uploadCompanyLogo(UUID userId, MultipartFile file);
    NLOProfile updateCompanyInfo(UUID userId, String companyName, String industry, 
                                    String description, String website, String location);
    NLOProfile updateContactInfo(UUID userId, String contactPerson, String phone, String email);
    
    // Validation & Business Logic
    boolean isProfileComplete(NLOProfile profile);
    double calculateProfileCompleteness(NLOProfile profile);
    Map<String, Object> getProfileSummary(UUID userId);
    
    // Profile Data Processing
    NLOProfile buildProfileFromData(UUID userId, Map<String, Object> profileData);
}
