package com.ojtechapi.spring.jwtoauth.controller;

import com.ojtechapi.spring.jwtoauth.entities.CV;
import com.ojtechapi.spring.jwtoauth.entities.Certification;
import com.ojtechapi.spring.jwtoauth.entities.StudentProfile;
import com.ojtechapi.spring.jwtoauth.entities.WorkExperience;
import com.ojtechapi.spring.jwtoauth.repositories.CVRepository;
import com.ojtechapi.spring.jwtoauth.repositories.CertificationRepository;
import com.ojtechapi.spring.jwtoauth.repositories.StudentProfileRepository;
import com.ojtechapi.spring.jwtoauth.repositories.WorkExperienceRepository;
import com.ojtechapi.spring.jwtoauth.security.CurrentUser;
import com.ojtechapi.spring.jwtoauth.security.services.UserDetailsImpl;
import com.ojtechapi.spring.jwtoauth.services.JobMatchService;
import com.ojtechapi.spring.jwtoauth.services.ResumeHtmlGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/cvs")
public class CVController {

    private final CVRepository cvRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CertificationRepository certificationRepository;
    private final WorkExperienceRepository workExperienceRepository;
    private final JobMatchService jobMatchService;
    private final ResumeHtmlGeneratorService resumeHtmlGeneratorService;

    @Autowired
    public CVController(CVRepository cvRepository, 
                        StudentProfileRepository studentProfileRepository,
                        CertificationRepository certificationRepository,
                        WorkExperienceRepository workExperienceRepository,
                        JobMatchService jobMatchService,
                        ResumeHtmlGeneratorService resumeHtmlGeneratorService) {
        this.cvRepository = cvRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.certificationRepository = certificationRepository;
        this.workExperienceRepository = workExperienceRepository;
        this.jobMatchService = jobMatchService;
        this.resumeHtmlGeneratorService = resumeHtmlGeneratorService;
    }

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<CV>> getAllCVs(@CurrentUser UserDetailsImpl currentUser) {
        Optional<StudentProfile> studentOpt = studentProfileRepository.findByUserId(currentUser.getId());
        if (studentOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found");
        }
        
        List<CV> cvs = cvRepository.findByStudent(studentOpt.get());
        return ResponseEntity.ok(cvs);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<CV> getCVById(@PathVariable UUID id, @CurrentUser UserDetailsImpl currentUser) {
        Optional<CV> cvOpt = cvRepository.findById(id);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to access this CV");
        }
        
        return ResponseEntity.ok(cv);
    }
    
    /**
     * PUBLIC endpoint for anyone to view a student's CV by ID (used in emails)
     * No authentication required - allows employers to view CV from email links
     */
    @GetMapping("/{id}/view")
    public ResponseEntity<String> getPublicCVView(@PathVariable UUID id) {
        Optional<CV> cvOpt = cvRepository.findById(id);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        
        // Only return active CVs publicly
        if (!cv.isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found or not available");
        }
        
        // 1. Try HTML content if available (already formatted)
        if (cv.getHtmlContent() != null && !cv.getHtmlContent().trim().isEmpty()) {
            return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(cv.getHtmlContent());
        }
        
        // 2. Try parsed resume (JSON) - convert to HTML
        if (cv.getParsedResume() != null && !cv.getParsedResume().trim().isEmpty()) {
            try {
                String htmlContent = resumeHtmlGeneratorService.generateResumeHtml(cv.getParsedResume());
                return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(htmlContent);
            } catch (Exception e) {
                System.err.println("Error generating HTML from resume JSON: " + e.getMessage());
                // Fall back to returning JSON if HTML generation fails
                return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(cv.getParsedResume());
            }
        }
        
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV content not available");
    }
    
    /**
     * Endpoint for employers to view a student's CV by ID
     */
    @GetMapping("/employer/view/{id}")
    @PreAuthorize("hasRole('NLO')")
    public ResponseEntity<CV> getStudentCVById(@PathVariable UUID id) {
        Optional<CV> cvOpt = cvRepository.findById(id);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        
        // Only return active CVs to employers
        if (!cv.isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found or not active");
        }
        
        return ResponseEntity.ok(cv);
    }
    
    /**
     * Endpoint for employers to get the HTML content of a student's CV
     */
    @GetMapping("/employer/view/{id}/content")
    @PreAuthorize("hasRole('NLO')")
    public ResponseEntity<String> getStudentCVContent(@PathVariable UUID id) {
        Optional<CV> cvOpt = cvRepository.findById(id);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        
        // Only return active CVs to employers
        if (!cv.isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found or not active");
        }
        
        if (cv.getParsedResume() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV content not found");
        }
        
        return ResponseEntity.ok(cv.getParsedResume());
    }

    /**
     * Endpoint for employers to get certifications for a student's CV
     */
    @GetMapping("/employer/view/{id}/certifications")
    @PreAuthorize("hasRole('NLO')")
    public ResponseEntity<Set<Certification>> getStudentCVCertifications(@PathVariable UUID id) {
        Optional<CV> cvOpt = cvRepository.findById(id);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        
        // Only return active CVs to employers
        if (!cv.isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found or not active");
        }
        
        return ResponseEntity.ok(cv.getCertifications());
    }
    
    /**
     * Endpoint for employers to get work experiences for a student's CV
     */
    @GetMapping("/employer/view/{id}/experiences")
    @PreAuthorize("hasRole('NLO')")
    public ResponseEntity<Set<WorkExperience>> getStudentCVExperiences(@PathVariable UUID id) {
        Optional<CV> cvOpt = cvRepository.findById(id);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        
        // Only return active CVs to employers
        if (!cv.isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found or not active");
        }
        
        return ResponseEntity.ok(cv.getExperiences());
    }

    /**
     * Generate a CV based on student profile data
     * This creates a placeholder CV entity that will be updated with the actual CV data later
     * If the student already has a CV, it will update the existing one instead of creating a new one
     */
    @PostMapping("/generate")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<CV> generateCV(@CurrentUser UserDetailsImpl currentUser) {
        Optional<StudentProfile> studentOpt = studentProfileRepository.findByUserId(currentUser.getId());
        if (studentOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found");
        }
        
        StudentProfile student = studentOpt.get();
        CV cv;
        
        // Check if the student already has an active CV
        UUID activeCvId = student.getActiveCvId();
        if (activeCvId != null) {
            // Update the existing CV
            Optional<CV> existingCvOpt = cvRepository.findById(activeCvId);
            if (existingCvOpt.isPresent()) {
                cv = existingCvOpt.get();
                // Update the CV properties
                cv.setLastUpdated(LocalDateTime.now());
                cv.setGenerated(true);
                // Keep the active status as true
                cv.setActive(true);
                
                // Save the updated CV
                cv = cvRepository.save(cv);
                
                System.out.println("Updated existing CV with ID: " + cv.getId() + " for student: " + student.getId());
                
                // Trigger job matching for the student
                try {
                    // First, recalculate all existing matches with updated CV data
                    jobMatchService.recalculateMatchesForStudent(student.getId());
                    System.out.println("Recalculated existing job matches for student: " + student.getId());
                    
                    // Then, find new matches for jobs that don't have matches yet
                    jobMatchService.findMatchesForStudent(student.getId(), null);
                    System.out.println("Job matching completed successfully for student: " + student.getId());
                } catch (Exception e) {
                    // Log error but don't fail the CV generation
                    System.err.println("Error during job matching: " + e.getMessage());
                    e.printStackTrace();
                }
                
                return ResponseEntity.ok(cv);
            }
        }
        
        // If no active CV or active CV not found, create a new one
        cv = new CV();
        cv.setStudent(student);
        cv.setActive(true);
        cv.setGenerated(true);
        cv.setLastUpdated(LocalDateTime.now());
        
        // Save CV
        CV savedCV = cvRepository.save(cv);
        
        // If setting to active, deactivate all other CVs for this student
        List<CV> activeCVs = cvRepository.findByStudentAndActive(student, true);
        for (CV activeCV : activeCVs) {
            if (!activeCV.getId().equals(savedCV.getId())) {
                activeCV.setActive(false);
                cvRepository.save(activeCV);
            }
        }
        
        // Update student's activeCvId
        student.setActiveCvId(savedCV.getId());
        studentProfileRepository.save(student);
        
        // Trigger job matching for the student
        try {
            // First, recalculate all existing matches with updated CV data
            jobMatchService.recalculateMatchesForStudent(student.getId());
            System.out.println("Recalculated existing job matches for student: " + student.getId());
            
            // Then, find new matches for jobs that don't have matches yet
            jobMatchService.findMatchesForStudent(student.getId(), null);
            System.out.println("Job matching completed successfully for student: " + student.getId());
        } catch (Exception e) {
            // Log error but don't fail the CV generation
            System.err.println("Error during job matching: " + e.getMessage());
            e.printStackTrace();
        }
        
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCV);
    }
    
    /**
     * Update a CV with the content (JSON data)
     */
    @PutMapping("/{id}/content")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<CV> updateCVContent(
            @PathVariable UUID id,
            @RequestBody String content,
            @CurrentUser UserDetailsImpl currentUser) {
        
        Optional<CV> cvOpt = cvRepository.findById(id);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to update this CV");
        }
        
        // Validate that content is not empty
        if (content == null || content.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Content cannot be empty");
        }
        
        // Store the content in the parsedResume field without conversion
        // The frontend will handle parsing and display
        cv.setParsedResume(content);
        cv.setLastUpdated(LocalDateTime.now());
        
        CV updatedCV = cvRepository.save(cv);
        
        // Trigger job matching for the student after CV content update
        try {
            // First, recalculate all existing matches with updated CV data
            jobMatchService.recalculateMatchesForStudent(cv.getStudent().getId());
            System.out.println("Recalculated existing job matches after CV content update for student: " + cv.getStudent().getId());
            
            // Then, find new matches for jobs that don't have matches yet
            jobMatchService.findMatchesForStudent(cv.getStudent().getId(), null);
            System.out.println("Job matching completed successfully after CV content update for student: " + cv.getStudent().getId());
        } catch (Exception e) {
            // Log error but don't fail the CV update
            System.err.println("Error during job matching after CV content update: " + e.getMessage());
            e.printStackTrace();
        }
        
        return ResponseEntity.ok(updatedCV);
    }
    
    /**
     * Update a CV with HTML content
     */
    @PutMapping("/{id}/html")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<CV> updateCVHtmlContent(
            @PathVariable UUID id,
            @RequestBody String htmlContent,
            @CurrentUser UserDetailsImpl currentUser) {
        
        Optional<CV> cvOpt = cvRepository.findById(id);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to update this CV");
        }
        
        // Validate that content is not empty
        if (htmlContent == null || htmlContent.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "HTML content cannot be empty");
        }
        
        // Store the HTML content
        cv.setHtmlContent(htmlContent);
        cv.setLastUpdated(LocalDateTime.now());
        
        CV updatedCV = cvRepository.save(cv);
        
        // Trigger job matching for the student after CV HTML content update
        try {
            // First, recalculate all existing matches with updated CV data
            jobMatchService.recalculateMatchesForStudent(cv.getStudent().getId());
            System.out.println("Recalculated existing job matches after CV HTML content update for student: " + cv.getStudent().getId());
            
            // Then, find new matches for jobs that don't have matches yet
            jobMatchService.findMatchesForStudent(cv.getStudent().getId(), null);
            System.out.println("Job matching completed successfully after CV HTML content update for student: " + cv.getStudent().getId());
        } catch (Exception e) {
            // Log error but don't fail the CV update
            System.err.println("Error during job matching after CV HTML content update: " + e.getMessage());
            e.printStackTrace();
        }
        
        return ResponseEntity.ok(updatedCV);
    }
    
    /**
     * Get the raw content of a CV
     */
    @GetMapping("/{id}/content")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> getCVContent(@PathVariable UUID id, @CurrentUser UserDetailsImpl currentUser) {
        try {
            Optional<CV> cvOpt = cvRepository.findById(id);
            if (cvOpt.isEmpty()) {
                System.out.println("CVController - getCVContent - CV not found with ID: " + id);
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
            }
            
            CV cv = cvOpt.get();
            if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
                System.out.println("CVController - getCVContent - Permission denied for user: " + currentUser.getId());
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to access this CV");
            }
            
            // First check if HTML content is available
            if (cv.getHtmlContent() != null && !cv.getHtmlContent().trim().isEmpty()) {
                System.out.println("CVController - getCVContent - Returning HTML content");
                return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(cv.getHtmlContent());
            }
            
            // Fall back to JSON content
            if (cv.getParsedResume() == null) {
                System.out.println("CVController - getCVContent - CV has null parsedResume field");
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV content not found");
            }
            
            // Log the content type and preview for debugging
            String content = cv.getParsedResume();
            
            // Handle potentially invalid content gracefully
            try {
                String preview = content.length() > 100 ? content.substring(0, 100) + "..." : content;
                System.out.println("CVController - getCVContent - Raw content preview: " + preview);
                
                // Detect content type - either JSON or HTML
                MediaType contentType;
                if (content.trim().startsWith("{") || content.trim().startsWith("[")) {
                    contentType = MediaType.APPLICATION_JSON;
                    System.out.println("CVController - getCVContent - Detected JSON content");
                } else {
                    contentType = MediaType.TEXT_HTML;
                    System.out.println("CVController - getCVContent - Detected HTML content");
                }
                
                // Return the raw content (JSON or HTML) and let the frontend handle it
                return ResponseEntity.ok()
                    .contentType(contentType)
                    .body(content);
            } catch (Exception e) {
                System.err.println("CVController - getCVContent - Error processing content: " + e.getMessage());
                
                // If content is causing errors, try to sanitize it before returning
                try {
                    // Try to sanitize the content if it's invalid
                    if (content == null) {
                        System.err.println("CVController - getCVContent - Content is null");
                        return ResponseEntity.ok()
                            .contentType(MediaType.TEXT_PLAIN)
                            .body("{}"); // Return empty JSON object
                    }
                    
                    // If it looks like JSON but might be corrupted, try to validate/fix it
                    if (content.contains("{") && content.contains("}")) {
                        System.err.println("CVController - getCVContent - Attempting to sanitize JSON content");
                        
                        // Return minimal valid JSON
                        return ResponseEntity.ok()
                            .contentType(MediaType.APPLICATION_JSON)
                            .body("{}");
                    } else {
                        // For any other type, return empty JSON
                        System.err.println("CVController - getCVContent - Returning empty JSON for non-JSON content");
                        return ResponseEntity.ok()
                            .contentType(MediaType.APPLICATION_JSON)
                            .body("{}");
                    }
                } catch (Exception sanitizeError) {
                    System.err.println("CVController - getCVContent - Failed to sanitize content: " + sanitizeError.getMessage());
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error processing CV content");
                }
            }
        } catch (ResponseStatusException rse) {
            // Rethrow ResponseStatusException as is
            throw rse;
        } catch (Exception e) {
            // Log any unexpected errors
            System.err.println("CVController - getCVContent - Unexpected error: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error retrieving CV content: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> deleteCV(@PathVariable UUID id, @CurrentUser UserDetailsImpl currentUser) {
        Optional<CV> cvOpt = cvRepository.findById(id);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to delete this CV");
        }
        
        // If this was the active CV, update student's activeCvId
        if (cv.isActive()) {
            StudentProfile student = cv.getStudent();
            student.setActiveCvId(null);
            studentProfileRepository.save(student);
        }
        
        cvRepository.delete(cv);
        return ResponseEntity.noContent().build();
    }
    
    // Certification endpoints
    
    @GetMapping("/{cvId}/certifications")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Set<Certification>> getCertifications(@PathVariable UUID cvId, 
                                                              @CurrentUser UserDetailsImpl currentUser) {
        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to access this CV");
        }
        
        return ResponseEntity.ok(cv.getCertifications());
    }
    
    @PostMapping("/{cvId}/certifications")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Certification> addCertification(
            @PathVariable UUID cvId,
            @RequestParam String name,
            @RequestParam String issuer,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateReceived,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryDate,
            @RequestParam(required = false) String credentialUrl,
            @CurrentUser UserDetailsImpl currentUser) {
        
        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to modify this CV");
        }
        
        Certification certification = new Certification();
        certification.setName(name);
        certification.setIssuer(issuer);
        certification.setDateReceived(dateReceived);
        certification.setExpiryDate(expiryDate);
        certification.setCredentialUrl(credentialUrl);
        certification.setCv(cv);
        certification.setStudent(cv.getStudent());
        
        Certification savedCertification = certificationRepository.save(certification);
        
        // Update CV's lastUpdated
        cv.setLastUpdated(LocalDateTime.now());
        cvRepository.save(cv);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCertification);
    }
    
    @PutMapping("/{cvId}/certifications/{certId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Certification> updateCertification(
            @PathVariable UUID cvId,
            @PathVariable UUID certId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String issuer,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateReceived,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryDate,
            @RequestParam(required = false) String credentialUrl,
            @CurrentUser UserDetailsImpl currentUser) {
        
        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to modify this CV");
        }
        
        Optional<Certification> certOpt = certificationRepository.findById(certId);
        if (certOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Certification not found");
        }
        
        Certification certification = certOpt.get();
        if (!certification.getCv().getId().equals(cvId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Certification does not belong to the specified CV");
        }
        
        if (name != null) {
            certification.setName(name);
        }
        
        if (issuer != null) {
            certification.setIssuer(issuer);
        }
        
        if (dateReceived != null) {
            certification.setDateReceived(dateReceived);
        }
        
        certification.setExpiryDate(expiryDate); // Can be null
        certification.setCredentialUrl(credentialUrl); // Can be null
        
        Certification updatedCertification = certificationRepository.save(certification);
        
        // Update CV's lastUpdated
        cv.setLastUpdated(LocalDateTime.now());
        cvRepository.save(cv);
        
        return ResponseEntity.ok(updatedCertification);
    }
    
    @DeleteMapping("/{cvId}/certifications/{certId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> deleteCertification(
            @PathVariable UUID cvId,
            @PathVariable UUID certId,
            @CurrentUser UserDetailsImpl currentUser) {
        
        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to modify this CV");
        }
        
        Optional<Certification> certOpt = certificationRepository.findById(certId);
        if (certOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Certification not found");
        }
        
        Certification certification = certOpt.get();
        if (!certification.getCv().getId().equals(cvId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Certification does not belong to the specified CV");
        }
        
        certificationRepository.delete(certification);
        
        // Update CV's lastUpdated
        cv.setLastUpdated(LocalDateTime.now());
        cvRepository.save(cv);
        
        return ResponseEntity.noContent().build();
    }
    
    // Work Experience endpoints
    
    @GetMapping("/{cvId}/experiences")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Set<WorkExperience>> getExperiences(@PathVariable UUID cvId, 
                                                           @CurrentUser UserDetailsImpl currentUser) {
        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to access this CV");
        }
        
        return ResponseEntity.ok(cv.getExperiences());
    }
    
    @PostMapping("/{cvId}/experiences")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<WorkExperience> addExperience(
            @PathVariable UUID cvId,
            @RequestParam String title,
            @RequestParam String company,
            @RequestParam(required = false) String location,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "false") boolean current,
            @RequestParam String description,
            @CurrentUser UserDetailsImpl currentUser) {
        
        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to modify this CV");
        }
        
        // Validate that if current is true, endDate should be null
        if (current && endDate != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End date should not be provided for current positions");
        }
        
        // Validate that if current is false, endDate is required
        if (!current && endDate == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End date is required for non-current positions");
        }
        
        WorkExperience experience = new WorkExperience();
        experience.setTitle(title);
        experience.setCompany(company);
        experience.setLocation(location);
        experience.setStartDate(startDate);
        experience.setEndDate(endDate);
        experience.setCurrent(current);
        experience.setDescription(description);
        experience.setCv(cv);
        experience.setStudent(cv.getStudent());
        
        WorkExperience savedExperience = workExperienceRepository.save(experience);
        
        // Update CV's lastUpdated
        cv.setLastUpdated(LocalDateTime.now());
        cvRepository.save(cv);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(savedExperience);
    }
    
    @PutMapping("/{cvId}/experiences/{expId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<WorkExperience> updateExperience(
            @PathVariable UUID cvId,
            @PathVariable UUID expId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Boolean current,
            @RequestParam(required = false) String description,
            @CurrentUser UserDetailsImpl currentUser) {
        
        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to modify this CV");
        }
        
        Optional<WorkExperience> expOpt = workExperienceRepository.findById(expId);
        if (expOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Work experience not found");
        }
        
        WorkExperience experience = expOpt.get();
        if (!experience.getCv().getId().equals(cvId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Work experience does not belong to the specified CV");
        }
        
        // Update fields if provided
        if (title != null) {
            experience.setTitle(title);
        }
        
        if (company != null) {
            experience.setCompany(company);
        }
        
        experience.setLocation(location); // Can be null
        
        if (startDate != null) {
            experience.setStartDate(startDate);
        }
        
        // Handle current and endDate logic
        if (current != null) {
            experience.setCurrent(current);
            if (current) {
                experience.setEndDate(null);
            }
        }
        
        if (endDate != null) {
            if (experience.isCurrent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End date should not be provided for current positions");
            }
            experience.setEndDate(endDate);
        }
        
        if (description != null) {
            experience.setDescription(description);
        }
        
        WorkExperience updatedExperience = workExperienceRepository.save(experience);
        
        // Update CV's lastUpdated
        cv.setLastUpdated(LocalDateTime.now());
        cvRepository.save(cv);
        
        return ResponseEntity.ok(updatedExperience);
    }
    
    @DeleteMapping("/{cvId}/experiences/{expId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> deleteExperience(
            @PathVariable UUID cvId,
            @PathVariable UUID expId,
            @CurrentUser UserDetailsImpl currentUser) {
        
        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to modify this CV");
        }
        
        Optional<WorkExperience> expOpt = workExperienceRepository.findById(expId);
        if (expOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Work experience not found");
        }
        
        WorkExperience experience = expOpt.get();
        if (!experience.getCv().getId().equals(cvId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Work experience does not belong to the specified CV");
        }
        
        workExperienceRepository.delete(experience);
        
        // Update CV's lastUpdated
        cv.setLastUpdated(LocalDateTime.now());
        cvRepository.save(cv);
        
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<CV>> getCurrentUserCVs(@CurrentUser UserDetailsImpl currentUser) {
        Optional<StudentProfile> studentOpt = studentProfileRepository.findByUserId(currentUser.getId());
        if (studentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        List<CV> cvs = cvRepository.findByStudent(studentOpt.get());
        return ResponseEntity.ok(cvs);
    }
    
    /**
     * Get the current user's active CV content
     */
    @GetMapping("/me/content")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> getCurrentUserCVContent(@CurrentUser UserDetailsImpl currentUser) {
        try {
            Optional<StudentProfile> studentOpt = studentProfileRepository.findByUserId(currentUser.getId());
            if (studentOpt.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found");
            }
            
            StudentProfile student = studentOpt.get();
            
            // Check if the student has an active CV
            UUID activeCvId = student.getActiveCvId();
            if (activeCvId == null) {
                // Find most recent CV if no active CV is set
                List<CV> cvs = cvRepository.findByStudentOrderByLastUpdatedDesc(student);
                if (cvs.isEmpty()) {
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No CV found");
                }
                
                // Use the most recent CV
                CV cv = cvs.get(0);
                
                // First check if HTML content is available
                if (cv.getHtmlContent() != null && !cv.getHtmlContent().trim().isEmpty()) {
                    return ResponseEntity.ok()
                        .contentType(MediaType.TEXT_HTML)
                        .body(cv.getHtmlContent());
                }
                
                // Fall back to parsed resume content
                if (cv.getParsedResume() == null) {
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV content not found");
                }
                
                return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(cv.getParsedResume());
            }
            
            // Get the active CV
            Optional<CV> cvOpt = cvRepository.findById(activeCvId);
            if (cvOpt.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Active CV not found");
            }
            
            CV cv = cvOpt.get();
            
            // First check if HTML content is available
            if (cv.getHtmlContent() != null && !cv.getHtmlContent().trim().isEmpty()) {
                return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(cv.getHtmlContent());
            }
            
            // Fall back to parsed resume content
            if (cv.getParsedResume() == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV content not found");
            }
            
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(cv.getParsedResume());
        } catch (ResponseStatusException rse) {
            throw rse;
        } catch (Exception e) {
            System.err.println("CVController - getCurrentUserCVContent - Error: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error retrieving CV content");
        }
    }
} 
