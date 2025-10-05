package com.melardev.spring.jwtoauth.controller;

import com.melardev.spring.jwtoauth.dtos.responses.JobResponseDTO;
import com.melardev.spring.jwtoauth.dtos.responses.MessageResponse;
import com.melardev.spring.jwtoauth.entities.EmployerProfile;
import com.melardev.spring.jwtoauth.entities.Job;
import com.melardev.spring.jwtoauth.entities.JobMatch;
import com.melardev.spring.jwtoauth.entities.StudentProfile;
import com.melardev.spring.jwtoauth.exceptions.ResourceNotFoundException;
import com.melardev.spring.jwtoauth.repositories.EmployerProfileRepository;
import com.melardev.spring.jwtoauth.repositories.JobRepository;
import com.melardev.spring.jwtoauth.repositories.StudentProfileRepository;
import com.melardev.spring.jwtoauth.security.services.UserDetailsImpl;
import com.melardev.spring.jwtoauth.services.JobMatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/jobs")
public class JobController {
    
    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private EmployerProfileRepository employerProfileRepository;
    
    @Autowired
    private StudentProfileRepository studentProfileRepository;
    
    @Autowired
    private JobMatchService jobMatchService;
    
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
    public ResponseEntity<Job> getJobById(@PathVariable UUID id) {
        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty() || !jobOpt.get().isActive()) {
            throw new ResourceNotFoundException("Job not found");
        }
        
        return ResponseEntity.ok(jobOpt.get());
    }
    
    @GetMapping("/employer")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<List<JobResponseDTO>> getEmployerJobs() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<EmployerProfile> employerProfileOpt = employerProfileRepository.findByUserId(userId);
        if (employerProfileOpt.isEmpty()) {
            throw new ResourceNotFoundException("Employer profile not found");
        }

        EmployerProfile employerProfile = employerProfileOpt.get();
        List<Job> jobs = jobRepository.findByEmployer(employerProfile);
        
        List<JobResponseDTO> jobResponseDTOs = jobs.stream()
            .map(JobResponseDTO::new)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(jobResponseDTOs);
    }
    
    @GetMapping("/employer/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<?> getEmployerJobById(@PathVariable UUID id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<EmployerProfile> employerProfileOpt = employerProfileRepository.findByUserId(userId);
        if (employerProfileOpt.isEmpty()) {
            throw new ResourceNotFoundException("Employer profile not found");
        }

        EmployerProfile employerProfile = employerProfileOpt.get();
        
        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            throw new ResourceNotFoundException("Job not found");
        }
        
        Job job = jobOpt.get();
        
        // Check if the employer owns the job
        if (!job.getEmployer().getId().equals(employerProfile.getId())) {
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
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Job> createJob(@RequestBody Map<String, Object> jobData) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<EmployerProfile> employerProfileOpt = employerProfileRepository.findByUserId(userId);
        if (employerProfileOpt.isEmpty()) {
            throw new ResourceNotFoundException("Employer profile not found");
        }

        EmployerProfile employerProfile = employerProfileOpt.get();
        
        Job job = new Job();
        job.setEmployer(employerProfile);
        
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
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<?> updateJob(@PathVariable UUID id, @RequestBody Map<String, Object> jobData) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<EmployerProfile> employerProfileOpt = employerProfileRepository.findByUserId(userId);
        if (employerProfileOpt.isEmpty()) {
            throw new ResourceNotFoundException("Employer profile not found");
        }

        EmployerProfile employerProfile = employerProfileOpt.get();
        
        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            throw new ResourceNotFoundException("Job not found");
        }
        
        Job job = jobOpt.get();
        
        // Check if the employer owns the job
        if (!job.getEmployer().getId().equals(employerProfile.getId())) {
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
        
        job = jobRepository.save(job);
        
        return ResponseEntity.ok(job);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<?> deleteJob(@PathVariable UUID id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<EmployerProfile> employerProfileOpt = employerProfileRepository.findByUserId(userId);
        if (employerProfileOpt.isEmpty()) {
            throw new ResourceNotFoundException("Employer profile not found");
        }

        EmployerProfile employerProfile = employerProfileOpt.get();
        
        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            throw new ResourceNotFoundException("Job not found");
        }
        
        Job job = jobOpt.get();
        
        // Check if the employer owns the job
        if (!job.getEmployer().getId().equals(employerProfile.getId())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("You are not authorized to delete this job"));
        }
        
        // Soft delete by setting active to false
        job.setActive(false);
        jobRepository.save(job);
        
        return ResponseEntity.ok(new MessageResponse("Job deleted successfully"));
    }
} 