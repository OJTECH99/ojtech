package com.melardev.spring.jwtoauth.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.melardev.spring.jwtoauth.dtos.responses.MessageResponse;
import com.melardev.spring.jwtoauth.entities.CV;
import com.melardev.spring.jwtoauth.entities.Certification;
import com.melardev.spring.jwtoauth.entities.StudentProfile;
import com.melardev.spring.jwtoauth.entities.WorkExperience;
import com.melardev.spring.jwtoauth.exceptions.ResourceNotFoundException;
import com.melardev.spring.jwtoauth.repositories.StudentProfileRepository;
import com.melardev.spring.jwtoauth.security.services.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/nlo/students")
@PreAuthorize("hasRole('ROLE_NLO')") // NLO users have NLO role
public class NLOStudentController {

    private static final Logger logger = LoggerFactory.getLogger(NLOStudentController.class);

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @GetMapping
    public ResponseEntity<?> getStudents(
            @RequestParam(required = false) Boolean verified,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        try {
            // Check if user is authenticated
            if (userDetails == null) {
                logger.error("User details is null - user not authenticated");
                logger.error("Security context authentication: {}", 
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication());
                return ResponseEntity.status(401)
                        .body(new MessageResponse("User not authenticated"));
            }
            
            logger.info("NLO user authenticated: {} with ID: {}", userDetails.getUsername(), userDetails.getId());
            
            List<StudentProfile> students;
            
            if (verified != null) {
                students = studentProfileRepository.findByVerified(verified);
                logger.info("NLO user {} fetched {} students with verified={}", 
                    userDetails.getUsername(), students.size(), verified);
            } else {
                students = studentProfileRepository.findAll();
                logger.info("NLO user {} fetched all {} students", 
                    userDetails.getUsername(), students.size());
            }
            
            List<Map<String, Object>> result = students.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error fetching students for NLO user", e);
            return ResponseEntity.status(500)
                    .body(new MessageResponse("Error fetching students: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getStudentById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401)
                        .body(new MessageResponse("User not authenticated"));
            }
            StudentProfile student = studentProfileRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
            
            Map<String, Object> studentDto = convertToDto(student);
            
            logger.info("NLO user {} accessed student details for {}", 
                userDetails.getUsername(), student.getFullName());
            
            return ResponseEntity.ok(studentDto);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error fetching student for NLO user {}", userDetails.getUsername(), e);
            return ResponseEntity.status(500)
                    .body(new MessageResponse("Error fetching student: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/verify")
    public ResponseEntity<?> verifyStudent(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401)
                        .body(new MessageResponse("User not authenticated"));
            }
            StudentProfile student = studentProfileRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
            
            student.setVerified(true);
            student.setVerifiedAt(LocalDate.now());
            student.setVerifiedByUserId(userDetails.getId());
            student.setVerifiedByRole("NLO");
            student.setVerificationSource("NLO");
            
            // Add NLO-specific verification notes
            String notes = "";
            if (body != null && body.containsKey("notes")) {
                notes = body.get("notes");
            }
            
            // Prefix with NLO verification info
            String nloNotes = String.format("Verified by NLO Staff (%s) on %s", 
                userDetails.getUsername(), LocalDate.now());
            if (!notes.isEmpty()) {
                nloNotes += ". Notes: " + notes;
            }
            
            student.setVerificationNotes(nloNotes);
            
            studentProfileRepository.save(student);
            
            logger.info("NLO user {} verified student {} ({})", 
                userDetails.getUsername(), student.getFullName(), id);
            
            return ResponseEntity.ok(new MessageResponse("Student verified successfully by NLO"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error verifying student for NLO user {}", userDetails.getUsername(), e);
            return ResponseEntity.status(500)
                    .body(new MessageResponse("Error verifying student: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/unverify")
    public ResponseEntity<?> unverifyStudent(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401)
                        .body(new MessageResponse("User not authenticated"));
            }
            StudentProfile student = studentProfileRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
            
            student.setVerified(false);
            student.setVerifiedAt(null);
            student.setVerifiedByUserId(userDetails.getId());
            student.setVerifiedByRole("NLO");
            student.setVerificationSource("NLO");
            
            // Add NLO-specific unverification notes
            String notes = "";
            if (body != null && body.containsKey("notes")) {
                notes = body.get("notes");
            }
            
            // Prefix with NLO unverification info
            String nloNotes = String.format("Unverified by NLO Staff (%s) on %s", 
                userDetails.getUsername(), LocalDate.now());
            if (!notes.isEmpty()) {
                nloNotes += ". Reason: " + notes;
            }
            
            student.setVerificationNotes(nloNotes);
            
            studentProfileRepository.save(student);
            
            logger.info("NLO user {} unverified student {} ({})", 
                userDetails.getUsername(), student.getFullName(), id);
            
            return ResponseEntity.ok(new MessageResponse("Student unverified successfully by NLO"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error unverifying student for NLO user {}", userDetails.getUsername(), e);
            return ResponseEntity.status(500)
                    .body(new MessageResponse("Error unverifying student: " + e.getMessage()));
        }
    }

    @GetMapping("/verification-stats")
    public ResponseEntity<?> getVerificationStats(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401)
                        .body(new MessageResponse("User not authenticated"));
            }
            long totalStudents = studentProfileRepository.count();
            long verifiedStudents = studentProfileRepository.countByVerified(true);
            long unverifiedStudents = studentProfileRepository.countByVerified(false);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalStudents", totalStudents);
            stats.put("verifiedStudents", verifiedStudents);
            stats.put("unverifiedStudents", unverifiedStudents);
            stats.put("verificationRate", totalStudents > 0 ? (double) verifiedStudents / totalStudents * 100 : 0);
            
            logger.info("NLO user {} accessed verification statistics", userDetails.getUsername());
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error fetching verification stats for NLO user {}", userDetails.getUsername(), e);
            return ResponseEntity.status(500)
                    .body(new MessageResponse("Error fetching verification statistics: " + e.getMessage()));
        }
    }
    
    private Map<String, Object> convertToDto(StudentProfile student) {
        Map<String, Object> dto = new HashMap<>();
        
        // Basic profile information
        dto.put("id", student.getId());
        dto.put("firstName", student.getFirstName());
        dto.put("lastName", student.getLastName());
        dto.put("fullName", student.getFullName());
        dto.put("email", student.getEmail());
        dto.put("phoneNumber", student.getPhone() != null ? student.getPhone() : student.getPhoneNumber());
        dto.put("location", student.getLocation());
        dto.put("university", student.getUniversity());
        dto.put("major", student.getMajor());
        dto.put("graduationYear", student.getGraduationYear());
        dto.put("bio", student.getBio());
        dto.put("profilePictureUrl", student.getProfilePictureUrl());
        dto.put("verified", student.isVerified());
        dto.put("verifiedAt", student.getVerifiedAt());
        dto.put("verificationNotes", student.getVerificationNotes());
        dto.put("hasCompletedOnboarding", student.isOnboardingCompleted());
        dto.put("githubUrl", student.getGithubUrl());
        dto.put("linkedinUrl", student.getLinkedinUrl());
        dto.put("portfolioUrl", student.getPortfolioUrl());
        dto.put("preojtOrientationUrl", student.getPreojtOrientationUrl());
        dto.put("activeCvId", student.getActiveCvId());
        dto.put("role", "STUDENT");
        
        // Parse and include skills as a list
        if (student.getSkills() != null && !student.getSkills().isEmpty()) {
            List<String> skillsList = Arrays.asList(student.getSkills().split("\\s*,\\s*"));
            dto.put("skills", skillsList);
        } else {
            dto.put("skills", new ArrayList<>());
        }
        
        // Include GitHub projects if available
        if (student.getGithubProjects() != null && !student.getGithubProjects().isEmpty()) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                List<Map<String, Object>> githubProjects = objectMapper.readValue(
                    student.getGithubProjects(), 
                    new TypeReference<List<Map<String, Object>>>() {}
                );
                dto.put("githubProjects", githubProjects);
            } catch (Exception e) {
                logger.error("Error parsing GitHub projects JSON", e);
                dto.put("githubProjects", new ArrayList<>());
            }
        } else {
            dto.put("githubProjects", new ArrayList<>());
        }
        
        // Include full certifications
        if (student.getCertifications() != null && !student.getCertifications().isEmpty()) {
            List<Map<String, Object>> certifications = new ArrayList<>();
            for (Certification cert : student.getCertifications()) {
                Map<String, Object> certMap = new HashMap<>();
                certMap.put("id", cert.getId());
                certMap.put("name", cert.getName());
                certMap.put("issuer", cert.getIssuer());
                certMap.put("dateReceived", cert.getDateReceived());
                certMap.put("expiryDate", cert.getExpiryDate());
                certMap.put("credentialUrl", cert.getCredentialUrl());
                certifications.add(certMap);
            }
            dto.put("certifications", certifications);
        } else {
            dto.put("certifications", new ArrayList<>());
        }
        
        // Include full experiences
        if (student.getExperiences() != null && !student.getExperiences().isEmpty()) {
            List<Map<String, Object>> experiences = new ArrayList<>();
            for (WorkExperience exp : student.getExperiences()) {
                Map<String, Object> expMap = new HashMap<>();
                expMap.put("id", exp.getId());
                expMap.put("title", exp.getTitle());
                expMap.put("company", exp.getCompany());
                expMap.put("location", exp.getLocation());
                expMap.put("startDate", exp.getStartDate());
                expMap.put("endDate", exp.getEndDate());
                expMap.put("description", exp.getDescription());
                expMap.put("current", exp.isCurrent());
                experiences.add(expMap);
            }
            dto.put("experiences", experiences);
        } else {
            dto.put("experiences", new ArrayList<>());
        }
        
        // Include CVs with their details
        if (student.getCvs() != null && !student.getCvs().isEmpty()) {
            List<Map<String, Object>> cvsList = new ArrayList<>();
            for (CV cv : student.getCvs()) {
                Map<String, Object> cvMap = new HashMap<>();
                cvMap.put("id", cv.getId());
                cvMap.put("lastUpdated", cv.getLastUpdated());
                cvMap.put("active", cv.isActive());
                cvMap.put("generated", cv.isGenerated());
                cvMap.put("template", cv.getTemplate());
                
                // Include HTML content if available
                if (cv.getHtmlContent() != null && !cv.getHtmlContent().isEmpty()) {
                    cvMap.put("htmlContent", cv.getHtmlContent());
                }
                
                // Include parsed resume data if available
                if (cv.getParsedResume() != null && !cv.getParsedResume().isEmpty()) {
                    try {
                        ObjectMapper objectMapper = new ObjectMapper();
                        Object parsedResume = objectMapper.readValue(cv.getParsedResume(), Object.class);
                        cvMap.put("parsedResume", parsedResume);
                    } catch (Exception e) {
                        logger.error("Error parsing resume JSON", e);
                        cvMap.put("parsedResume", cv.getParsedResume());
                    }
                }
                
                cvsList.add(cvMap);
            }
            dto.put("cvs", cvsList);
        } else {
            dto.put("cvs", new ArrayList<>());
        }
        
        // Include counts of related entities
        dto.put("cvCount", student.getCvs() != null ? student.getCvs().size() : 0);
        dto.put("applicationCount", student.getApplications() != null ? student.getApplications().size() : 0);
        dto.put("certificationCount", student.getCertifications() != null ? student.getCertifications().size() : 0);
        dto.put("experienceCount", student.getExperiences() != null ? student.getExperiences().size() : 0);
        
        return dto;
    }
}
