package com.ojtechapi.spring.jwtoauth.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ojtechapi.spring.jwtoauth.dtos.responses.JobMatchResponseDTO;
import com.ojtechapi.spring.jwtoauth.dtos.responses.JobResponseDTO;
import com.ojtechapi.spring.jwtoauth.dtos.responses.MessageResponse;
import com.ojtechapi.spring.jwtoauth.entities.Company;
import com.ojtechapi.spring.jwtoauth.entities.NLOProfile;
import com.ojtechapi.spring.jwtoauth.entities.Job;
import com.ojtechapi.spring.jwtoauth.entities.JobMatch;
import com.ojtechapi.spring.jwtoauth.entities.StudentProfile;
import com.ojtechapi.spring.jwtoauth.exceptions.ResourceNotFoundException;
import com.ojtechapi.spring.jwtoauth.repositories.CompanyRepository;
import com.ojtechapi.spring.jwtoauth.repositories.NLOProfileRepository;
import com.ojtechapi.spring.jwtoauth.repositories.JobRepository;
import com.ojtechapi.spring.jwtoauth.repositories.StudentProfileRepository;
import com.ojtechapi.spring.jwtoauth.security.services.UserDetailsImpl;
import com.ojtechapi.spring.jwtoauth.services.JobMatchService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/jobs")
public class JobController {
    
    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private NLOProfileRepository NLOProfileRepository;
    
    @Autowired
    private StudentProfileRepository studentProfileRepository;
    
    @Autowired
    private CompanyRepository companyRepository;
    
    @Autowired
    private JobMatchService jobMatchService;
    
    @Autowired
    private com.ojtechapi.spring.jwtoauth.repositories.CVRepository cvRepository;
    
    @Autowired
    private com.ojtechapi.spring.jwtoauth.services.CoverLetterService coverLetterService;
    
    @org.springframework.beans.factory.annotation.Value("${backend.base-url}")
    private String baseUrl;
    
    @GetMapping
    public ResponseEntity<Page<Job>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "postedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<Job> jobs = jobRepository.findByActive(true, pageable);
        return ResponseEntity.ok(jobs);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getJobById(@PathVariable UUID id) {
        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty() || !jobOpt.get().isActive()) {
            throw new ResourceNotFoundException("Job not found");
        }
        
        Job job = jobOpt.get();
        
        // Check if user is authenticated
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() 
            && !"anonymousUser".equals(authentication.getPrincipal())) {
            
            try {
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                UUID userId = userDetails.getId();
                
                // Check if user is a student
                Optional<StudentProfile> studentProfileOpt = studentProfileRepository.findByUserId(userId);
                if (studentProfileOpt.isPresent()) {
                    StudentProfile studentProfile = studentProfileOpt.get();
                    
                    // Create a response with only the current student's match score
                    JobResponseDTO response = new JobResponseDTO(job);
                    
                    // Filter job matches to only include the current student's match
                    if (job.getJobMatches() != null) {
                        List<JobMatch> studentMatches = job.getJobMatches().stream()
                            .filter(match -> match.getStudent().getId().equals(studentProfile.getId()))
                            .collect(Collectors.toList());
                        
                        List<JobMatchResponseDTO> matchDTOs = studentMatches.stream()
                            .map(JobMatchResponseDTO::new)
                            .collect(Collectors.toList());
                        
                        response.setJobMatches(matchDTOs);
                    }
                    
                    // Don't include applications for students viewing jobs
                    response.setApplications(new ArrayList<>());
                    
                    return ResponseEntity.ok(response);
                }
            } catch (Exception e) {
                // If not a student or any error, continue with default response
                System.err.println("Error filtering job details for student: " + e.getMessage());
            }
        }
        
        // Default response (for employers or unauthenticated users)
        return ResponseEntity.ok(new JobResponseDTO(job));
    }
    
    @GetMapping("/employer")
    @PreAuthorize("hasRole('NLO')")
    public ResponseEntity<List<JobResponseDTO>> getEmployerJobs() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<NLOProfile> NLOProfileOpt = NLOProfileRepository.findByUserId(userId);
        if (NLOProfileOpt.isEmpty()) {
            throw new ResourceNotFoundException("Employer profile not found");
        }

        NLOProfile NLOProfile = NLOProfileOpt.get();
        List<Job> jobs = jobRepository.findByEmployer(NLOProfile);
        
        // Filter only active jobs
        List<JobResponseDTO> jobResponseDTOs = jobs.stream()
            .filter(Job::isActive)
            .map(JobResponseDTO::new)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(jobResponseDTOs);
    }
    
    @GetMapping("/employer/inactive")
    @PreAuthorize("hasRole('NLO')")
    public ResponseEntity<List<JobResponseDTO>> getEmployerInactiveJobs() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<NLOProfile> NLOProfileOpt = NLOProfileRepository.findByUserId(userId);
        if (NLOProfileOpt.isEmpty()) {
            throw new ResourceNotFoundException("Employer profile not found");
        }

        NLOProfile NLOProfile = NLOProfileOpt.get();
        List<Job> jobs = jobRepository.findByEmployer(NLOProfile);
        
        // Filter only inactive jobs
        List<JobResponseDTO> inactiveJobDTOs = jobs.stream()
            .filter(job -> !job.isActive())
            .map(JobResponseDTO::new)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(inactiveJobDTOs);
    }
    
    @GetMapping("/employer/{id}")
    @PreAuthorize("hasRole('NLO')")
    public ResponseEntity<?> getEmployerJobById(@PathVariable UUID id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<NLOProfile> NLOProfileOpt = NLOProfileRepository.findByUserId(userId);
        if (NLOProfileOpt.isEmpty()) {
            throw new ResourceNotFoundException("Employer profile not found");
        }

        NLOProfile NLOProfile = NLOProfileOpt.get();
        
        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            throw new ResourceNotFoundException("Job not found");
        }
        
        Job job = jobOpt.get();
        
        // Check if the employer owns the job
        if (!job.getEmployer().getId().equals(NLOProfile.getId())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("You are not authorized to view this job"));
        }
        
        return ResponseEntity.ok(new JobResponseDTO(job));
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<Job>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String title,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "postedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<Job> jobs;
        if (keyword != null && !keyword.trim().isEmpty()) {
            jobs = jobRepository.searchJobsByKeyword(keyword, pageable);
        } else if (location != null && title != null) {
            jobs = jobRepository.searchJobs(location, title, pageable);
        } else {
            jobs = jobRepository.findByActive(true, pageable);
        }
        
        return ResponseEntity.ok(jobs);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('NLO')")
    public ResponseEntity<Job> createJob(@RequestBody Map<String, Object> jobData) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<NLOProfile> NLOProfileOpt = NLOProfileRepository.findByUserId(userId);
        if (NLOProfileOpt.isEmpty()) {
            throw new ResourceNotFoundException("Employer profile not found");
        }

        NLOProfile NLOProfile = NLOProfileOpt.get();
        
        Job job = new Job();
        job.setEmployer(NLOProfile);
        
        // Set job fields from request data
        if (jobData.containsKey("title")) {
            job.setTitle((String) jobData.get("title"));
        }
        
        if (jobData.containsKey("description")) {
            job.setDescription((String) jobData.get("description"));
        }
        
        if (jobData.containsKey("location")) {
            job.setLocation((String) jobData.get("location"));
        }
        
        if (jobData.containsKey("requiredSkills")) {
            job.setRequiredSkills((String) jobData.get("requiredSkills"));
        }
        
        if (jobData.containsKey("employmentType")) {
            job.setEmploymentType((String) jobData.get("employmentType"));
        }
        
        if (jobData.containsKey("minSalary") && jobData.get("minSalary") instanceof Number) {
            job.setMinSalary(((Number) jobData.get("minSalary")).doubleValue());
        }
        
        if (jobData.containsKey("maxSalary") && jobData.get("maxSalary") instanceof Number) {
            job.setMaxSalary(((Number) jobData.get("maxSalary")).doubleValue());
        }
        
        if (jobData.containsKey("currency")) {
            job.setCurrency((String) jobData.get("currency"));
        }
        
        // Handle company association
        if (jobData.containsKey("companyId") && jobData.get("companyId") != null) {
            String companyIdStr = jobData.get("companyId").toString();
            try {
                UUID companyId = UUID.fromString(companyIdStr);
                Optional<Company> companyOpt = companyRepository.findById(companyId);
                if (companyOpt.isPresent()) {
                    job.setCompany(companyOpt.get());
                }
            } catch (IllegalArgumentException e) {
                // Invalid UUID format, skip company association
                System.err.println("Invalid company ID format: " + companyIdStr);
            }
        }
        
        job.setPostedAt(LocalDateTime.now());
        job.setActive(true);
        
        job = jobRepository.save(job);
        
        // Call job matching service for students with CVs
        List<StudentProfile> studentsWithCVs = studentProfileRepository.findAllWithActiveCVs();
        for (StudentProfile student : studentsWithCVs) {
            try {
                List<JobMatch> matches = jobMatchService.findMatchesForStudent(student.getId(), 0.0);
                System.out.println("Job matches updated for student: " + student.getId() + ", Matches found: " + matches.size());
            } catch (Exception e) {
                System.err.println("Error updating job matches for student " + student.getId() + ": " + e.getMessage());
            }
        }
        
        return ResponseEntity.ok(job);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('NLO')")
    public ResponseEntity<?> updateJob(@PathVariable UUID id, @RequestBody Map<String, Object> jobData) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<NLOProfile> NLOProfileOpt = NLOProfileRepository.findByUserId(userId);
        if (NLOProfileOpt.isEmpty()) {
            throw new ResourceNotFoundException("Employer profile not found");
        }

        NLOProfile NLOProfile = NLOProfileOpt.get();
        
        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            throw new ResourceNotFoundException("Job not found");
        }
        
        Job job = jobOpt.get();
        
        // Check if the employer owns the job
        if (!job.getEmployer().getId().equals(NLOProfile.getId())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("You are not authorized to update this job"));
        }
        
        // Update job fields
        if (jobData.containsKey("title")) {
            job.setTitle((String) jobData.get("title"));
        }
        
        if (jobData.containsKey("description")) {
            job.setDescription((String) jobData.get("description"));
        }
        
        if (jobData.containsKey("location")) {
            job.setLocation((String) jobData.get("location"));
        }
        
        if (jobData.containsKey("requiredSkills")) {
            job.setRequiredSkills((String) jobData.get("requiredSkills"));
        }
        
        if (jobData.containsKey("employmentType")) {
            job.setEmploymentType((String) jobData.get("employmentType"));
        }
        
        if (jobData.containsKey("minSalary") && jobData.get("minSalary") instanceof Number) {
            job.setMinSalary(((Number) jobData.get("minSalary")).doubleValue());
        }
        
        if (jobData.containsKey("maxSalary") && jobData.get("maxSalary") instanceof Number) {
            job.setMaxSalary(((Number) jobData.get("maxSalary")).doubleValue());
        }
        
        if (jobData.containsKey("currency")) {
            job.setCurrency((String) jobData.get("currency"));
        }
        
        if (jobData.containsKey("active") && jobData.get("active") instanceof Boolean) {
            job.setActive((Boolean) jobData.get("active"));
        }
        
        // Handle company association
        if (jobData.containsKey("companyId")) {
            if (jobData.get("companyId") != null) {
                String companyIdStr = jobData.get("companyId").toString();
                try {
                    UUID companyId = UUID.fromString(companyIdStr);
                    Optional<Company> companyOpt = companyRepository.findById(companyId);
                    if (companyOpt.isPresent()) {
                        job.setCompany(companyOpt.get());
                    }
                } catch (IllegalArgumentException e) {
                    // Invalid UUID format, skip company association
                    System.err.println("Invalid company ID format: " + companyIdStr);
                }
            } else {
                // If companyId is explicitly set to null, remove company association
                job.setCompany(null);
            }
        }
        
        job = jobRepository.save(job);
        
        return ResponseEntity.ok(job);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('NLO')")
    public ResponseEntity<?> deleteJob(@PathVariable UUID id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<NLOProfile> NLOProfileOpt = NLOProfileRepository.findByUserId(userId);
        if (NLOProfileOpt.isEmpty()) {
            throw new ResourceNotFoundException("Employer profile not found");
        }

        NLOProfile NLOProfile = NLOProfileOpt.get();
        
        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            throw new ResourceNotFoundException("Job not found");
        }
        
        Job job = jobOpt.get();
        
        // Check if the employer owns the job
        if (!job.getEmployer().getId().equals(NLOProfile.getId())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("You are not authorized to delete this job"));
        }
        
        // Soft delete by setting active to false
        job.setActive(false);
        jobRepository.save(job);
        
        return ResponseEntity.ok(new MessageResponse("Job deleted successfully"));
    }
    
    @PutMapping("/{id}/reactivate")
    @PreAuthorize("hasRole('NLO')")
    public ResponseEntity<?> reactivateJob(@PathVariable UUID id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<NLOProfile> NLOProfileOpt = NLOProfileRepository.findByUserId(userId);
        if (NLOProfileOpt.isEmpty()) {
            throw new ResourceNotFoundException("Employer profile not found");
        }

        NLOProfile NLOProfile = NLOProfileOpt.get();
        
        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            throw new ResourceNotFoundException("Job not found");
        }
        
        Job job = jobOpt.get();
        
        // Check if the employer owns the job
        if (!job.getEmployer().getId().equals(NLOProfile.getId())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("You are not authorized to reactivate this job"));
        }
        
        // Reactivate the job
        job.setActive(true);
        jobRepository.save(job);
        
        return ResponseEntity.ok(new MessageResponse("Job reactivated successfully"));
    }
    
    @GetMapping("/{id}/prepare-email-draft")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> prepareEmailDraftForJob(@PathVariable UUID id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();
        
        Optional<StudentProfile> studentProfileOpt = studentProfileRepository.findByUserId(userId);
        if (studentProfileOpt.isEmpty()) {
            throw new ResourceNotFoundException("Student profile not found");
        }
        
        StudentProfile student = studentProfileOpt.get();
        
        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty() || !jobOpt.get().isActive()) {
            throw new ResourceNotFoundException("Job not found");
        }
        
        Job job = jobOpt.get();
        NLOProfile employer = job.getEmployer();
        
        // Get student's active CV
        UUID cvId = student.getActiveCvId();
        if (cvId == null) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "No active CV found. Please set an active CV in your profile."));
        }
        
        Optional<com.ojtechapi.spring.jwtoauth.entities.CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "CV not found."));
        }
        
        com.ojtechapi.spring.jwtoauth.entities.CV cv = cvOpt.get();
        
        // Generate cover letter
        String coverLetter = coverLetterService.generateCoverLetter(student.getId(), id, cvId);
        
        // Build email draft
        String studentName = student.getFirstName() + " " + student.getLastName();
        String emailBody = generateEmailBody(studentName, job.getTitle(), coverLetter);
        String subject = "Job Application for " + job.getTitle() + " - " + studentName;
        
        // Generate CV view URL
        String cvUrl = baseUrl + "/api/cvs/" + cv.getId() + "/view";
        
        // Get email from User entity or fallback
        String studentEmail = student.getUser() != null ? student.getUser().getEmail() : student.getEmail();
        String studentPhone = student.getPhoneNumber() != null ? student.getPhoneNumber() : student.getPhone();
        
        // Determine recipient email and name
        String recipientEmail;
        String recipientName;
        
        if (job.getCompany() != null && job.getCompany().getHrEmail() != null) {
            recipientEmail = job.getCompany().getHrEmail();
            recipientName = job.getCompany().getHrName() != null ? job.getCompany().getHrName() : "Hiring Manager";
        } else {
            recipientEmail = employer.getContactPersonEmail();
            recipientName = employer.getContactPersonName();
        }
        
        com.ojtechapi.spring.jwtoauth.dtos.EmailDraftDTO draft = new com.ojtechapi.spring.jwtoauth.dtos.EmailDraftDTO(
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
    
    private String generateEmailBody(String studentName, String jobTitle, String coverLetter) {
        return String.format(
            "I am writing to express my interest in the %s position.\n\n%s\n\n" +
            "I have attached my CV for your review. I would welcome the opportunity to discuss how my skills align with your needs.\n\n" +
            "Thank you for considering my application.\n\nBest regards,\n%s",
            jobTitle, coverLetter != null ? coverLetter : "Please find my application materials attached.", studentName
        );
    }
}
