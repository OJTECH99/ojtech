package com.ojtechapi.spring.jwtoauth.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ojtechapi.spring.jwtoauth.entities.*;
import com.ojtechapi.spring.jwtoauth.repositories.*;
import com.ojtechapi.spring.jwtoauth.service.CloudinaryService;
import com.ojtechapi.spring.jwtoauth.service.interfaces.CVService;
import com.ojtechapi.spring.jwtoauth.service.interfaces.StudentProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class StudentProfileServiceImpl implements StudentProfileService {

    private static final Logger logger = LoggerFactory.getLogger(StudentProfileServiceImpl.class);

    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final CVRepository cvRepository;
    private final CertificationRepository certificationRepository;
    private final WorkExperienceRepository workExperienceRepository;
    private final CloudinaryService cloudinaryService;
    private final CVService cvService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public StudentProfileServiceImpl(StudentProfileRepository studentProfileRepository,
                                   UserRepository userRepository,
                                   CVRepository cvRepository,
                                   CertificationRepository certificationRepository,
                                   WorkExperienceRepository workExperienceRepository,
                                   CloudinaryService cloudinaryService,
                                   CVService cvService) {
        this.studentProfileRepository = studentProfileRepository;
        this.userRepository = userRepository;
        this.cvRepository = cvRepository;
        this.certificationRepository = certificationRepository;
        this.workExperienceRepository = workExperienceRepository;
        this.cloudinaryService = cloudinaryService;
        this.cvService = cvService;
    }

    @Override
    public Map<String, Object> getCurrentProfileAsMap(UUID userId) {
        logger.info("Getting profile for user ID: {}", userId);

        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            logger.warn("No profile found for user ID: {}", userId);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found");
        }

        StudentProfile profile = profileOpt.get();

        // Create a response map with all profile properties
        Map<String, Object> responseMap = new HashMap<>();

        // Add all basic profile fields
        responseMap.put("id", profile.getId());
        responseMap.put("firstName", profile.getFirstName());
        responseMap.put("lastName", profile.getLastName());
        responseMap.put("fullName", profile.getFullName());
        responseMap.put("location", profile.getLocation());
        responseMap.put("phone", profile.getPhoneNumber());
        responseMap.put("email", profile.getUser() != null ? profile.getUser().getEmail() : null);
        responseMap.put("bio", profile.getBio());
        responseMap.put("degree", profile.getMajor()); // major as degree
        responseMap.put("institution", profile.getUniversity());
        responseMap.put("fieldOfStudy", profile.getMajor());
        responseMap.put("graduationDate", profile.getGraduationYear());
        responseMap.put("skills", profile.getSkills());
        responseMap.put("linkedIn", profile.getLinkedinUrl());
        responseMap.put("github", profile.getGithubUrl());
        responseMap.put("profilePictureUrl", profile.getAvatarUrl());
        responseMap.put("onboardingCompleted", profile.isHasCompletedOnboarding());
        responseMap.put("createdAt", profile.getCreatedAt());
        responseMap.put("updatedAt", profile.getUpdatedAt());

        // Calculate profile completeness
        responseMap.put("profileCompleteness", calculateProfileCompleteness(profile));

        return responseMap;
    }

    @Override
    public StudentProfile getCurrentProfile(UUID userId) {
        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found");
        }
        return profileOpt.get();
    }

    @Override
    public StudentProfile createProfile(UUID userId, Map<String, Object> profileData) {
        // Check if user exists
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        // Check if profile already exists
        Optional<StudentProfile> existingProfile = studentProfileRepository.findByUserId(userId);
        if (existingProfile.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Student profile already exists");
        }

        StudentProfile profile = buildProfileFromData(userId, profileData);
        profile.setUser(userOpt.get());
        profile.setCreatedAt(LocalDateTime.now());
        profile.setUpdatedAt(LocalDateTime.now());

        return studentProfileRepository.save(profile);
    }

    @Override
    public StudentProfile updateProfile(UUID userId, Map<String, Object> profileData) {
        StudentProfile profile = getCurrentProfile(userId);
        updateProfileFromData(profile, profileData);
        profile.setUpdatedAt(LocalDateTime.now());
        return studentProfileRepository.save(profile);
    }

    @Override
    public StudentProfile completeOnboarding(UUID userId, Map<String, Object> onboardingData) {
        StudentProfile profile = getCurrentProfile(userId);
        
        // Process onboarding data
        updateProfileFromData(profile, onboardingData);
        
        // Mark onboarding as completed
        profile.setHasCompletedOnboarding(true);
        profile.setUpdatedAt(LocalDateTime.now());
        
        logger.info("Onboarding completed for user {}", userId);
        return studentProfileRepository.save(profile);
    }

    @Override
    public boolean isProfileComplete(StudentProfile profile) {
        return profile.getFirstName() != null && !profile.getFirstName().trim().isEmpty() &&
               profile.getLastName() != null && !profile.getLastName().trim().isEmpty() &&
               profile.getUser() != null && profile.getUser().getEmail() != null && !profile.getUser().getEmail().trim().isEmpty() &&
               profile.getBio() != null && !profile.getBio().trim().isEmpty() &&
               profile.getMajor() != null && !profile.getMajor().trim().isEmpty() &&
               profile.getUniversity() != null && !profile.getUniversity().trim().isEmpty() &&
               profile.getSkills() != null && !profile.getSkills().trim().isEmpty();
    }

    @Override
    public double calculateProfileCompleteness(StudentProfile profile) {
        int totalFields = 10;
        int completedFields = 0;

        if (profile.getFirstName() != null && !profile.getFirstName().trim().isEmpty()) completedFields++;
        if (profile.getLastName() != null && !profile.getLastName().trim().isEmpty()) completedFields++;
        if (profile.getEmail() != null && !profile.getEmail().trim().isEmpty()) completedFields++;
        if (profile.getPhone() != null && !profile.getPhone().trim().isEmpty()) completedFields++;
        if (profile.getLocation() != null && !profile.getLocation().trim().isEmpty()) completedFields++;
        if (profile.getBio() != null && !profile.getBio().trim().isEmpty()) completedFields++;
        if (profile.getDegree() != null && !profile.getDegree().trim().isEmpty()) completedFields++;
        if (profile.getInstitution() != null && !profile.getInstitution().trim().isEmpty()) completedFields++;
        if (profile.getSkills() != null && !profile.getSkills().isEmpty()) completedFields++;
        if (profile.getProfilePictureUrl() != null && !profile.getProfilePictureUrl().trim().isEmpty()) completedFields++;

        return (double) completedFields / totalFields * 100;
    }

    @Override
    public Map<String, Object> getProfileSummary(UUID userId) {
        StudentProfile profile = getCurrentProfile(userId);
        Map<String, Object> summary = new HashMap<>();
        
        summary.put("name", profile.getFullName());
        summary.put("degree", profile.getDegree());
        summary.put("institution", profile.getInstitution());
        summary.put("location", profile.getLocation());
        summary.put("skillCount", profile.getSkills() != null ? profile.getSkills().length() : 0);
        summary.put("profileCompleteness", calculateProfileCompleteness(profile));
        summary.put("onboardingCompleted", profile.isOnboardingCompleted());
        
        return summary;
    }

    @Override
    public String uploadProfilePhoto(UUID userId, MultipartFile file) {
        try {
            StudentProfile profile = getCurrentProfile(userId);
            String imageUrl = cloudinaryService.uploadImage(file);
            profile.setProfilePictureUrl(imageUrl);
            profile.setUpdatedAt(LocalDateTime.now());
            studentProfileRepository.save(profile);
            return imageUrl;
        } catch (IOException e) {
            logger.error("Failed to upload profile photo for user {}", userId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload profile photo");
        }
    }

    @Override
    public StudentProfile addEducation(UUID userId, String degree, String institution, 
                                     LocalDate startDate, LocalDate endDate, String fieldOfStudy) {
        StudentProfile profile = getCurrentProfile(userId);
        profile.setDegree(degree);
        profile.setInstitution(institution);
        profile.setFieldOfStudy(fieldOfStudy);
        profile.setGraduationDate(endDate);
        profile.setUpdatedAt(LocalDateTime.now());
        return studentProfileRepository.save(profile);
    }

    @Override
    public StudentProfile addSkills(UUID userId, List<String> skills) {
        StudentProfile profile = getCurrentProfile(userId);
        
        // Merge with existing skills
        Set<String> allSkills = new HashSet<>();
        if (profile.getSkills() != null && !profile.getSkills().isEmpty()) {
            // Split existing skills string into a list
            String[] existingSkills = profile.getSkills().split(",");
            for (String skill : existingSkills) {
                allSkills.add(skill.trim());
            }
        }
        allSkills.addAll(skills);
        
        profile.setSkills(new ArrayList<>(allSkills));
        profile.setUpdatedAt(LocalDateTime.now());
        return studentProfileRepository.save(profile);
    }

    @Override
    public StudentProfile updateBio(UUID userId, String bio) {
        StudentProfile profile = getCurrentProfile(userId);
        profile.setBio(bio);
        profile.setUpdatedAt(LocalDateTime.now());
        return studentProfileRepository.save(profile);
    }

    @Override
    public StudentProfile updateContactInfo(UUID userId, String phone, String location, String linkedIn, String github) {
        StudentProfile profile = getCurrentProfile(userId);
        if (phone != null) profile.setPhone(phone);
        if (location != null) profile.setLocation(location);
        if (linkedIn != null) profile.setLinkedIn(linkedIn);
        if (github != null) profile.setGithub(github);
        profile.setUpdatedAt(LocalDateTime.now());
        return studentProfileRepository.save(profile);
    }

    @Override
    public Map<String, Object> createCVForStudent(UUID userId, String template, String additionalInfo) {
        CV cv = cvService.generateCV(userId, template, additionalInfo);
        
        Map<String, Object> response = new HashMap<>();
        response.put("cvId", cv.getId());
        response.put("message", "CV generated successfully");
        response.put("template", cv.getTemplate());
        response.put("active", cv.isActive());
        response.put("createdAt", cv.getCreatedAt());
        
        return response;
    }

    @Override
    public List<Map<String, Object>> getCVsForStudent(UUID userId) {
        List<CV> cvs = cvService.getCVsByStudent(userId);
        
        return cvs.stream().map(cv -> {
            Map<String, Object> cvMap = new HashMap<>();
            cvMap.put("id", cv.getId());
            cvMap.put("template", cv.getTemplate());
            cvMap.put("active", cv.isActive());
            cvMap.put("createdAt", cv.getCreatedAt());
            cvMap.put("updatedAt", cv.getUpdatedAt());
            return cvMap;
        }).collect(Collectors.toList());
    }

    @Override
    public boolean activateCV(UUID userId, UUID cvId) {
        // First, deactivate all existing CVs for this student
        List<CV> existingCVs = cvService.getCVsByStudent(userId);
        for (CV existingCV : existingCVs) {
            if (existingCV.isActive()) {
                existingCV.setActive(false);
                cvRepository.save(existingCV);
            }
        }
        
        // Activate the specified CV
        CV cv = cvService.getCVById(cvId, userId);
        cv.setActive(true);
        cv.setUpdatedAt(LocalDateTime.now());
        cvRepository.save(cv);
        
        logger.info("Activated CV {} for user {}", cvId, userId);
        return true;
    }

    // Helper methods
    private StudentProfile buildProfileFromData(UUID userId, Map<String, Object> profileData) {
        StudentProfile profile = new StudentProfile();
        updateProfileFromData(profile, profileData);
        return profile;
    }

    private void updateProfileFromData(StudentProfile profile, Map<String, Object> profileData) {
        if (profileData.containsKey("firstName")) {
            profile.setFirstName((String) profileData.get("firstName"));
        }
        if (profileData.containsKey("lastName")) {
            profile.setLastName((String) profileData.get("lastName"));
        }
        if (profileData.containsKey("email")) {
            profile.setEmail((String) profileData.get("email"));
        }
        if (profileData.containsKey("phone")) {
            profile.setPhone((String) profileData.get("phone"));
        }
        if (profileData.containsKey("location")) {
            profile.setLocation((String) profileData.get("location"));
        }
        if (profileData.containsKey("bio")) {
            profile.setBio((String) profileData.get("bio"));
        }
        if (profileData.containsKey("degree")) {
            profile.setDegree((String) profileData.get("degree"));
        }
        if (profileData.containsKey("institution")) {
            profile.setInstitution((String) profileData.get("institution"));
        }
        if (profileData.containsKey("fieldOfStudy")) {
            profile.setFieldOfStudy((String) profileData.get("fieldOfStudy"));
        }
        if (profileData.containsKey("graduationDate")) {
            Object gradDateObj = profileData.get("graduationDate");
            if (gradDateObj instanceof String) {
                try {
                    LocalDate gradDate = LocalDate.parse((String) gradDateObj, DateTimeFormatter.ISO_LOCAL_DATE);
                    profile.setGraduationDate(gradDate);
                } catch (Exception e) {
                    logger.warn("Failed to parse graduation date: {}", gradDateObj);
                }
            }
        }
        if (profileData.containsKey("skills")) {
            Object skillsObj = profileData.get("skills");
            if (skillsObj instanceof List) {
                @SuppressWarnings("unchecked")
                List<String> skills = (List<String>) skillsObj;
                profile.setSkills(skills);
            } else if (skillsObj instanceof String) {
                // Handle comma-separated skills string
                String skillsStr = (String) skillsObj;
                List<String> skills = Arrays.asList(skillsStr.split(","))
                        .stream()
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList());
                profile.setSkills(skills);
            }
        }
        if (profileData.containsKey("linkedIn")) {
            profile.setLinkedIn((String) profileData.get("linkedIn"));
        }
        if (profileData.containsKey("github")) {
            profile.setGithub((String) profileData.get("github"));
        }
    }
} 
