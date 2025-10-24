package com.ojtechapi.spring.jwtoauth.controller;

import com.ojtechapi.spring.jwtoauth.dtos.JobMatchDto;
import com.ojtechapi.spring.jwtoauth.entities.Job;
import com.ojtechapi.spring.jwtoauth.entities.JobMatch;
import com.ojtechapi.spring.jwtoauth.entities.StudentProfile;
import com.ojtechapi.spring.jwtoauth.repositories.JobRepository;
import com.ojtechapi.spring.jwtoauth.repositories.StudentProfileRepository;
import com.ojtechapi.spring.jwtoauth.security.CurrentUser;
import com.ojtechapi.spring.jwtoauth.security.UserPrincipal;
import com.ojtechapi.spring.jwtoauth.security.services.UserDetailsImpl;
import com.ojtechapi.spring.jwtoauth.services.JobMatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.ArrayList;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api")
public class JobMatchController {

    @Autowired
    private JobMatchService jobMatchService;
    
    @Autowired
    private StudentProfileRepository studentProfileRepository;
    
    @Autowired
    private JobRepository jobRepository;

    @GetMapping("/findjobs")
    public ResponseEntity<?> findJobMatches(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(value = "minScore", defaultValue = "50") Double minScore) {
        
        try {
            // Check if there's an authentication in the security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication != null && authentication.isAuthenticated()) {
                // Authentication exists but @CurrentUser might not be resolving properly
                Object principal = authentication.getPrincipal();
                
                UUID userId = null;
                
                // Determine user ID from either UserPrincipal or UserDetailsImpl
                if (currentUser != null) {
                    userId = currentUser.getId();
                } else if (principal instanceof UserDetailsImpl) {
                    userId = ((UserDetailsImpl) principal).getId();
                } else {
                    Map<String, Object> debugInfo = new HashMap<>();
                    debugInfo.put("authExists", true);
                    debugInfo.put("principalType", principal != null ? principal.getClass().getName() : "null");
                    debugInfo.put("currentUserNull", currentUser == null);
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(debugInfo);
                }
                
                // Now we have a userId, proceed with finding the student profile
                StudentProfile studentProfile = studentProfileRepository.findByUserId(userId)
                        .orElseThrow(() -> new RuntimeException("Student profile not found"));
                
                // Process job matching and wait for AI response
                List<JobMatch> matches = jobMatchService.findMatchesForStudent(studentProfile.getId(), minScore);
                
                // Create response with matches and job details
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Job matching completed successfully");
                response.put("matchCount", matches.size());
                response.put("studentName", studentProfile.getFirstName() + " " + studentProfile.getLastName());
                
                List<Map<String, Object>> matchDetails = new ArrayList<>();
                for (JobMatch match : matches) {
                    Map<String, Object> matchInfo = new HashMap<>();
                    matchInfo.put("matchId", match.getId());
                    matchInfo.put("matchScore", match.getMatchScore());
                    matchInfo.put("matchedAt", match.getMatchedAt());
                    
                    Job job = match.getJob();
                    Map<String, Object> jobInfo = new HashMap<>();
                    jobInfo.put("id", job.getId());
                    jobInfo.put("title", job.getTitle());
                    jobInfo.put("description", job.getDescription());
                    jobInfo.put("requiredSkills", job.getRequiredSkills());
                    jobInfo.put("location", job.getLocation());
                    jobInfo.put("employmentType", job.getEmploymentType());
                    
                    matchInfo.put("job", jobInfo);
                    matchInfo.put("matchDetails", match.getMatchDetails());
                    
                    matchDetails.add(matchInfo);
                }
                
                response.put("matches", matchDetails);
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "No authentication found in security context"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
    
    @GetMapping("/student/job-matches")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getStudentJobMatches(@CurrentUser UserPrincipal currentUser) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Authentication required"));
            }
            
            StudentProfile studentProfile = studentProfileRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("Student profile not found"));
            
            // Note: Verification check removed - frontend handles warnings for unverified students
            // Students can browse jobs but see warnings about uploading documents and verification status
            // if(!studentProfile.isVerified()){
            //     return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            //         .body(Collections.singletonMap("error", "Student profile not verified"));
            // }
            List<JobMatch> matches = jobMatchService.getStudentMatches(studentProfile.getId());
            List<JobMatchDto> matchDtos = matches.stream()
                    .map(JobMatchDto::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(matchDtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
    
    @PutMapping("/job-matches/{id}/viewed")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> markJobMatchAsViewed(
            @PathVariable("id") UUID jobMatchId,
            @CurrentUser UserPrincipal currentUser) {
        
        try {
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Authentication required"));
            }
            
            StudentProfile studentProfile = studentProfileRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("Student profile not found"));
            
            // Note: Verification check removed - frontend handles warnings for unverified students
            // Students can browse jobs but see warnings about uploading documents and verification status
            
            JobMatch jobMatch = jobMatchService.markAsViewed(jobMatchId, studentProfile.getId());
            JobMatchDto jobMatchDto = new JobMatchDto(jobMatch);
            
            return ResponseEntity.ok(jobMatchDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
    
    @GetMapping("/test-auth")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> testAuthentication(@CurrentUser UserPrincipal currentUser) {
        try {
            // Check if there's an authentication in the security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            Map<String, Object> response = new HashMap<>();
            response.put("securityContextAuth", authentication != null);
            
            if (authentication != null) {
                response.put("authName", authentication.getName());
                response.put("authType", authentication.getClass().getSimpleName());
                response.put("authPrincipalType", authentication.getPrincipal().getClass().getSimpleName());
            }
            
            response.put("currentUserNull", currentUser == null);
            
            if (currentUser != null) {
                response.put("currentUserName", currentUser.getUsername());
                response.put("currentUserId", currentUser.getId());
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
    
    @GetMapping("/public/job-match-status")
    public ResponseEntity<?> getJobMatchStatus() {
        return ResponseEntity.ok(Collections.singletonMap("status", "Job matching system is up and running"));
    }

    @PostMapping("/test/create-sample-job")
    public ResponseEntity<?> createSampleJob(@RequestBody Map<String, Object> jobData) {
        try {
            // Extract job data from request
            String title = (String) jobData.getOrDefault("title", "Sample Developer Position");
            String description = (String) jobData.getOrDefault("description", 
                "This is a sample job for testing the job matching system.");
            String requiredSkills = (String) jobData.getOrDefault("requiredSkills", 
                "Java, Spring Boot, React, JavaScript");
            String location = (String) jobData.getOrDefault("location", "Remote");
            String employmentType = (String) jobData.getOrDefault("employmentType", "Full-time");
            
            // Create a new job
            Job job = new Job();
            job.setTitle(title);
            job.setDescription(description);
            job.setRequiredSkills(requiredSkills);
            job.setLocation(location);
            job.setEmploymentType(employmentType);
            job.setPostedAt(LocalDateTime.now());
            job.setActive(true);
            
            // Save the job
            Job savedJob = jobRepository.save(job);
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Sample job created successfully");
            response.put("job", savedJob);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/direct-findjobs")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> directFindJobMatches(
            @RequestParam(value = "minScore", defaultValue = "50") Double minScore) {
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication != null && authentication.isAuthenticated()) {
                Object principal = authentication.getPrincipal();
                
                if (!(principal instanceof UserPrincipal)) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("error", 
                            "Principal is not UserPrincipal: " + principal.getClass().getName()));
                }
                
                UserPrincipal userPrincipal = (UserPrincipal) principal;
                
                StudentProfile studentProfile = studentProfileRepository.findByUserId(userPrincipal.getId())
                        .orElseThrow(() -> new RuntimeException("Student profile not found"));
                
                List<JobMatch> matches = jobMatchService.findMatchesForStudent(studentProfile.getId(), minScore);
                List<JobMatchDto> matchDtos = matches.stream()
                        .map(JobMatchDto::new)
                        .collect(Collectors.toList());
                
                return ResponseEntity.ok(matchDtos);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "No authentication found in security context"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/simple-findjobs")
    public ResponseEntity<?> simpleJobMatches(
            @RequestParam(value = "studentId", required = false) UUID studentId,
            @RequestParam(value = "minScore", defaultValue = "40") Double minScore) {
        
        try {
            StudentProfile studentProfile = null;
            
            // First try to get student from authentication if available
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && 
                !"anonymousUser".equals(authentication.getPrincipal())) {
                
                Object principal = authentication.getPrincipal();
                UUID userId = null;
                
                if (principal instanceof UserDetailsImpl) {
                    userId = ((UserDetailsImpl) principal).getId();
                } else if (principal instanceof UserPrincipal) {
                    userId = ((UserPrincipal) principal).getId();
                }
                
                if (userId != null) {
                    studentProfile = studentProfileRepository.findByUserId(userId).orElse(null);
                }
            }
            
            // If not found via authentication and studentId is provided, try that
            if (studentProfile == null && studentId != null) {
                studentProfile = studentProfileRepository.findById(studentId).orElse(null);
            }
            
            // If still not found, return error
            if (studentProfile == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", 
                        "Student profile not found. Please provide a valid studentId parameter or login."));
            }
            
            System.out.println("Finding job matches for student: " + studentProfile.getFirstName() + 
                " " + studentProfile.getLastName() + " (ID: " + studentProfile.getId() + ")");
            System.out.println("Student skills: " + studentProfile.getSkills());
            
            // Process job matching - get all jobs and wait for AI response
            List<JobMatch> allMatches = jobMatchService.findMatchesForStudent(studentProfile.getId(), 0.0);
            
            System.out.println("Total matches found: " + allMatches.size());
            
            // Filter matches based on minScore parameter (default 40%)
            List<JobMatch> filteredMatches = allMatches.stream()
                .filter(match -> match.getMatchScore() >= minScore)
                .collect(Collectors.toList());
            
            System.out.println("Filtered matches (>= " + minScore + "%): " + filteredMatches.size());
            
            // Create detailed response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Job matching completed successfully");
            response.put("matchCount", filteredMatches.size());
            response.put("totalJobsAnalyzed", allMatches.size());
            response.put("minScoreFilter", minScore + "%");
            response.put("studentName", studentProfile.getFirstName() + " " + studentProfile.getLastName());
            response.put("studentSkills", studentProfile.getSkills());
            
            // Include detailed match information for jobs that meet the minimum score
            List<Map<String, Object>> matchDetails = new ArrayList<>();
            for (JobMatch match : filteredMatches) {
                Map<String, Object> matchInfo = new HashMap<>();
                matchInfo.put("matchId", match.getId());
                matchInfo.put("matchScore", match.getMatchScore());
                matchInfo.put("matchedAt", match.getMatchedAt());
                
                Job job = match.getJob();
                Map<String, Object> jobInfo = new HashMap<>();
                jobInfo.put("id", job.getId());
                jobInfo.put("title", job.getTitle());
                jobInfo.put("description", job.getDescription());
                jobInfo.put("requiredSkills", job.getRequiredSkills());
                jobInfo.put("location", job.getLocation());
                jobInfo.put("employmentType", job.getEmploymentType());
                if (job.getEmployer() != null) {
                    jobInfo.put("company", job.getEmployer().getCompanyName());
                } else {
                    jobInfo.put("company", "Unknown");
                }
                
                matchInfo.put("job", jobInfo);
                
                // Enhanced analytics for the match
                Map<String, Object> analytics = new HashMap<>();
                analytics.put("matchScore", match.getMatchScore() + "%");
                analytics.put("fullAnalysis", match.getMatchDetails());
                
                // Include detailed analysis if available
                if (match.getDetailedAnalysis() != null && !match.getDetailedAnalysis().isEmpty()) {
                    try {
                        ObjectMapper objectMapper = new ObjectMapper();
                        Map<String, Object> detailedAnalysis = objectMapper.readValue(
                            match.getDetailedAnalysis(), new TypeReference<Map<String, Object>>() {});
                        analytics.put("detailedAnalysis", detailedAnalysis);
                    } catch (Exception e) {
                        System.err.println("Error parsing detailed analysis: " + e.getMessage());
                    }
                }
                
                matchInfo.put("analytics", analytics);
                matchDetails.add(matchInfo);
            }
            
            response.put("matches", matchDetails);
            
            // If no matches found, add a message
            if (filteredMatches.isEmpty()) {
                response.put("message", "No job matches found with score >= " + minScore + "%. Try lowering the minimum score.");
                
                // Add some information about all analyzed jobs
                if (!allMatches.isEmpty()) {
                    List<Map<String, Object>> allJobsInfo = new ArrayList<>();
                    for (JobMatch match : allMatches) {
                        Map<String, Object> jobInfo = new HashMap<>();
                        jobInfo.put("id", match.getJob().getId());
                        jobInfo.put("title", match.getJob().getTitle());
                        jobInfo.put("requiredSkills", match.getJob().getRequiredSkills());
                        jobInfo.put("matchScore", match.getMatchScore() + "%");
                        allJobsInfo.add(jobInfo);
                    }
                    response.put("allAnalyzedJobs", allJobsInfo);
                }
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
    
    // Helper method to parse skills from string
    private List<String> parseSkillsFromString(String skillsString) {
        if (skillsString == null || skillsString.trim().isEmpty()) {
            return Collections.emptyList();
        }
        
        List<String> skills = new ArrayList<>();
        
        // Try to parse as JSON array if it starts with [ and ends with ]
        if (skillsString.trim().startsWith("[") && skillsString.trim().endsWith("]")) {
            try {
                // Simple JSON array parsing
                String trimmed = skillsString.trim();
                trimmed = trimmed.substring(1, trimmed.length() - 1); // Remove [ ]
                String[] items = trimmed.split(",");
                
                for (String item : items) {
                    // Remove quotes and trim
                    String skill = item.trim();
                    if (skill.startsWith("\"") && skill.endsWith("\"")) {
                        skill = skill.substring(1, skill.length() - 1);
                    }
                    if (!skill.isEmpty()) {
                        skills.add(skill);
                    }
                }
                
                return skills;
            } catch (Exception e) {
                // Fall back to comma-separated parsing
            }
        }
        
        // Parse as comma-separated list
        String[] skillsArray = skillsString.split(",");
        for (String skill : skillsArray) {
            String trimmed = skill.trim();
            if (!trimmed.isEmpty()) {
                skills.add(trimmed);
            }
        }
        
        return skills;
    }

    @PostMapping("/test/match-skills")
    public ResponseEntity<?> testSkillMatching(@RequestBody Map<String, Object> requestData) {
        try {
            // Extract student skills and job required skills from request
            String studentSkillsStr = (String) requestData.getOrDefault("studentSkills", 
                "Java, Spring Boot, React");
            String jobSkillsStr = (String) requestData.getOrDefault("jobSkills", 
                "Java, Spring Boot, React, JavaScript, TypeScript");
            
            // Parse skills
            List<String> studentSkills = parseSkillsFromString(studentSkillsStr);
            List<String> jobSkills = parseSkillsFromString(jobSkillsStr);
            
            // Calculate matching skills
            List<String> matchingSkills = new ArrayList<>();
            List<String> missingSkills = new ArrayList<>();
            
            for (String jobSkill : jobSkills) {
                boolean found = false;
                for (String studentSkill : studentSkills) {
                    if (studentSkill.equalsIgnoreCase(jobSkill) || 
                        jobSkill.toLowerCase().contains(studentSkill.toLowerCase()) || 
                        studentSkill.toLowerCase().contains(jobSkill.toLowerCase())) {
                        found = true;
                        break;
                    }
                }
                
                if (found) {
                    matchingSkills.add(jobSkill);
                } else {
                    missingSkills.add(jobSkill);
                }
            }
            
            // Calculate skill match percentage
            double skillMatchPercentage = jobSkills.isEmpty() ? 0 : 
                (double) matchingSkills.size() / jobSkills.size() * 100;
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("studentSkills", studentSkills);
            response.put("jobSkills", jobSkills);
            response.put("matchingSkills", matchingSkills);
            response.put("missingSkills", missingSkills);
            response.put("skillMatchPercentage", Math.round(skillMatchPercentage) + "%");
            
            // Call Gemini API for detailed analysis if API key is available
            if (jobMatchService.hasGeminiApiKey()) {
                String analysis = jobMatchService.generateSkillMatchAnalysis(studentSkills, jobSkills);
                response.put("aiAnalysis", analysis);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/test/create-matching-job")
    public ResponseEntity<?> createMatchingJob(@RequestBody Map<String, Object> requestData) {
        try {
            // Get student ID from request or authentication
            final UUID studentId;
            if (requestData.containsKey("studentId")) {
                studentId = UUID.fromString((String) requestData.get("studentId"));
            } else {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                UUID authUserId = null;
                if (authentication != null && authentication.isAuthenticated() && 
                    !"anonymousUser".equals(authentication.getPrincipal())) {
                    
                    Object principal = authentication.getPrincipal();
                    if (principal instanceof UserDetailsImpl) {
                        authUserId = ((UserDetailsImpl) principal).getId();
                    } else if (principal instanceof UserPrincipal) {
                        authUserId = ((UserPrincipal) principal).getId();
                    }
                }
                studentId = authUserId;
            }
            
            if (studentId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "No student ID provided or found in authentication"));
            }
            
            // Get student profile
            StudentProfile studentProfile = studentProfileRepository.findById(studentId)
                .orElseGet(() -> studentProfileRepository.findByUserId(studentId).orElse(null));
            
            if (studentProfile == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Student profile not found"));
            }
            
            // Parse student skills
            List<String> studentSkills = parseSkillsFromString(studentProfile.getSkills());
            
            if (studentSkills.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Student has no skills defined"));
            }
            
            // Create a job with matching skills
            String title = (String) requestData.getOrDefault("title", "Perfect Match Developer Position");
            String description = (String) requestData.getOrDefault("description", 
                "This job is created to match your skills perfectly!");
            
            // Use student skills plus some additional skills
            StringBuilder requiredSkills = new StringBuilder();
            for (String skill : studentSkills) {
                requiredSkills.append(skill).append(", ");
            }
            // Add a few more skills that the student doesn't have
            requiredSkills.append("Docker, Git, Agile");
            
            String location = (String) requestData.getOrDefault("location", "Remote");
            String employmentType = (String) requestData.getOrDefault("employmentType", "Full-time");
            
            // Create the job
            Job job = new Job();
            job.setTitle(title);
            job.setDescription(description);
            job.setRequiredSkills(requiredSkills.toString());
            job.setLocation(location);
            job.setEmploymentType(employmentType);
            job.setPostedAt(LocalDateTime.now());
            job.setActive(true);
            
            // Save the job
            Job savedJob = jobRepository.save(job);
            
            // Now run the matching algorithm
            List<JobMatch> matches = jobMatchService.findMatchesForStudent(studentProfile.getId(), 0.0);
            
            // Find the match for our newly created job
            JobMatch ourMatch = matches.stream()
                .filter(match -> match.getJob().getId().equals(savedJob.getId()))
                .findFirst()
                .orElse(null);
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Matching job created successfully");
            response.put("job", savedJob);
            
            if (ourMatch != null) {
                Map<String, Object> matchInfo = new HashMap<>();
                matchInfo.put("matchId", ourMatch.getId());
                matchInfo.put("matchScore", ourMatch.getMatchScore());
                matchInfo.put("matchDetails", ourMatch.getMatchDetails());
                response.put("match", matchInfo);
            } else {
                response.put("warning", "Job created but match not found. Try running the matching algorithm again.");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/job-matches/{id}/detailed-analysis")
    public ResponseEntity<?> getJobMatchDetailedAnalysis(@PathVariable("id") UUID jobMatchId) {
        try {
            JobMatch jobMatch = jobMatchService.getJobMatch(jobMatchId);
            
            if (jobMatch == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Job match not found"));
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("matchId", jobMatch.getId());
            response.put("matchScore", jobMatch.getMatchScore());
            response.put("matchedAt", jobMatch.getMatchedAt());
            
            // Basic job info
            Job job = jobMatch.getJob();
            Map<String, Object> jobInfo = new HashMap<>();
            jobInfo.put("id", job.getId());
            jobInfo.put("title", job.getTitle());
            jobInfo.put("description", job.getDescription());
            jobInfo.put("requiredSkills", job.getRequiredSkills());
            response.put("job", jobInfo);
            
            // Basic student info
            StudentProfile student = jobMatch.getStudent();
            Map<String, Object> studentInfo = new HashMap<>();
            studentInfo.put("id", student.getId());
            studentInfo.put("name", student.getFirstName() + " " + student.getLastName());
            studentInfo.put("skills", student.getSkills());
            response.put("student", studentInfo);
            
            // Match details
            response.put("matchDetails", jobMatch.getMatchDetails());
            
            // Parse detailed analysis if available
            if (jobMatch.getDetailedAnalysis() != null && !jobMatch.getDetailedAnalysis().isEmpty()) {
                try {
                    ObjectMapper objectMapper = new ObjectMapper();
                    Map<String, Object> detailedAnalysis = objectMapper.readValue(
                        jobMatch.getDetailedAnalysis(), new TypeReference<Map<String, Object>>() {});
                    response.put("detailedAnalysis", detailedAnalysis);
                } catch (Exception e) {
                    response.put("error", "Failed to parse detailed analysis: " + e.getMessage());
                }
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
} 
