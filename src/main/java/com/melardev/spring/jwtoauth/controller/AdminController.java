package com.melardev.spring.jwtoauth.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
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

import com.melardev.spring.jwtoauth.dtos.responses.MessageResponse;
import com.melardev.spring.jwtoauth.entities.ERole;
import com.melardev.spring.jwtoauth.entities.Job;
import com.melardev.spring.jwtoauth.entities.JobApplication;
import com.melardev.spring.jwtoauth.entities.Role;
import com.melardev.spring.jwtoauth.entities.User;
import com.melardev.spring.jwtoauth.repositories.RoleRepository;
import com.melardev.spring.jwtoauth.repositories.UserRepository;
import com.melardev.spring.jwtoauth.repositories.JobRepository;
import com.melardev.spring.jwtoauth.repositories.JobApplicationRepository;
import com.melardev.spring.jwtoauth.service.UserService;
import com.melardev.spring.jwtoauth.service.interfaces.AdminJobService;
import com.melardev.spring.jwtoauth.dtos.admin.*;
import com.melardev.spring.jwtoauth.entities.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private JobApplicationRepository jobApplicationRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AdminJobService adminJobService;
    
    @Autowired
    private com.melardev.spring.jwtoauth.repositories.EmployerProfileRepository employerProfileRepository;
    
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAll();
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/users/paginated")
    public ResponseEntity<?> getPaginatedUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "username") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        
        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<User> usersPage = userRepository.findAll(pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("users", usersPage.getContent());
        response.put("currentPage", usersPage.getNumber());
        response.put("totalItems", usersPage.getTotalElements());
        response.put("totalPages", usersPage.getTotalPages());
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> userData) {
        try {
            String username = userData.get("username");
            String email = userData.get("email");
            String password = userData.get("password");
            String roleName = userData.get("role");
            
            if (username == null || email == null || password == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Username, email and password are required"));
            }
            
            if (userRepository.existsByUsername(username)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Username already exists"));
            }
            
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Email already exists"));
            }
            
            User user = new User(username, email, passwordEncoder.encode(password));
            
            // Set role
            ERole eRole = ERole.ROLE_STUDENT; // Default
            if (roleName != null) {
                switch (roleName.toLowerCase()) {
                    case "admin":
                        eRole = ERole.ROLE_ADMIN;
                        break;
                    case "employer":
                        eRole = ERole.ROLE_NLO;
                        break;
                }
            }
            
            Optional<Role> roleOpt = roleRepository.findByName(eRole);
            if (roleOpt.isPresent()) {
                user.getRoles().add(roleOpt.get());
            }
            
            userRepository.save(user);
            return ResponseEntity.ok(new MessageResponse("User created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable UUID id) {
        Optional<User> userOpt = userService.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(userOpt.get());
    }
    
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable UUID id, @RequestBody Map<String, Object> userData) {
        Optional<User> userOpt = userService.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        
        // Update fields if present in request
        if (userData.containsKey("username")) {
            String newUsername = (String) userData.get("username");
            if (!user.getUsername().equals(newUsername) && userRepository.existsByUsername(newUsername)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Username already in use"));
            }
            user.setUsername((String) userData.get("username"));
        }
        
        if (userData.containsKey("email")) {
            String newEmail = (String) userData.get("email");
            if (!user.getEmail().equals(newEmail) && userRepository.existsByEmail(newEmail)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Email already in use"));
            }
            user.setEmail(newEmail);
        }
        
        if (userData.containsKey("password")) {
            user.setPassword(passwordEncoder.encode((String) userData.get("password")));
        }
        
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("User updated successfully"));
    }
    
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id) {
        Optional<User> userOpt = userService.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        userRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
    }
    
    @PutMapping("/users/{id}/roles")
    public ResponseEntity<?> updateUserRoles(@PathVariable UUID id, @RequestBody List<String> roles) {
        Optional<User> userOpt = userService.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        user.getRoles().clear();
        
        for (String roleName : roles) {
            ERole eRole;
            switch (roleName.toLowerCase()) {
                case "admin":
                    eRole = ERole.ROLE_ADMIN;
                    break;
                case "employer":
                    eRole = ERole.ROLE_NLO;
                    break;
                case "student":
                    eRole = ERole.ROLE_STUDENT;
                    break;
                default:
                    continue;
            }
            
            Optional<Role> roleOpt = roleRepository.findByName(eRole);
            if (roleOpt.isPresent()) {
                user.getRoles().add(roleOpt.get());
            }
        }
        
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("User roles updated successfully"));
    }
    
    @GetMapping("/stats")
    public ResponseEntity<?> getSystemStats() {
        long userCount = userRepository.count();
        long jobCount = jobRepository.count();
        long applicationCount = jobApplicationRepository.count();
        
        return ResponseEntity.ok(
            java.util.Map.of(
                "totalUsers", userCount,
                "totalJobs", jobCount,
                "totalApplications", applicationCount
            )
        );
    }
    
    @GetMapping("/stats/detailed")
    public ResponseEntity<?> getDetailedStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // User statistics
        long totalUsers = userRepository.count();
        stats.put("totalUsers", totalUsers);
        
        // Role distribution
        Map<String, Long> userDistribution = new HashMap<>();
        
        Optional<Role> adminRoleOpt = roleRepository.findByName(ERole.ROLE_ADMIN);
        Optional<Role> nloRoleOpt = roleRepository.findByName(ERole.ROLE_NLO);
        Optional<Role> studentRoleOpt = roleRepository.findByName(ERole.ROLE_STUDENT);
        
        // Count users by iterating through all users and checking roles
        // Not efficient for large datasets, but works for this demo
        long adminCount = 0;
        long nloCount = 0;
        long studentCount = 0;
        
        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            Set<Role> userRoles = user.getRoles();
            
            if (adminRoleOpt.isPresent() && userRoles.contains(adminRoleOpt.get())) {
                adminCount++;
            }
            
            if (nloRoleOpt.isPresent() && userRoles.contains(nloRoleOpt.get())) {
                nloCount++;
            }
            
            if (studentRoleOpt.isPresent() && userRoles.contains(studentRoleOpt.get())) {
                studentCount++;
            }
        }
        
        userDistribution.put("admin", adminCount);
        userDistribution.put("employer", nloCount);
        userDistribution.put("student", studentCount);
        stats.put("userDistribution", userDistribution);
        
        // Job statistics
        long totalJobs = jobRepository.count();
        stats.put("totalJobs", totalJobs);
        
        // Application statistics
        long totalApplications = jobApplicationRepository.count();
        stats.put("totalApplications", totalApplications);
        
        // Return all statistics
        return ResponseEntity.ok(stats);
    }
    
    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable UUID id) {
        Optional<User> userOpt = userService.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        
        String status = user.isEnabled() ? "enabled" : "disabled";
        return ResponseEntity.ok(new MessageResponse("User " + status + " successfully"));
    }
    
    // Jobs Management
    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable UUID id) {
        if (!jobRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        jobRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Job deleted successfully"));
    }
    
    // Job Applications Management
    @GetMapping("/applications")
    public ResponseEntity<?> getAllApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<JobApplication> applicationsPage = jobApplicationRepository.findAll(pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("applications", applicationsPage.getContent());
        response.put("currentPage", applicationsPage.getNumber());
        response.put("totalItems", applicationsPage.getTotalElements());
        response.put("totalPages", applicationsPage.getTotalPages());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/applications/{id}")
    public ResponseEntity<?> getApplicationById(@PathVariable UUID id) {
        Optional<JobApplication> applicationOpt = jobApplicationRepository.findById(id);
        if (applicationOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(applicationOpt.get());
    }
    
    @DeleteMapping("/applications/{id}")
    public ResponseEntity<?> deleteApplication(@PathVariable UUID id) {
        if (!jobApplicationRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        jobApplicationRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Job application deleted successfully"));
    }

    @GetMapping("/users/search")
    public ResponseEntity<?> searchUsers(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        List<User> users;
        
        // Simple implementation - in a real application, you would use 
        // more sophisticated search with a custom repository method
        if (query != null && !query.isEmpty()) {
            // Search by username or email containing the query (case insensitive)
            users = userRepository.findAll().stream()
                    .filter(user -> 
                        user.getUsername().toLowerCase().contains(query.toLowerCase()) ||
                        user.getEmail().toLowerCase().contains(query.toLowerCase()))
                    .skip(pageable.getOffset())
                    .limit(pageable.getPageSize())
                    .collect(java.util.stream.Collectors.toList());
            
            long totalCount = userRepository.findAll().stream()
                    .filter(user -> 
                        user.getUsername().toLowerCase().contains(query.toLowerCase()) ||
                        user.getEmail().toLowerCase().contains(query.toLowerCase()))
                    .count();
                    
            Map<String, Object> response = new HashMap<>();
            response.put("users", users);
            response.put("currentPage", page);
            response.put("totalItems", totalCount);
            response.put("totalPages", (int) Math.ceil((double) totalCount / size));
            
            return ResponseEntity.ok(response);
        } else {
            // No query, return paginated list of all users
            Page<User> usersPage = userRepository.findAll(pageable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("users", usersPage.getContent());
            response.put("currentPage", usersPage.getNumber());
            response.put("totalItems", usersPage.getTotalElements());
            response.put("totalPages", usersPage.getTotalPages());
            
            return ResponseEntity.ok(response);
        }
    }

    // ==============================================
    // Admin Job Management Endpoints
    // ==============================================

    /**
     * Get all jobs with admin metadata (paginated)
     */
    @GetMapping("/jobs")
    public ResponseEntity<?> getAllJobsWithAdminData(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "postedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<Job> jobsPage = adminJobService.getAllJobsWithAdminMetadata(pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("jobs", jobsPage.getContent());
        response.put("currentPage", jobsPage.getNumber());
        response.put("totalItems", jobsPage.getTotalElements());
        response.put("totalPages", jobsPage.getTotalPages());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Search jobs with admin filters
     */
    @PostMapping("/jobs/search")
    public ResponseEntity<?> searchJobsWithFilters(
            @RequestBody AdminJobSearchDto searchDto,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Job> jobsPage = adminJobService.searchJobsWithAdminFilters(searchDto, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("jobs", jobsPage.getContent());
        response.put("currentPage", jobsPage.getNumber());
        response.put("totalItems", jobsPage.getTotalElements());
        response.put("totalPages", jobsPage.getTotalPages());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get job with admin details
     */
    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<?> getJobWithAdminDetails(@PathVariable UUID jobId) {
        try {
            Job job = adminJobService.getJobWithAdminDetails(jobId);
            AdminJobMetadata metadata = adminJobService.getOrCreateJobMetadata(jobId, getCurrentAdminId());
            JobPerformanceMetrics metrics = adminJobService.getJobPerformanceMetrics(jobId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("job", job);
            response.put("metadata", metadata);
            response.put("metrics", metrics);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Create job as admin
     */
    @PostMapping("/jobs")
    public ResponseEntity<?> createJobAsAdmin(@RequestBody Map<String, Object> jobData) {
        try {
            UUID employerId = UUID.fromString((String) jobData.get("employerId"));
            UUID adminId = getCurrentAdminId();
            
            Job job = adminJobService.createJobAsAdmin(jobData, employerId, adminId);
            return ResponseEntity.ok(job);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Update job as admin
     */
    @PutMapping("/jobs/{jobId}")
    public ResponseEntity<?> updateJobAsAdmin(@PathVariable UUID jobId, @RequestBody Map<String, Object> jobData) {
        try {
            UUID adminId = getCurrentAdminId();
            Job job = adminJobService.updateJobAsAdmin(jobId, jobData, adminId);
            return ResponseEntity.ok(job);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Delete job as admin
     */
    @DeleteMapping("/jobs/{jobId}")
    public ResponseEntity<?> deleteJobAsAdmin(@PathVariable UUID jobId) {
        try {
            UUID adminId = getCurrentAdminId();
            boolean deleted = adminJobService.deleteJobAsAdmin(jobId, adminId);
            if (deleted) {
                return ResponseEntity.ok(new MessageResponse("Job deleted successfully"));
            } else {
                return ResponseEntity.badRequest().body(new MessageResponse("Failed to delete job"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Bulk operations on jobs
     */
    @PostMapping("/jobs/bulk/{operation}")
    public ResponseEntity<?> performBulkOperation(
            @PathVariable String operation,
            @RequestBody Map<String, Object> operationData) {
        try {
            UUID adminId = getCurrentAdminId();
            @SuppressWarnings("unchecked")
            List<String> jobIdStrings = (List<String>) operationData.get("jobIds");
            List<UUID> jobIds = jobIdStrings.stream().map(UUID::fromString).toList();
            
            BulkOperationResult result;
            
            switch (operation.toLowerCase()) {
                case "delete":
                    result = adminJobService.bulkDeleteJobs(jobIds, adminId);
                    break;
                case "activate":
                    result = adminJobService.bulkUpdateJobStatus(jobIds, true, adminId);
                    break;
                case "deactivate":
                    result = adminJobService.bulkUpdateJobStatus(jobIds, false, adminId);
                    break;
                case "feature":
                    LocalDateTime featuredUntil = operationData.containsKey("featuredUntil") ? 
                        LocalDateTime.parse((String) operationData.get("featuredUntil")) : null;
                    result = adminJobService.bulkSetFeatured(jobIds, true, featuredUntil, adminId);
                    break;
                case "unfeature":
                    result = adminJobService.bulkSetFeatured(jobIds, false, null, adminId);
                    break;
                case "priority":
                    Integer priority = (Integer) operationData.get("priority");
                    result = adminJobService.bulkUpdatePriority(jobIds, priority, adminId);
                    break;
                default:
                    return ResponseEntity.badRequest().body(new MessageResponse("Invalid operation: " + operation));
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Moderate job
     */
    @PostMapping("/jobs/{jobId}/moderate")
    public ResponseEntity<?> moderateJob(
            @PathVariable UUID jobId,
            @RequestBody Map<String, Object> moderationData) {
        try {
            UUID adminId = getCurrentAdminId();
            String actionStr = (String) moderationData.get("action");
            String notes = (String) moderationData.get("notes");
            
            JobModeration.ModerationAction action = JobModeration.ModerationAction.valueOf(actionStr.toUpperCase());
            JobModeration moderation = adminJobService.moderateJob(jobId, action, notes, adminId);
            
            return ResponseEntity.ok(moderation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Get job moderation history
     */
    @GetMapping("/jobs/{jobId}/moderation-history")
    public ResponseEntity<?> getModerationHistory(@PathVariable UUID jobId) {
        try {
            List<JobModeration> history = adminJobService.getModerationHistory(jobId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Get pending moderation jobs
     */
    @GetMapping("/jobs/pending-moderation")
    public ResponseEntity<?> getPendingModerationJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<JobModeration> moderationsPage = adminJobService.getPendingModerationJobs(pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("moderations", moderationsPage.getContent());
        response.put("currentPage", moderationsPage.getNumber());
        response.put("totalItems", moderationsPage.getTotalElements());
        response.put("totalPages", moderationsPage.getTotalPages());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get job statistics
     */
    @GetMapping("/statistics/jobs")
    public ResponseEntity<?> getJobStatistics(@RequestParam(defaultValue = "monthly") String period) {
        try {
            AdminJobStatisticsDto stats = adminJobService.getSystemJobStatistics(period);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Get employer job statistics
     */
    @GetMapping("/statistics/employers/{employerId}/jobs")
    public ResponseEntity<?> getEmployerJobStatistics(
            @PathVariable UUID employerId,
            @RequestParam(defaultValue = "monthly") String period) {
        try {
            AdminJobStatisticsDto stats = adminJobService.getEmployerJobStatistics(employerId, period);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Get job categories
     */
    @GetMapping("/job-categories")
    public ResponseEntity<?> getJobCategories() {
        try {
            List<JobCategory> categories = adminJobService.getAllJobCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Create job category
     */
    @PostMapping("/job-categories")
    public ResponseEntity<?> createJobCategory(@RequestBody Map<String, Object> categoryData) {
        try {
            UUID adminId = getCurrentAdminId();
            String name = (String) categoryData.get("name");
            String description = (String) categoryData.get("description");
            UUID parentCategoryId = categoryData.containsKey("parentCategoryId") ? 
                UUID.fromString((String) categoryData.get("parentCategoryId")) : null;
            
            JobCategory category = adminJobService.createJobCategory(name, description, parentCategoryId, adminId);
            return ResponseEntity.ok(category);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Get system health metrics
     */
    @GetMapping("/system/health")
    public ResponseEntity<?> getSystemHealthMetrics() {
        try {
            Map<String, Object> metrics = adminJobService.getSystemHealthMetrics();
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Get job filters for admin interface
     */
    @GetMapping("/jobs/filters")
    public ResponseEntity<?> getJobFilters() {
        try {
            AdminJobFilterDto filters = adminJobService.getJobFilters();
            return ResponseEntity.ok(filters);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Get all employers for dropdown/form selection
     */
    @GetMapping("/employers")
    public ResponseEntity<?> getAllEmployers() {
        try {
            List<com.melardev.spring.jwtoauth.entities.EmployerProfile> employers = employerProfileRepository.findAll();
            
            // Map to simpler DTO for frontend
            List<Map<String, Object>> employerList = employers.stream()
                    .map(emp -> {
                        Map<String, Object> employerData = new HashMap<>();
                        employerData.put("id", emp.getId().toString());
                        employerData.put("name", emp.getCompanyName());
                        return employerData;
                    })
                    .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(employerList);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // ==============================================
    // Helper Methods
    // ==============================================

    /**
     * Get current admin user ID from security context
     * In a real implementation, this would extract from JWT/Security context
     */
    private UUID getCurrentAdminId() {
        // Placeholder implementation - in production this would extract from SecurityContext
        // For now, returning a default admin ID for testing
        return UUID.randomUUID(); // This should be replaced with actual security context extraction
    }
} 