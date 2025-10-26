package com.ojtechapi.spring.jwtoauth.dtos.responses;

import java.time.LocalDateTime;
import java.util.UUID;

public class RecentActivityDto {
    private UUID userId;
    private String username;
    private String email;
    private String role;
    private String activityType;
    private LocalDateTime timestamp;
    
    public RecentActivityDto() {
    }
    
    public RecentActivityDto(UUID userId, String username, String email, String role, String activityType, LocalDateTime timestamp) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
        this.activityType = activityType;
        this.timestamp = timestamp;
    }
    
    public UUID getUserId() {
        return userId;
    }
    
    public void setUserId(UUID userId) {
        this.userId = userId;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public String getActivityType() {
        return activityType;
    }
    
    public void setActivityType(String activityType) {
        this.activityType = activityType;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
