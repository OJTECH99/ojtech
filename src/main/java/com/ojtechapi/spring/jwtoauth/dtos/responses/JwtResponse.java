package com.ojtechapi.spring.jwtoauth.dtos.responses;

import java.util.List;
import java.util.UUID;

public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private UUID id;
    private String username;
    private String email;
    private List<String> roles;
    private boolean hasCompletedOnboarding;
    private boolean requiresPasswordReset;

    public JwtResponse(String token, UUID id, String username, String email, List<String> roles) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
        this.hasCompletedOnboarding = false;
    }
    
    public JwtResponse(String token, UUID id, String username, String email, List<String> roles, boolean hasCompletedOnboarding) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
        this.hasCompletedOnboarding = hasCompletedOnboarding;
        this.requiresPasswordReset = false;
    }
    
    public JwtResponse(String token, UUID id, String username, String email, List<String> roles, boolean hasCompletedOnboarding, boolean requiresPasswordReset) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
        this.hasCompletedOnboarding = hasCompletedOnboarding;
        this.requiresPasswordReset = requiresPasswordReset;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
    
    // Alias for getToken() to support tests that expect "accessToken"
    public String getAccessToken() {
        return token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
    
    public boolean isHasCompletedOnboarding() {
        return hasCompletedOnboarding;
    }
    
    public void setHasCompletedOnboarding(boolean hasCompletedOnboarding) {
        this.hasCompletedOnboarding = hasCompletedOnboarding;
    }
    
    public boolean isRequiresPasswordReset() {
        return requiresPasswordReset;
    }
    
    public void setRequiresPasswordReset(boolean requiresPasswordReset) {
        this.requiresPasswordReset = requiresPasswordReset;
    }
} 
