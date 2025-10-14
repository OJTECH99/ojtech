package com.melardev.spring.jwtoauth.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.melardev.spring.jwtoauth.dtos.responses.MessageResponse;
import com.melardev.spring.jwtoauth.entities.*;
import com.melardev.spring.jwtoauth.exceptions.ResourceNotFoundException;
import com.melardev.spring.jwtoauth.repositories.*;
import com.melardev.spring.jwtoauth.security.services.UserDetailsImpl;
import com.melardev.spring.jwtoauth.service.CloudinaryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student-profiles")
public class StudentProfileController {

    private static final Logger logger = LoggerFactory.getLogger(StudentProfileController.class);

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CVRepository cvRepository;
    
    @Autowired
    private CertificationRepository certificationRepository;
    
    @Autowired
    private WorkExperienceRepository workExperienceRepository;

    @Autowired
    private CloudinaryService cloudinaryService;
    
    @Value("${cloudinary.api-secret-preset:OJTECH}")
    private String cloudinaryPreset;
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getCurrentStudentProfile() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            UUID userId = userDetails.getId();
            
            logger.info("Getting profile for user ID: {}", userId);

            Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userId);
            if (profileOpt.isEmpty()) {
                logger.warn("No profile found for user ID: {}", userId);
                return ResponseEntity.notFound().build();
            }
            
            StudentProfile profile = profileOpt.get();
            
            // Create a response map with all profile properties
            Map<String, Object> responseMap = new HashMap<>();
            
            // Add all basic profile fields
            responseMap.put("id", profile.getId());
            responseMap.put("firstName", profile.getFirstName());
            responseMap.put("lastName", profile.getLastName());
            responseMap.put("fullName", profile.getFullName());
            responseMap.put("email", profile.getEmail());
            responseMap.put("location", profile.getLocation());
            responseMap.put("university", profile.getUniversity());
            responseMap.put("major", profile.getMajor());
            responseMap.put("graduationYear", profile.getGraduationYear());
            responseMap.put("skills", profile.getSkills() != null ? 
                    Arrays.asList(profile.getSkills().split(",")) : Collections.emptyList());
            responseMap.put("githubUrl", profile.getGithubUrl());
            responseMap.put("linkedinUrl", profile.getLinkedinUrl());
            responseMap.put("portfolioUrl", profile.getPortfolioUrl());
            // Ensure bio is always present in the response
            responseMap.put("bio", profile.getBio() != null ? profile.getBio() : "");
            responseMap.put("phoneNumber", profile.getPhoneNumber());
            responseMap.put("hasCompletedOnboarding", profile.isHasCompletedOnboarding());
            responseMap.put("activeCvId", profile.getActiveCvId());
            responseMap.put("role", profile.getRole());
            responseMap.put("avatarUrl", profile.getAvatarUrl());
            
            // Parse GitHub projects if available
            if (profile.getGithubProjects() != null && !profile.getGithubProjects().isEmpty()) {
                try {
                    Object projectsObj = objectMapper.readValue(profile.getGithubProjects(), Object.class);
                    responseMap.put("githubProjects", projectsObj);
                } catch (Exception e) {
                    logger.error("Error parsing GitHub projects: " + e.getMessage());
                    responseMap.put("githubProjects", Collections.emptyList());
                }
            } else {
                responseMap.put("githubProjects", Collections.emptyList());
            }
            
            // Add certifications and experiences
            responseMap.put("certifications", profile.getCertifications());
            responseMap.put("experiences", profile.getExperiences());
            
            // Add PreOJT Orientation URL
            responseMap.put("preojtOrientationUrl", profile.getPreojtOrientationUrl());
            
            // Add verification status
            responseMap.put("verified", profile.isVerified());
            responseMap.put("verifiedAt", profile.getVerifiedAt());
            responseMap.put("verificationNotes", profile.getVerificationNotes());
            
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.error("Error getting student profile", e);
            return ResponseEntity.status(500).body(new MessageResponse("Error retrieving profile: " + e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> createStudentProfile(@RequestBody Map<String, Object> profileData) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if profile already exists
        Optional<StudentProfile> existingProfileOpt = studentProfileRepository.findByUserId(userId);
        if (existingProfileOpt.isPresent()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Student profile already exists"));
        }

        // Create new profile
        StudentProfile profile = new StudentProfile();
        profile.setUser(user);
        profile.setRole(UserRole.STUDENT);
        
        updateProfileFields(profile, profileData);
        
        profile = studentProfileRepository.save(profile);
        
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> updateStudentProfile(@RequestBody Map<String, Object> profileData) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        StudentProfile profile = profileOpt.get();
        updateProfileFields(profile, profileData);
        
        profile = studentProfileRepository.save(profile);
        
        return ResponseEntity.ok(profile);
    }
    
    @PostMapping("/complete-onboarding")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> completeOnboarding(@RequestBody Map<String, Object> completeData) {
        logger.info("POST /api/student-profiles/complete-onboarding called");
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            UUID userId = userDetails.getId();
            
            logger.info("User ID: {}, Username: {}", userId, userDetails.getUsername());
            logger.info("User roles: {}", userDetails.getAuthorities());

            Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userId);
            if (profileOpt.isEmpty()) {
                logger.warn("No profile found for user ID: {}", userId);
                
                // Create a new profile if it doesn't exist
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> {
                            logger.error("User not found with ID: {}", userId);
                            return new ResourceNotFoundException("User not found");
                        });
                
                StudentProfile newProfile = new StudentProfile();
                newProfile.setUser(user);
                newProfile.setRole(UserRole.STUDENT);
                newProfile = studentProfileRepository.save(newProfile);
                profileOpt = Optional.of(newProfile);
                logger.info("Created new student profile for user: {}", user.getUsername());
            }

            StudentProfile profile = profileOpt.get();
            profile.setHasCompletedOnboarding(true);
            logger.info("Processing onboarding data for profile ID: {}", profile.getId());
            
            // Handle personal info
            if (completeData.containsKey("personalInfo")) {
                Map<String, String> personalInfo = (Map<String, String>) completeData.get("personalInfo");
                profile.setFirstName(personalInfo.get("firstName"));
                profile.setLastName(personalInfo.get("lastName"));
                
                // Set full name based on first and last name
                String fullName = String.format("%s %s", 
                    personalInfo.get("firstName") != null ? personalInfo.get("firstName") : "",
                    personalInfo.get("lastName") != null ? personalInfo.get("lastName") : "").trim();
                profile.setFullName(fullName);
                
                logger.info("Updated personal info: {}, {}", personalInfo.get("firstName"), personalInfo.get("lastName"));
            }
            
            // Handle education info
            if (completeData.containsKey("education")) {
                Map<String, Object> education = (Map<String, Object>) completeData.get("education");
                profile.setUniversity((String) education.get("university"));
                profile.setMajor((String) education.get("major"));
                if (education.get("graduationYear") instanceof Number) {
                    profile.setGraduationYear(((Number) education.get("graduationYear")).intValue());
                }
            }
            
            // Handle skills (convert array to comma-separated string)
            if (completeData.containsKey("skills") && completeData.get("skills") instanceof List) {
                List<String> skillsList = (List<String>) completeData.get("skills");
                profile.setSkills(String.join(",", skillsList));
                logger.info("Processed skills: {}", profile.getSkills());
            }
            
            // Handle contact info
            if (completeData.containsKey("contact")) {
                Map<String, String> contact = (Map<String, String>) completeData.get("contact");
                profile.setPhoneNumber(contact.get("phoneNumber"));
                profile.setLinkedinUrl(contact.get("linkedinUrl"));
                profile.setGithubUrl(contact.get("githubUrl"));
                profile.setPortfolioUrl(contact.get("portfolioUrl"));
            }
            
            // Handle bio
            if (completeData.containsKey("bio")) {
                String bio = (String) completeData.get("bio");
                profile.setBio(bio);
                logger.info("Set bio: {}", bio != null && bio.length() > 50 ? bio.substring(0, 50) + "..." : bio);
            }
            
            // Process GitHub projects
            if (completeData.containsKey("githubProjects")) {
                try {
                    String projectsJson = objectMapper.writeValueAsString(completeData.get("githubProjects"));
                    profile.setGithubProjects(projectsJson);
                } catch (JsonProcessingException e) {
                    logger.error("Error processing GitHub projects", e);
                    // Continue processing instead of failing the entire request
                }
            }
            
            // Process certifications
            if (completeData.containsKey("certifications") && completeData.get("certifications") instanceof List) {
                List<Map<String, Object>> certificationsList = (List<Map<String, Object>>) completeData.get("certifications");
                DateTimeFormatter dateFormatter = DateTimeFormatter.ISO_DATE;
                
                // Initialize certifications if null
                if (profile.getCertifications() == null) {
                    profile.setCertifications(new HashSet<>());
                } else {
                    // Clear existing certifications
                    profile.getCertifications().clear();
                }
                
                try {
                    for (Map<String, Object> certData : certificationsList) {
                        Certification certification = new Certification();
                        certification.setName((String) certData.get("name"));
                        certification.setIssuer((String) certData.get("issuer"));
                        
                        // Parse dates
                        String dateStr = (String) certData.get("date");
                        if (dateStr != null) {
                            certification.setDateReceived(LocalDate.parse(dateStr, dateFormatter));
                        }
                        
                        String expiryDateStr = (String) certData.get("expiryDate");
                        if (expiryDateStr != null && !expiryDateStr.isEmpty()) {
                            certification.setExpiryDate(LocalDate.parse(expiryDateStr, dateFormatter));
                        }
                        
                        if (certData.containsKey("credentialUrl")) {
                            certification.setCredentialUrl((String) certData.get("credentialUrl"));
                        }
                        
                        certification.setStudent(profile);
                        profile.addCertification(certification);
                    }
                } catch (Exception e) {
                    logger.error("Error processing certifications", e);
                    // Continue processing instead of failing the entire request
                }
            }
            
            // Process work experiences
            if (completeData.containsKey("experiences") && completeData.get("experiences") instanceof List) {
                List<Map<String, Object>> experiencesList = (List<Map<String, Object>>) completeData.get("experiences");
                DateTimeFormatter dateFormatter = DateTimeFormatter.ISO_DATE;
                
                // Initialize experiences if null
                if (profile.getExperiences() == null) {
                    profile.setExperiences(new HashSet<>());
                } else {
                    // Clear existing experiences
                    profile.getExperiences().clear();
                }
                
                try {
                    for (Map<String, Object> expData : experiencesList) {
                        WorkExperience experience = new WorkExperience();
                        experience.setTitle((String) expData.get("title"));
                        experience.setCompany((String) expData.get("company"));
                        experience.setLocation((String) expData.get("location"));
                        experience.setDescription((String) expData.get("description"));
                        
                        // Parse dates
                        String startDateStr = (String) expData.get("startDate");
                        if (startDateStr != null) {
                            experience.setStartDate(LocalDate.parse(startDateStr, dateFormatter));
                        }
                        
                        String endDateStr = (String) expData.get("endDate");
                        if (endDateStr != null && !endDateStr.isEmpty()) {
                            experience.setEndDate(LocalDate.parse(endDateStr, dateFormatter));
                        }
                        
                        experience.setCurrent((Boolean) expData.getOrDefault("current", false));
                        experience.setStudent(profile);
                        profile.addExperience(experience);
                    }
                } catch (Exception e) {
                    logger.error("Error processing work experiences", e);
                    // Continue processing instead of failing the entire request
                }
            }
            
            // Mark onboarding as complete
            profile.setHasCompletedOnboarding(true);
            
            profile = studentProfileRepository.save(profile);
            logger.info("Successfully saved profile with ID: {}", profile.getId());
            
            // Create formatted response
            Map<String, Object> responseMap = new HashMap<>();
            
            // Add all basic profile fields
            responseMap.put("id", profile.getId());
            responseMap.put("firstName", profile.getFirstName());
            responseMap.put("lastName", profile.getLastName());
            responseMap.put("fullName", profile.getFullName());
            responseMap.put("email", profile.getEmail());
            responseMap.put("location", profile.getLocation());
            responseMap.put("university", profile.getUniversity());
            responseMap.put("major", profile.getMajor());
            responseMap.put("graduationYear", profile.getGraduationYear());
            
            // Always convert skills to array consistently
            if (profile.getSkills() != null && !profile.getSkills().isEmpty()) {
                responseMap.put("skills", Arrays.asList(profile.getSkills().split(",")));
            } else {
                responseMap.put("skills", Collections.emptyList());
            }
            
            responseMap.put("githubUrl", profile.getGithubUrl());
            responseMap.put("linkedinUrl", profile.getLinkedinUrl());
            responseMap.put("portfolioUrl", profile.getPortfolioUrl());
            // Ensure bio is always present in the response
            responseMap.put("bio", profile.getBio() != null ? profile.getBio() : "");
            responseMap.put("phoneNumber", profile.getPhoneNumber());
            responseMap.put("hasCompletedOnboarding", profile.isHasCompletedOnboarding());
            responseMap.put("activeCvId", profile.getActiveCvId());
            responseMap.put("role", profile.getRole());
            responseMap.put("avatarUrl", profile.getAvatarUrl());
            
            // Parse GitHub projects if available
            if (profile.getGithubProjects() != null && !profile.getGithubProjects().isEmpty()) {
                try {
                    Object projectsObj = objectMapper.readValue(profile.getGithubProjects(), Object.class);
                    responseMap.put("githubProjects", projectsObj);
                } catch (Exception e) {
                    logger.error("Error parsing GitHub projects: " + e.getMessage());
                    responseMap.put("githubProjects", Collections.emptyList());
                }
            } else {
                responseMap.put("githubProjects", Collections.emptyList());
            }
            
            // Add certifications and experiences
            responseMap.put("certifications", profile.getCertifications());
            responseMap.put("experiences", profile.getExperiences());
            
            // Add PreOJT Orientation URL and verification status
            responseMap.put("preojtOrientationUrl", profile.getPreojtOrientationUrl());
            responseMap.put("verified", profile.isVerified());
            responseMap.put("verifiedAt", profile.getVerifiedAt());
            responseMap.put("verificationNotes", profile.getVerificationNotes());
            
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.error("Error in completeOnboarding", e);
            return ResponseEntity.status(500).body(new MessageResponse("An error occurred while processing your request: " + e.getMessage()));
        }
    }

    @PostMapping("/cv")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> uploadCV(@RequestParam("file") MultipartFile file) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        StudentProfile profile = profileOpt.get();
        
        // Upload to Cloudinary
        Map<String, Object> result = cloudinaryService.upload(file, "cvs");
        String fileUrl = (String) result.get("url");
        
        // Create CV record
        CV cv = new CV();
        cv.setStudent(profile);
        cv.setLastUpdated(LocalDateTime.now());
        
        // Store the file URL in the parsedResume field temporarily
        // This is a workaround until the file upload is fully replaced by AI generation
        cv.setParsedResume("{\"legacyFileUrl\": \"" + fileUrl + "\"}");
        
        cv = cvRepository.save(cv);
        
        // Set as active if no active CV exists
        if (profile.getActiveCvId() == null) {
            profile.setActiveCvId(cv.getId());
            studentProfileRepository.save(profile);
            cv.setActive(true);
            cvRepository.save(cv);
        }
        
        return ResponseEntity.ok(cv);
    }

    @GetMapping("/cvs")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getStudentCVs() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        StudentProfile profile = profileOpt.get();
        List<CV> cvs = cvRepository.findByStudent(profile);
        
        return ResponseEntity.ok(cvs);
    }

    @PutMapping("/cv/{cvId}/active")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> setActiveCV(@PathVariable UUID cvId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        StudentProfile profile = profileOpt.get();
        
        // Check if CV exists and belongs to student
        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty() || !cvOpt.get().getStudent().getId().equals(profile.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("CV not found or does not belong to you"));
        }
        
        // Reset active status on all CVs
        List<CV> cvs = cvRepository.findByStudent(profile);
        for (CV cv : cvs) {
            cv.setActive(false);
        }
        cvRepository.saveAll(cvs);
        
        // Set new active CV
        CV selectedCV = cvOpt.get();
        selectedCV.setActive(true);
        cvRepository.save(selectedCV);
        
        profile.setActiveCvId(cvId);
        studentProfileRepository.save(profile);
        
        return ResponseEntity.ok(new MessageResponse("Active CV updated successfully"));
    }

    @PostMapping("/preojt-orientation")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> uploadPreOJTOrientation(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "fileUrl", required = false) String fileUrl) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            UUID userId = userDetails.getId();

            // Allow sending an already-uploaded Cloudinary URL instead of a file
            boolean hasFileUrl = fileUrl != null && !fileUrl.isBlank();
            if (!hasFileUrl) {
                // Validate file if not using fileUrl
                if (file == null || file.isEmpty()) {
                    return ResponseEntity.badRequest().body(new MessageResponse("File is empty"));
                }

                String contentType = file.getContentType();
                if (contentType == null || !contentType.equals("application/pdf")) {
                    return ResponseEntity.badRequest().body(new MessageResponse("Only PDF files are allowed"));
                }

                // Check file size (max 10MB)
                if (file.getSize() > 10 * 1024 * 1024) {
                    return ResponseEntity.badRequest().body(new MessageResponse("File size must be less than 10MB"));
                }
            } else {
                // Basic validation for Cloudinary host to avoid persisting arbitrary URLs
                try {
                    java.net.URI uri = java.net.URI.create(fileUrl);
                    String host = uri.getHost();
                    if (host == null || (!host.endsWith("cloudinary.com") && !host.contains("res.cloudinary.com"))) {
                        return ResponseEntity.badRequest().body(new MessageResponse("fileUrl must be a Cloudinary URL"));
                    }
                } catch (Exception ex) {
                    return ResponseEntity.badRequest().body(new MessageResponse("Invalid fileUrl"));
                }
            }

            Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userId);
            if (profileOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            StudentProfile profile = profileOpt.get();
            
            // Upload to Cloudinary when file present; otherwise trust provided fileUrl
            if (!hasFileUrl) {
                fileUrl = cloudinaryService.uploadPdf(file, cloudinaryPreset);
            }
            
            // Update profile with the new PDF URL
            profile.setPreojtOrientationUrl(fileUrl);
            studentProfileRepository.save(profile);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "PreOJT Orientation PDF uploaded successfully");
            response.put("fileUrl", fileUrl);
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            logger.error("Error uploading PreOJT Orientation PDF", e);
            return ResponseEntity.status(500).body(new MessageResponse("Failed to upload PDF: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error uploading PreOJT Orientation PDF", e);
            return ResponseEntity.status(500).body(new MessageResponse("An unexpected error occurred"));
        }
    }

    private void updateProfileFields(StudentProfile profile, Map<String, Object> data) {
        if (data.containsKey("firstName")) {
            profile.setFirstName((String) data.get("firstName"));
        }
        
        if (data.containsKey("lastName")) {
            profile.setLastName((String) data.get("lastName"));
        }
        
        if (data.containsKey("location")) {
            profile.setLocation((String) data.get("location"));
        }
        
        if (data.containsKey("university")) {
            profile.setUniversity((String) data.get("university"));
        }
        
        if (data.containsKey("major")) {
            profile.setMajor((String) data.get("major"));
        }
        
        if (data.containsKey("graduationYear")) {
            Object yearObj = data.get("graduationYear");
            if (yearObj instanceof Integer) {
                profile.setGraduationYear((Integer) yearObj);
            } else if (yearObj instanceof String) {
                try {
                    profile.setGraduationYear(Integer.parseInt((String) yearObj));
                } catch (NumberFormatException e) {
                    logger.warn("Invalid graduation year format: " + yearObj);
                }
            }
        }
        
        if (data.containsKey("skills")) {
            Object skillsObj = data.get("skills");
            if (skillsObj instanceof String) {
                profile.setSkills((String) skillsObj);
            } else if (skillsObj instanceof List) {
                List<String> skillsList = (List<String>) skillsObj;
                profile.setSkills(String.join(", ", skillsList));
            }
        }
        
        if (data.containsKey("githubUrl")) {
            profile.setGithubUrl((String) data.get("githubUrl"));
        }
        
        if (data.containsKey("linkedinUrl")) {
            profile.setLinkedinUrl((String) data.get("linkedinUrl"));
        }
        
        if (data.containsKey("portfolioUrl")) {
            profile.setPortfolioUrl((String) data.get("portfolioUrl"));
        }
        
        if (data.containsKey("phoneNumber")) {
            profile.setPhoneNumber((String) data.get("phoneNumber"));
        }
        
        if (data.containsKey("bio")) {
            String bio = (String) data.get("bio");
            profile.setBio(bio);
            logger.info("Updated bio: {}", bio != null && bio.length() > 50 ? bio.substring(0, 50) + "..." : bio);
        }
        
        if (data.containsKey("hasCompletedOnboarding")) {
            Object onboardingObj = data.get("hasCompletedOnboarding");
            boolean requestedValue = false;
            if (onboardingObj instanceof Boolean) {
                requestedValue = (Boolean) onboardingObj;
            } else if (onboardingObj != null) {
                requestedValue = Boolean.parseBoolean(String.valueOf(onboardingObj));
            }
            // Never downgrade the onboarding status via generic profile updates.
            // Allow setting to true, ignore attempts to set false.
            if (requestedValue) {
                profile.setHasCompletedOnboarding(true);
            }
        }
        
        if (data.containsKey("preojtOrientationUrl")) {
            profile.setPreojtOrientationUrl((String) data.get("preojtOrientationUrl"));
        }
    }
} 