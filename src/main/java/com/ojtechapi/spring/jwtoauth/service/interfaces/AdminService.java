package com.ojtechapi.spring.jwtoauth.service.interfaces;

import com.ojtechapi.spring.jwtoauth.entities.ERole;
import com.ojtechapi.spring.jwtoauth.entities.Job;
import com.ojtechapi.spring.jwtoauth.entities.JobApplication;
import com.ojtechapi.spring.jwtoauth.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

public interface AdminService {
    
    // User Management
    List<User> getAllUsers();
    Page<User> getUsersPaginated(Pageable pageable);
    User getUserById(UUID userId);
    User createUser(Map<String, Object> userData);
    User updateUser(UUID userId, Map<String, Object> userData);
    boolean deleteUser(UUID userId);
    User updateUserRoles(UUID userId, Set<ERole> roles);
    User toggleUserStatus(UUID userId);
    
    // Search & Filtering
    List<User> searchUsers(String query);
    List<User> getUsersByRole(ERole role);
    
    // Statistics & Monitoring
    Map<String, Object> getSystemStats();
    Map<String, Object> getDetailedStats();
    
    // Job Management (Admin)
    List<Job> getAllJobs();
    boolean deleteJob(UUID jobId);
    
    // Application Management (Admin)
    List<JobApplication> getAllApplications();
    JobApplication getApplicationById(UUID applicationId);
    boolean deleteApplication(UUID applicationId);
    
    // Validation & Business Logic
    boolean canModifyUser(UUID userId);
    boolean canDeleteUser(UUID userId);
    Map<String, Object> calculateUserStatistics();
} 
