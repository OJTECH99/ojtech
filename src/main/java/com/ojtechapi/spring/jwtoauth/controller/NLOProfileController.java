package com.ojtechapi.spring.jwtoauth.controller;

import com.ojtechapi.spring.jwtoauth.dtos.responses.MessageResponse;
import com.ojtechapi.spring.jwtoauth.entities.NLOProfile;
import com.ojtechapi.spring.jwtoauth.entities.User;
import com.ojtechapi.spring.jwtoauth.entities.UserRole;
import com.ojtechapi.spring.jwtoauth.exceptions.ResourceNotFoundException;
import com.ojtechapi.spring.jwtoauth.repositories.NLOProfileRepository;
import com.ojtechapi.spring.jwtoauth.repositories.UserRepository;
import com.ojtechapi.spring.jwtoauth.security.utils.SecurityUtils;
import com.ojtechapi.spring.jwtoauth.service.CloudinaryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/nlo")
public class NLOProfileController {

    private static final Logger logger = LoggerFactory.getLogger(NLOProfileController.class);

    @Autowired
    private NLOProfileRepository nloProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    /**
     * Returns the current employer profile of the authenticated user.
     * 
     * @return The current employer profile of the authenticated user.
     * @throws ResourceNotFoundException If the employer profile is not found.
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('NLO')")
    public ResponseEntity<?> getCurrentNLOProfile() {
        logger.debug("GET /api/employer-profiles/me called");
        
        // Get authentication details for debugging
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String authorities = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(", "));
        logger.debug("User {} has authorities: {}", auth.getName(), authorities);
        
        UUID userId = SecurityUtils.getCurrentUserId();
        logger.debug("Extracted userId from token: {}", userId);
        
        if (userId == null) {
            logger.error("User ID is null - user not properly authenticated");
            return ResponseEntity.status(401).body(new MessageResponse("User not authenticated"));
        }

        Optional<NLOProfile> profileOpt = nloProfileRepository.findByUserId(userId);
        logger.debug("Profile found for userId {}: {}", userId, profileOpt.isPresent());
        
        if (profileOpt.isEmpty()) {
            logger.error("Employer profile not found for userId: {}", userId);
            
            // Check if user exists
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                logger.debug("User exists with username: {}, but no employer profile found", user.getUsername());
                
                // Check if user has EMPLOYER role
                String userRoles = user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .collect(Collectors.joining(", "));
                logger.debug("User roles: {}", userRoles);
            } else {
                logger.error("User with ID {} does not exist", userId);
            }
            
            return ResponseEntity.status(404).body(new MessageResponse("Employer profile not found"));
        }

        logger.debug("Successfully found and returning employer profile");
        return ResponseEntity.ok(profileOpt.get());
    }

    @PostMapping
    @PreAuthorize("hasRole('NLO')")
    public ResponseEntity<?> createNLOProfile(@RequestBody Map<String, Object> profileData) {
        UUID userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(new MessageResponse("User not authenticated"));
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if profile already exists
        Optional<NLOProfile> existingProfileOpt = nloProfileRepository.findByUserId(userId);
        if (existingProfileOpt.isPresent()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Employer profile already exists"));
        }

        // Create new profile
        NLOProfile profile = new NLOProfile();
        profile.setUser(user);
        profile.setRole(UserRole.NLO);
        // Set login email from User entity
        profile.setEmail(user.getEmail());
        logger.info("Created employer profile with login email: {}", user.getEmail());
        
        updateProfileFields(profile, profileData);
        
        profile = nloProfileRepository.save(profile);
        
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('NLO')")
    public ResponseEntity<?> updateNLOProfile(@RequestBody Map<String, Object> profileData) {
        UUID userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(new MessageResponse("User not authenticated"));
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Optional<NLOProfile> profileOpt = nloProfileRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new MessageResponse("Employer profile not found"));
        }

        NLOProfile profile = profileOpt.get();
        // Always sync the email from User entity to NLOProfile
        if (profile.getEmail() == null || !profile.getEmail().equals(user.getEmail())) {
            profile.setEmail(user.getEmail());
            logger.info("Synced login email to employer profile: {}", user.getEmail());
        }
        updateProfileFields(profile, profileData);
        
        profile = nloProfileRepository.save(profile);
        
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/logo")
    @PreAuthorize("hasRole('NLO')")
    public ResponseEntity<?> uploadLogo(@RequestParam("file") MultipartFile file) throws IOException {
        UUID userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(new MessageResponse("User not authenticated"));
        }

        Optional<NLOProfile> profileOpt = nloProfileRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new MessageResponse("Employer profile not found"));
        }

        NLOProfile profile = profileOpt.get();
        
        // Upload to Cloudinary
        Map<String, Object> result = cloudinaryService.upload(file, "logos");
        String logoUrl = (String) result.get("url");
        
        // Update profile
        profile.setLogoUrl(logoUrl);
        profile = nloProfileRepository.save(profile);
        
        return ResponseEntity.ok(profile);
    }

    private void updateProfileFields(NLOProfile profile, Map<String, Object> data) {
        // Note: Email should not be updated through profileData
        // It should always be synced from the User entity
        if (data.containsKey("email")) {
            logger.warn("Ignoring email from profile data. Email is synced from User entity.");
        }
        
        if (data.containsKey("fullName")) {
            profile.setFullName((String) data.get("fullName"));
        }
        
        if (data.containsKey("companyName")) {
            profile.setCompanyName((String) data.get("companyName"));
        }
        
        if (data.containsKey("companySize")) {
            profile.setCompanySize((String) data.get("companySize"));
        }
        
        if (data.containsKey("industry")) {
            profile.setIndustry((String) data.get("industry"));
        }
        
        if (data.containsKey("location")) {
            profile.setLocation((String) data.get("location"));
        }
        
        if (data.containsKey("companyDescription")) {
            profile.setCompanyDescription((String) data.get("companyDescription"));
        }
        
        if (data.containsKey("websiteUrl")) {
            profile.setWebsiteUrl((String) data.get("websiteUrl"));
        }
        
        if (data.containsKey("companyWebsite")) {
            profile.setWebsiteUrl((String) data.get("companyWebsite"));
        }
        
        if (data.containsKey("phoneNumber")) {
            profile.setPhoneNumber((String) data.get("phoneNumber"));
        }
        
        if (data.containsKey("bio")) {
            profile.setBio((String) data.get("bio"));
        }
        
        if (data.containsKey("hasCompletedOnboarding")) {
            Object onboardingObj = data.get("hasCompletedOnboarding");
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
        
        // New contact person fields
        if (data.containsKey("contactPersonName")) {
            profile.setContactPersonName((String) data.get("contactPersonName"));
        }
        
        if (data.containsKey("contactPersonPosition")) {
            profile.setContactPersonPosition((String) data.get("contactPersonPosition"));
        }
        
        if (data.containsKey("contactPersonEmail")) {
            profile.setContactPersonEmail((String) data.get("contactPersonEmail"));
        }
        
        if (data.containsKey("contactPersonPhone")) {
            profile.setContactPersonPhone((String) data.get("contactPersonPhone"));
        }
        
        if (data.containsKey("companyAddress")) {
            profile.setCompanyAddress((String) data.get("companyAddress"));
        }
        
        if (data.containsKey("verified")) {
            profile.setVerified((Boolean) data.get("verified"));
        }
    }
}
