package com.ojtechapi.spring.jwtoauth.controller;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ojtechapi.spring.jwtoauth.dtos.responses.MessageResponse;
import com.ojtechapi.spring.jwtoauth.entities.AdminProfile;
import com.ojtechapi.spring.jwtoauth.entities.ERole;
import com.ojtechapi.spring.jwtoauth.entities.NLOProfile;
import com.ojtechapi.spring.jwtoauth.entities.Profile;
import com.ojtechapi.spring.jwtoauth.entities.StudentProfile;
import com.ojtechapi.spring.jwtoauth.entities.User;
import com.ojtechapi.spring.jwtoauth.entities.UserRole;
import com.ojtechapi.spring.jwtoauth.exceptions.ResourceNotFoundException;
import com.ojtechapi.spring.jwtoauth.repositories.AdminProfileRepository;
import com.ojtechapi.spring.jwtoauth.repositories.NLOProfileRepository;
import com.ojtechapi.spring.jwtoauth.repositories.StudentProfileRepository;
import com.ojtechapi.spring.jwtoauth.repositories.UserRepository;
import com.ojtechapi.spring.jwtoauth.security.services.UserDetailsImpl;
import com.ojtechapi.spring.jwtoauth.security.utils.SecurityUtils;
import com.ojtechapi.spring.jwtoauth.service.CloudinaryService;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private static final Logger logger = LoggerFactory.getLogger(ProfileController.class);

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private NLOProfileRepository NLOProfileRepository;
    
    @Autowired
    private AdminProfileRepository adminProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUserProfile() {
        logger.debug("GET /api/profiles/me called");
        
        // Get current user ID using SecurityUtils
        UUID userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            logger.error("User ID is null - user not properly authenticated");
            return ResponseEntity.status(401).body(new MessageResponse("User not authenticated"));
        }
        
        logger.debug("Extracted userId from token: {}", userId);

        // Check if user exists
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            logger.error("User with ID {} not found", userId);
            return ResponseEntity.status(404).body(new MessageResponse("User not found"));
        }
        
        User user = userOpt.get();
        logger.debug("Found user: {}", user.getUsername());

        // Check if user has a student profile
        Optional<StudentProfile> studentProfile = studentProfileRepository.findByUserId(userId);
        if (studentProfile.isPresent()) {
            logger.debug("Found student profile for user");
            StudentProfile profile = studentProfile.get();
            
            // Convert skills string to array for frontend
            Map<String, Object> responseMap = new HashMap<>();
            
            // Copy all profile properties
            responseMap.put("id", profile.getId());
            responseMap.put("firstName", profile.getFirstName());
            responseMap.put("lastName", profile.getLastName());
            responseMap.put("fullName", profile.getFullName());
            responseMap.put("university", profile.getUniversity());
            responseMap.put("major", profile.getMajor());
            responseMap.put("graduationYear", profile.getGraduationYear());
            
            // Convert skills from comma-separated string to array
            if (profile.getSkills() != null && !profile.getSkills().isEmpty()) {
                responseMap.put("skills", Arrays.asList(profile.getSkills().split(",")));
            } else {
                responseMap.put("skills", Collections.emptyList());
            }
            
            responseMap.put("githubUrl", profile.getGithubUrl());
            responseMap.put("linkedinUrl", profile.getLinkedinUrl());
            responseMap.put("portfolioUrl", profile.getPortfolioUrl());
            responseMap.put("bio", profile.getBio());
            if (profile.getBio() != null && !profile.getBio().isEmpty()) {
                responseMap.put("bio", profile.getBio());
            }
            else {
                responseMap.put("bio", Collections.emptyList());
            }
            responseMap.put("phoneNumber", profile.getPhoneNumber());
            responseMap.put("hasCompletedOnboarding", profile.isHasCompletedOnboarding());
            responseMap.put("activeCvId", profile.getActiveCvId());
            responseMap.put("role", profile.getRole());
            responseMap.put("avatarUrl", profile.getAvatarUrl());
            
            // Try to parse GitHub projects if available
            if (profile.getGithubProjects() != null && !profile.getGithubProjects().isEmpty()) {
                try {
                    Object projectsObj = new com.fasterxml.jackson.databind.ObjectMapper().readValue(profile.getGithubProjects(), Object.class);
                    responseMap.put("githubProjects", projectsObj);
                } catch (Exception e) {
                    logger.error("Error parsing GitHub projects", e);
                    responseMap.put("githubProjects", Collections.emptyList());
                }
            } else {
                responseMap.put("githubProjects", Collections.emptyList());
            }
            
            // Include certifications and experiences
            responseMap.put("certifications", profile.getCertifications());
            responseMap.put("experiences", profile.getExperiences());
            
            return ResponseEntity.ok(responseMap);
        }

        // Check if user has an employer profile
        Optional<NLOProfile> NLOProfile = NLOProfileRepository.findByUserId(userId);
        if (NLOProfile.isPresent()) {
            logger.debug("Found employer profile for user");
            return ResponseEntity.ok(NLOProfile.get());
        }
        
        // Check if user has an admin profile
        Optional<AdminProfile> adminProfile = adminProfileRepository.findByUserId(userId);
        if (adminProfile.isPresent()) {
            logger.debug("Found admin profile for user");
            return ResponseEntity.ok(adminProfile.get());
        }

        // If no profile exists, return 404 with a helpful message
        logger.warn("No profile found for user ID: {}", userId);
        return ResponseEntity.status(404).body(new MessageResponse("No profile found. Please complete onboarding."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProfileById(@PathVariable UUID id) {
        // Check if it's a student profile
        Optional<StudentProfile> studentProfile = studentProfileRepository.findById(id);
        if (studentProfile.isPresent()) {
            return ResponseEntity.ok(studentProfile.get());
        }

        // Check if it's an employer profile
        Optional<NLOProfile> NLOProfile = NLOProfileRepository.findById(id);
        if (NLOProfile.isPresent()) {
            return ResponseEntity.ok(NLOProfile.get());
        }
        
        // Check if it's an admin profile
        Optional<AdminProfile> adminProfile = adminProfileRepository.findById(id);
        if (adminProfile.isPresent()) {
            return ResponseEntity.ok(adminProfile.get());
        }

        // If no profile found with the given ID
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping("/employer/onboarding")
    @PreAuthorize("hasRole('NLO')")
    public ResponseEntity<?> completeEmployerOnboarding(@RequestBody Map<String, Object> profileData) {
        logger.debug("POST /api/profile/employer/onboarding called");
        
        // Get current user ID
        UUID userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            logger.error("User ID is null - user not properly authenticated");
            return ResponseEntity.status(401).body(new MessageResponse("User not authenticated"));
        }

        // Get the current user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        logger.debug("Found user: {}", user.getUsername());

        // Check if profile already exists
        Optional<NLOProfile> existingProfileOpt = NLOProfileRepository.findByUserId(userId);
        if (existingProfileOpt.isPresent()) {
            // Update existing profile
            NLOProfile profile = existingProfileOpt.get();
            updateProfileFields(profile, profileData);
            profile.setHasCompletedOnboarding(true);
            profile = NLOProfileRepository.save(profile);
            logger.debug("Updated existing employer profile");
            return ResponseEntity.ok(profile);
        }

        // Create new profile
        NLOProfile profile = new NLOProfile();
        profile.setUser(user);
        profile.setRole(UserRole.NLO);
        
        updateProfileFields(profile, profileData);
        profile.setHasCompletedOnboarding(true);
        
        profile = NLOProfileRepository.save(profile);
        logger.debug("Created new employer profile");
        
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/avatar")
    @PreAuthorize("hasRole('STUDENT') or hasRole('NLO') or hasRole('ADMIN')")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        // Upload file to Cloudinary
        Map result = cloudinaryService.upload(file, "avatars");
        String avatarUrl = (String) result.get("url");

        // Update the profile with the new avatar URL
        Optional<StudentProfile> studentProfile = studentProfileRepository.findByUserId(userId);
        if (studentProfile.isPresent()) {
            StudentProfile profile = studentProfile.get();
            profile.setAvatarUrl(avatarUrl);
            studentProfileRepository.save(profile);
            return ResponseEntity.ok(profile);
        }

        Optional<NLOProfile> NLOProfile = NLOProfileRepository.findByUserId(userId);
        if (NLOProfile.isPresent()) {
            NLOProfile profile = NLOProfile.get();
            profile.setAvatarUrl(avatarUrl);
            NLOProfileRepository.save(profile);
            return ResponseEntity.ok(profile);
        }
        
        Optional<AdminProfile> adminProfile = adminProfileRepository.findByUserId(userId);
        if (adminProfile.isPresent()) {
            AdminProfile profile = adminProfile.get();
            profile.setAvatarUrl(avatarUrl);
            adminProfileRepository.save(profile);
            return ResponseEntity.ok(profile);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Profile not found");
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('STUDENT') or hasRole('NLO') or hasRole('ADMIN')")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> updates) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        // Check if user has a student profile
        Optional<StudentProfile> studentProfileOpt = studentProfileRepository.findByUserId(userId);
        if (studentProfileOpt.isPresent()) {
            StudentProfile profile = studentProfileOpt.get();
            updateProfileFields(profile, updates);
            studentProfileRepository.save(profile);
            return ResponseEntity.ok(profile);
        }

        // Check if user has an employer profile
        Optional<NLOProfile> NLOProfileOpt = NLOProfileRepository.findByUserId(userId);
        if (NLOProfileOpt.isPresent()) {
            NLOProfile profile = NLOProfileOpt.get();
            updateProfileFields(profile, updates);
            NLOProfileRepository.save(profile);
            return ResponseEntity.ok(profile);
        }
        
        // Check if user has an admin profile
        Optional<AdminProfile> adminProfileOpt = adminProfileRepository.findByUserId(userId);
        if (adminProfileOpt.isPresent()) {
            AdminProfile profile = adminProfileOpt.get();
            updateProfileFields(profile, updates);
            adminProfileRepository.save(profile);
            return ResponseEntity.ok(profile);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Profile not found");
    }

    @PostMapping("/create")
    public ResponseEntity<?> createProfile(@RequestBody Map<String, Object> profileData) {
        logger.debug("POST /api/profiles/create called");
        
        try {
            // Get current user ID
            UUID userId = SecurityUtils.getCurrentUserId();
            if (userId == null) {
                logger.error("User ID is null - user not properly authenticated");
                return ResponseEntity.status(401).body(new MessageResponse("User not authenticated"));
            }
            
            // Check if user exists
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            logger.debug("Found user: {}", user.getUsername());
            
            // Check if profile already exists - either student or employer
            Optional<StudentProfile> existingStudentProfile = studentProfileRepository.findByUserId(userId);
            if (existingStudentProfile.isPresent()) {
                logger.debug("Student profile already exists, updating existing profile");
                StudentProfile profile = existingStudentProfile.get();
                updateProfileFields(profile, profileData);
                profile = studentProfileRepository.save(profile);
                
                // Format response with skills as array for frontend
                Map<String, Object> responseMap = new HashMap<>();
                responseMap.put("id", profile.getId());
                responseMap.put("firstName", profile.getFirstName());
                responseMap.put("lastName", profile.getLastName());
                responseMap.put("fullName", profile.getFullName());
                responseMap.put("university", profile.getUniversity());
                responseMap.put("major", profile.getMajor());
                responseMap.put("graduationYear", profile.getGraduationYear());
                
                // Convert skills to array
                if (profile.getSkills() != null && !profile.getSkills().isEmpty()) {
                    responseMap.put("skills", Arrays.asList(profile.getSkills().split(",")));
                } else {
                    responseMap.put("skills", Collections.emptyList());
                }
                
                responseMap.put("githubUrl", profile.getGithubUrl());
                responseMap.put("linkedinUrl", profile.getLinkedinUrl());
                responseMap.put("portfolioUrl", profile.getPortfolioUrl());
                responseMap.put("bio", profile.getBio());
                responseMap.put("phoneNumber", profile.getPhoneNumber());
                responseMap.put("city", profile.getCity());
                responseMap.put("province", profile.getProvince());
                responseMap.put("postalCode", profile.getPostalCode());
                responseMap.put("hasCompletedOnboarding", profile.isHasCompletedOnboarding());
                responseMap.put("role", profile.getRole());
                
                // Add other fields
                if (profile.getGithubProjects() != null && !profile.getGithubProjects().isEmpty()) {
                    try {
                        Object projectsObj = new com.fasterxml.jackson.databind.ObjectMapper().readValue(profile.getGithubProjects(), Object.class);
                        responseMap.put("githubProjects", projectsObj);
                    } catch (Exception e) {
                        logger.error("Error parsing GitHub projects", e);
                        responseMap.put("githubProjects", Collections.emptyList());
                    }
                } else {
                    responseMap.put("githubProjects", Collections.emptyList());
                }
                
                return ResponseEntity.ok(responseMap);
            }
            
            Optional<NLOProfile> existingNLOProfile = NLOProfileRepository.findByUserId(userId);
            if (existingNLOProfile.isPresent()) {
                logger.debug("Employer profile already exists, updating existing profile");
                NLOProfile profile = existingNLOProfile.get();
                updateProfileFields(profile, profileData);
                profile = NLOProfileRepository.save(profile);
                return ResponseEntity.ok(profile);
            }
            
            // Create new profile based on user roles
            boolean isEmployer = user.getRoles().stream()
                    .anyMatch(role -> role.getName() == ERole.ROLE_NLO);
            
            if (isEmployer) {
                logger.debug("Creating new employer profile");
                NLOProfile profile = new NLOProfile();
                profile.setUser(user);
                profile.setRole(UserRole.NLO);
                updateProfileFields(profile, profileData);
                NLOProfile savedProfile = NLOProfileRepository.save(profile);
                return ResponseEntity.ok(savedProfile);
            } else {
                // Default to student profile
                logger.debug("Creating new student profile");
                StudentProfile profile = new StudentProfile();
                profile.setUser(user);
                profile.setRole(UserRole.STUDENT);
                profile.setHasCompletedOnboarding(true);
                updateProfileFields(profile, profileData);
                StudentProfile savedProfile = studentProfileRepository.save(profile);
                
                // Format response with skills as array for frontend
                Map<String, Object> responseMap = new HashMap<>();
                responseMap.put("id", savedProfile.getId());
                responseMap.put("firstName", savedProfile.getFirstName());
                responseMap.put("lastName", savedProfile.getLastName());
                responseMap.put("fullName", savedProfile.getFullName());
                responseMap.put("university", savedProfile.getUniversity());
                responseMap.put("major", savedProfile.getMajor());
                responseMap.put("graduationYear", savedProfile.getGraduationYear());
                
                // Convert skills to array
                if (savedProfile.getSkills() != null && !savedProfile.getSkills().isEmpty()) {
                    responseMap.put("skills", Arrays.asList(savedProfile.getSkills().split(",")));
                } else {
                    responseMap.put("skills", Collections.emptyList());
                }
                
                responseMap.put("githubUrl", savedProfile.getGithubUrl());
                responseMap.put("linkedinUrl", savedProfile.getLinkedinUrl());
                responseMap.put("portfolioUrl", savedProfile.getPortfolioUrl());
                responseMap.put("bio", savedProfile.getBio());
                responseMap.put("phoneNumber", savedProfile.getPhoneNumber());
                responseMap.put("city", savedProfile.getCity());
                responseMap.put("province", savedProfile.getProvince());
                responseMap.put("postalCode", savedProfile.getPostalCode());
                responseMap.put("hasCompletedOnboarding", savedProfile.isHasCompletedOnboarding());
                responseMap.put("role", savedProfile.getRole());
                
                return ResponseEntity.ok(responseMap);
            }
        } catch (Exception e) {
            logger.error("Error creating profile", e);
            return ResponseEntity.status(500).body(new MessageResponse("Error creating profile: " + e.getMessage()));
        }
    }

    private void updateProfileFields(Profile profile, Map<String, Object> updates) {
        if (updates.containsKey("fullName")) {
            profile.setFullName((String) updates.get("fullName"));
        }
        if (updates.containsKey("phoneNumber")) {
            profile.setPhoneNumber((String) updates.get("phoneNumber"));
        }
        if (updates.containsKey("bio")) {
            profile.setBio((String) updates.get("bio"));
        }
        if (updates.containsKey("location")) {
            profile.setLocation((String) updates.get("location"));
        }
        if (updates.containsKey("hasCompletedOnboarding")) {
            Object onboardingObj = updates.get("hasCompletedOnboarding");
            boolean requestedValue = false;
            if (onboardingObj instanceof Boolean) {
                requestedValue = (Boolean) onboardingObj;
            } else if (onboardingObj != null) {
                requestedValue = Boolean.parseBoolean(String.valueOf(onboardingObj));
            }
            if (requestedValue) {
                profile.setHasCompletedOnboarding(true);
            }
        }

        // Handle student-specific fields
        if (profile instanceof StudentProfile) {
            StudentProfile studentProfile = (StudentProfile) profile;
            if (updates.containsKey("firstName")) {
                studentProfile.setFirstName((String) updates.get("firstName"));
            }
            if (updates.containsKey("lastName")) {
                studentProfile.setLastName((String) updates.get("lastName"));
            }
            if (updates.containsKey("university")) {
                studentProfile.setUniversity((String) updates.get("university"));
            }
            if (updates.containsKey("major")) {
                studentProfile.setMajor((String) updates.get("major"));
            }
            if (updates.containsKey("graduationYear")) {
                Object yearObj = updates.get("graduationYear");
                if (yearObj != null) {
                    if (yearObj instanceof Number) {
                        studentProfile.setGraduationYear(((Number) yearObj).intValue());
                    } else if (yearObj instanceof String) {
                        try {
                            studentProfile.setGraduationYear(Integer.parseInt((String) yearObj));
                        } catch (NumberFormatException e) {
                            logger.warn("Invalid graduation year format: {}", yearObj);
                        }
                    }
                }
            }
            if (updates.containsKey("skills")) {
                Object skillsObj = updates.get("skills");
                if (skillsObj instanceof List) {
                    // Convert list of skills to comma-separated string
                    List<?> skillsList = (List<?>) skillsObj;
                    String skillsStr = String.join(",", skillsList.stream()
                            .map(Object::toString)
                            .toArray(String[]::new));
                    studentProfile.setSkills(skillsStr);
                } else if (skillsObj instanceof String) {
                    studentProfile.setSkills((String) skillsObj);
                }
            }
            if (updates.containsKey("githubUrl")) {
                studentProfile.setGithubUrl((String) updates.get("githubUrl"));
            }
            if (updates.containsKey("linkedinUrl")) {
                studentProfile.setLinkedinUrl((String) updates.get("linkedinUrl"));
            }
            if (updates.containsKey("portfolioUrl")) {
                studentProfile.setPortfolioUrl((String) updates.get("portfolioUrl"));
            }
            if (updates.containsKey("city")) {
                studentProfile.setCity((String) updates.get("city"));
            }
            if (updates.containsKey("province")) {
                studentProfile.setProvince((String) updates.get("province"));
            }
            if (updates.containsKey("postalCode")) {
                studentProfile.setPostalCode((String) updates.get("postalCode"));
            }
            
            // Handle GitHub projects
            if (updates.containsKey("githubProjects")) {
                try {
                    Object projectsObj = updates.get("githubProjects");
                    // Convert the projects object to JSON string using Jackson
                    String projectsJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(projectsObj);
                    studentProfile.setGithubProjects(projectsJson);
                } catch (Exception e) {
                    logger.error("Error serializing GitHub projects", e);
                }
            }
        }

        // Handle employer-specific fields
        if (profile instanceof NLOProfile) {
            NLOProfile NLOProfile = (NLOProfile) profile;
            if (updates.containsKey("companyName")) {
                NLOProfile.setCompanyName((String) updates.get("companyName"));
            }
            if (updates.containsKey("companySize")) {
                NLOProfile.setCompanySize((String) updates.get("companySize"));
            }
            if (updates.containsKey("industry")) {
                NLOProfile.setIndustry((String) updates.get("industry"));
            }
            if (updates.containsKey("companyDescription")) {
                NLOProfile.setCompanyDescription((String) updates.get("companyDescription"));
            }
            if (updates.containsKey("websiteUrl")) {
                NLOProfile.setWebsiteUrl((String) updates.get("websiteUrl"));
            }
            if (updates.containsKey("logoUrl")) {
                NLOProfile.setLogoUrl((String) updates.get("logoUrl"));
            }
        }
    }
} 
