package com.melardev.spring.jwtoauth.service.interfaces;

import com.melardev.spring.jwtoauth.entities.EmployerProfile;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

public interface EmployerProfileService {
    
    // Profile Management
    EmployerProfile getCurrentProfile(UUID userId);
    EmployerProfile createProfile(UUID userId, Map<String, Object> profileData);
    EmployerProfile updateProfile(UUID userId, Map<String, Object> profileData);
    
    // Profile Operations
    String uploadCompanyLogo(UUID userId, MultipartFile file);
    EmployerProfile updateCompanyInfo(UUID userId, String companyName, String industry, 
                                    String description, String website, String location);
    EmployerProfile updateContactInfo(UUID userId, String contactPerson, String phone, String email);
    
    // Validation & Business Logic
    boolean isProfileComplete(EmployerProfile profile);
    double calculateProfileCompleteness(EmployerProfile profile);
    Map<String, Object> getProfileSummary(UUID userId);
    
    // Profile Data Processing
    EmployerProfile buildProfileFromData(UUID userId, Map<String, Object> profileData);
} 