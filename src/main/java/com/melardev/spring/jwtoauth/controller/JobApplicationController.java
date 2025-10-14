package com.melardev.spring.jwtoauth.controller;

import com.melardev.spring.jwtoauth.dtos.EmailDraftDTO;
import com.melardev.spring.jwtoauth.dtos.responses.JobApplicationResponseDTO;
import com.melardev.spring.jwtoauth.dtos.responses.MessageResponse;
import com.melardev.spring.jwtoauth.entities.*;
import com.melardev.spring.jwtoauth.exceptions.BadRequestException;
import com.melardev.spring.jwtoauth.exceptions.ResourceNotFoundException;
import com.melardev.spring.jwtoauth.repositories.CVRepository;
import com.melardev.spring.jwtoauth.repositories.JobApplicationRepository;
import com.melardev.spring.jwtoauth.repositories.JobMatchRepository;
import com.melardev.spring.jwtoauth.repositories.JobRepository;
import com.melardev.spring.jwtoauth.repositories.StudentProfileRepository;
import com.melardev.spring.jwtoauth.repositories.StudentEmailTrackingRepository;
import com.melardev.spring.jwtoauth.security.services.UserDetailsImpl;
import com.melardev.spring.jwtoauth.services.CoverLetterService;
import com.melardev.spring.jwtoauth.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.HashMap;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private CVRepository cvRepository;
    
    @Autowired
    private CoverLetterService coverLetterService;
    
    @Autowired
    private JobMatchRepository jobMatchRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private StudentEmailTrackingRepository emailTrackingRepository;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<JobApplicationResponseDTO>> getStudentApplications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<StudentProfile> studentProfileOpt = studentProfileRepository.findByUserId(userId);
        if (studentProfileOpt.isEmpty()) {
            throw new ResourceNotFoundException("Student profile not found");
        }

        StudentProfile studentProfile = studentProfileOpt.get();
        List<JobApplication> applications = jobApplicationRepository.findByStudent(studentProfile);
        List<JobApplicationResponseDTO> responseDTOs = applications.stream()
            .map(JobApplicationResponseDTO::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }

    @PostMapping("/apply/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> applyForJob(@PathVariable UUID jobId, @RequestBody(required = false) Map<String, String> applicationData) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<StudentProfile> studentProfileOpt = studentProfileRepository.findByUserId(userId);
        if (studentProfileOpt.isEmpty()) {
            throw new ResourceNotFoundException("Student profile not found");
        }

        StudentProfile studentProfile = studentProfileOpt.get();
        
        // Note: Verification check removed - frontend handles warnings for unverified students
        // Students can browse jobs but see warnings about uploading documents and verification status
        // However, they should still be able to apply (admin will review applications from unverified students)

        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (jobOpt.isEmpty()) {
            throw new ResourceNotFoundException("Job not found");
        }

        Job job = jobOpt.get();

        // Check if already applied
        Optional<JobApplication> existingApplication = jobApplicationRepository.findByStudentAndJob(studentProfile, job);
        if (existingApplication.isPresent()) {
            throw new BadRequestException("You have already applied for this job");
        }

        // Initialize application data if null
        if (applicationData == null) {
            applicationData = new HashMap<>();
        }

        // Get CV (use active CV if not specified)
        UUID cvId = null;
        if (applicationData.containsKey("cvId")) {
            cvId = UUID.fromString(applicationData.get("cvId"));
        } else if (studentProfile.getActiveCvId() != null) {
            cvId = studentProfile.getActiveCvId();
        } else {
            throw new BadRequestException("No active CV found. Please set an active CV in your profile.");
        }

        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            throw new ResourceNotFoundException("CV not found");
        }

        CV cv = cvOpt.get();
        
        // Always generate a cover letter automatically
        String coverLetter = coverLetterService.generateCoverLetter(studentProfile.getId(), jobId, cvId);

        // Create application
        JobApplication application = new JobApplication();
        application.setStudent(studentProfile);
        application.setJob(job);
        application.setCv(cv);
        application.setCoverLetter(coverLetter);
        application.setStatus(ApplicationStatus.PENDING);
        application.setAppliedAt(LocalDateTime.now());
        application.setLastUpdatedAt(LocalDateTime.now());

        application = jobApplicationRepository.save(application);
        
        // Find and mark any job matches as viewed
        List<JobMatch> jobMatches = jobMatchRepository.findByStudentIdAndJobId(studentProfile.getId(), jobId);
        if (!jobMatches.isEmpty()) {
            for (JobMatch match : jobMatches) {
                match.setViewed(true);
                jobMatchRepository.save(match);
            }
        }

        return ResponseEntity.ok(new JobApplicationResponseDTO(application));
    }

    @GetMapping("/{applicationId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<JobApplicationResponseDTO> getApplicationById(@PathVariable UUID applicationId) {
        Optional<JobApplication> applicationOpt = jobApplicationRepository.findById(applicationId);
        if (applicationOpt.isEmpty()) {
            throw new ResourceNotFoundException("Application not found");
        }

        JobApplication application = applicationOpt.get();
        
        // Check if the user is authorized to view this application
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();
        
        // Students can only view their own applications
        Optional<StudentProfile> studentProfileOpt = studentProfileRepository.findByUserId(userId);
        if (studentProfileOpt.isEmpty() || !application.getStudent().getId().equals(studentProfileOpt.get().getId())) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(new JobApplicationResponseDTO(application));
    }

    @DeleteMapping("/{applicationId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> withdrawApplication(@PathVariable UUID applicationId) {
        Optional<JobApplication> applicationOpt = jobApplicationRepository.findById(applicationId);
        if (applicationOpt.isEmpty()) {
            throw new ResourceNotFoundException("Application not found");
        }

        JobApplication application = applicationOpt.get();
        
        // Check if the student owns the application
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();
        
        Optional<StudentProfile> studentProfileOpt = studentProfileRepository.findByUserId(userId);
        if (studentProfileOpt.isEmpty() || !application.getStudent().getId().equals(studentProfileOpt.get().getId())) {
            return ResponseEntity.badRequest().build();
        }
        
        // Only allow withdrawal if status is PENDING
        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new BadRequestException("Cannot withdraw application that is already being processed");
        }

        jobApplicationRepository.delete(application);
        
        return ResponseEntity.ok(new MessageResponse("Application withdrawn successfully"));
    }

    @PostMapping("/generate-cover-letter/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> generateCoverLetter(@PathVariable UUID jobId, @RequestBody Map<String, String> requestData) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<StudentProfile> studentProfileOpt = studentProfileRepository.findByUserId(userId);
        if (studentProfileOpt.isEmpty()) {
            throw new ResourceNotFoundException("Student profile not found");
        }

        StudentProfile studentProfile = studentProfileOpt.get();

        // Get CV
        UUID cvId = null;
        if (requestData.containsKey("cvId")) {
            cvId = UUID.fromString(requestData.get("cvId"));
        } else if (studentProfile.getActiveCvId() != null) {
            cvId = studentProfile.getActiveCvId();
        } else {
            throw new BadRequestException("No CV provided or set as active");
        }

        // Generate cover letter
        String coverLetter = coverLetterService.generateCoverLetter(studentProfile.getId(), jobId, cvId);
        
        return ResponseEntity.ok(Map.of("coverLetter", coverLetter));
    }
    
    @GetMapping("/{applicationId}/prepare-email")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<EmailDraftDTO> prepareApplicationEmail(@PathVariable UUID applicationId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();
        
        Optional<JobApplication> applicationOpt = jobApplicationRepository.findById(applicationId);
        if (applicationOpt.isEmpty()) {
            throw new ResourceNotFoundException("Application not found");
        }
        
        JobApplication application = applicationOpt.get();
        
        // Check if the student owns the application
        if (!application.getStudent().getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to this application");
        }
        
        StudentProfile student = application.getStudent();
        Job job = application.getJob();
        EmployerProfile employer = job.getEmployer();
        CV cv = application.getCv();
        
        // Build email draft
        String studentName = student.getFirstName() + " " + student.getLastName();
        String emailBody = generateEmailBody(studentName, job.getTitle(), application.getCoverLetter());
        String subject = "Job Application for " + job.getTitle() + " - " + studentName;
        
        // Generate CV view URL
        String cvUrl = "http://localhost:8081/api/cvs/" + cv.getId() + "/view";
        
        // Get email from User entity (primary source) or fallback to StudentProfile email
        String studentEmail = student.getUser() != null ? student.getUser().getEmail() : student.getEmail();
        
        // Get phone from Profile.phoneNumber (primary) or fallback to StudentProfile.phone
        String studentPhone = student.getPhoneNumber() != null ? student.getPhoneNumber() : student.getPhone();
        
        // Determine recipient email and name - prioritize company HR if available
        String recipientEmail;
        String recipientName;
        
        if (job.getCompany() != null && job.getCompany().getHrEmail() != null) {
            // Use company HR contact if job is associated with a company
            recipientEmail = job.getCompany().getHrEmail();
            recipientName = job.getCompany().getHrName() != null ? job.getCompany().getHrName() : "Hiring Manager";
        } else {
            // Fallback to employer profile contact
            recipientEmail = employer.getContactPersonEmail();
            recipientName = employer.getContactPersonName();
        }
        
        EmailDraftDTO draft = new EmailDraftDTO(
            recipientEmail,
            recipientName,
            subject,
            emailBody,
            cvUrl,
            studentName,
            studentEmail,
            studentPhone,
            student.getUniversity(),
            student.getMajor()
        );
        
        return ResponseEntity.ok(draft);
    }
    
    @PostMapping(value = "/{applicationId}/send-email", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> sendApplicationEmail(
            @PathVariable UUID applicationId, 
            @RequestParam("subject") String subject,
            @RequestParam("emailBody") String emailBody,
            @RequestParam(value = "attachments", required = false) MultipartFile[] attachments) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();
        
        Optional<JobApplication> applicationOpt = jobApplicationRepository.findById(applicationId);
        if (applicationOpt.isEmpty()) {
            throw new ResourceNotFoundException("Application not found");
        }
        
        JobApplication application = applicationOpt.get();
        
        // Check if the student owns the application
        if (!application.getStudent().getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to this application");
        }
        
        StudentProfile student = application.getStudent();
        
        // Check rate limiting - max 10 emails per day
        LocalDate today = LocalDate.now();
        Optional<StudentEmailTracking> trackingOpt = emailTrackingRepository.findByStudentIdAndEmailDate(student.getId(), today);
        
        StudentEmailTracking tracking;
        if (trackingOpt.isPresent()) {
            tracking = trackingOpt.get();
            if (tracking.getEmailCount() >= 10) {
                throw new BadRequestException("Daily email limit reached (10 emails per day). Please try again tomorrow.");
            }
        } else {
            tracking = new StudentEmailTracking(student.getId(), today);
        }
        
        // Check if email already sent for this application
        if (Boolean.TRUE.equals(application.getEmailSent())) {
            throw new BadRequestException("Email already sent for this application");
        }
        
        Job job = application.getJob();
        EmployerProfile employer = job.getEmployer();
        CV cv = application.getCv();
        
        String studentName = student.getFirstName() + " " + student.getLastName();
        
        // Generate CV view URL
        String cvUrl = "http://localhost:8081/api/cvs/" + cv.getId() + "/view";
        
        // Get email from User entity (primary source) or fallback to StudentProfile email
        String studentEmail = student.getUser() != null ? student.getUser().getEmail() : student.getEmail();
        
        // Get phone from Profile.phoneNumber (primary) or fallback to StudentProfile.phone
        String studentPhone = student.getPhoneNumber() != null ? student.getPhoneNumber() : student.getPhone();
        
        // Determine recipient email and name - prioritize company HR if available
        String recipientEmail;
        String recipientName;
        String companyName;
        
        if (job.getCompany() != null && job.getCompany().getHrEmail() != null) {
            // Use company HR contact if job is associated with a company
            recipientEmail = job.getCompany().getHrEmail();
            recipientName = job.getCompany().getHrName() != null ? job.getCompany().getHrName() : "Hiring Manager";
            companyName = job.getCompany().getName();
        } else {
            // Fallback to employer profile contact
            recipientEmail = employer.getContactPersonEmail();
            recipientName = employer.getContactPersonName();
            companyName = employer.getCompanyName();
        }
        
        try {
            // Send email
            emailService.sendJobApplicationEmail(
                recipientEmail,
                recipientName,
                studentName,
                studentEmail,
                studentPhone,
                student.getUniversity(),
                student.getMajor(),
                job.getTitle(),
                companyName,
                application.getCoverLetter(),
                cvUrl,
                emailBody,
                attachments
            );
            
            // Update application with email details
            application.setEmailSent(true);
            application.setEmailSentAt(LocalDateTime.now());
            application.setEmailBody(emailBody);
            application.setEmailSubject(subject);
            jobApplicationRepository.save(application);
            
            // Increment email count
            tracking.incrementEmailCount();
            emailTrackingRepository.save(tracking);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Application email sent successfully",
                "emailsSentToday", tracking.getEmailCount(),
                "emailsRemaining", 10 - tracking.getEmailCount()
            ));
        } catch (Exception e) {
            throw new BadRequestException("Failed to send email: " + e.getMessage());
        }
    }
    
    private String generateEmailBody(String studentName, String jobTitle, String coverLetter) {
        return String.format(
            "I am writing to express my interest in the %s position.\n\n%s\n\n" +
            "I have attached my CV for your review. I would welcome the opportunity to discuss how my skills align with your needs.\n\n" +
            "Thank you for considering my application.\n\nBest regards,\n%s",
            jobTitle, coverLetter != null ? coverLetter : "Please find my application materials attached.", studentName
        );
    }
} 