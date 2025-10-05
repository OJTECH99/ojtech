package com.melardev.spring.jwtoauth.service.interfaces;

import com.melardev.spring.jwtoauth.entities.StudentProfile;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface StudentProfileService {
    
    // Profile Management
    Map<String, Object> getCurrentProfileAsMap(UUID userId);
    StudentProfile getCurrentProfile(UUID userId);
    StudentProfile createProfile(UUID userId, Map<String, Object> profileData);
    StudentProfile updateProfile(UUID userId, Map<String, Object> profileData);
    StudentProfile completeOnboarding(UUID userId, Map<String, Object> onboardingData);
    
    // Profile Validation
    boolean isProfileComplete(StudentProfile profile);
    double calculateProfileCompleteness(StudentProfile profile);
    Map<String, Object> getProfileSummary(UUID userId);
    
    // Profile Operations
    String uploadProfilePhoto(UUID userId, MultipartFile file);
    StudentProfile addEducation(UUID userId, String degree, String institution, 
                               LocalDate startDate, LocalDate endDate, String fieldOfStudy);
    StudentProfile addSkills(UUID userId, List<String> skills);
    StudentProfile updateBio(UUID userId, String bio);
    StudentProfile updateContactInfo(UUID userId, String phone, String location, String linkedIn, String github);
    
    // CV Management (Student-specific)
    Map<String, Object> createCVForStudent(UUID userId, String template, String additionalInfo);
    List<Map<String, Object>> getCVsForStudent(UUID userId);
    boolean activateCV(UUID userId, UUID cvId);
} 