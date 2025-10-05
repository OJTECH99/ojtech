package com.melardev.spring.jwtoauth.service.interfaces;

import com.melardev.spring.jwtoauth.dtos.requests.LoginDto;
import com.melardev.spring.jwtoauth.dtos.requests.SignupDto;
import com.melardev.spring.jwtoauth.dtos.responses.JwtResponse;
import com.melardev.spring.jwtoauth.dtos.responses.MessageResponse;
import com.melardev.spring.jwtoauth.entities.ERole;
import com.melardev.spring.jwtoauth.entities.User;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

public interface AuthService {
    
    // Authentication
    JwtResponse authenticateUser(Object loginRequest);
    JwtResponse authenticateGoogleUser(String token);
    boolean validateCredentials(String username, String password);
    
    // Registration
    MessageResponse registerUser(Object signupRequest);
    User createUserWithRoles(String username, String email, String password, Set<ERole> roles);
    boolean isUsernameAvailable(String username);
    boolean isEmailAvailable(String email);
    
    // Email Verification
    MessageResponse sendVerificationEmail(UUID userId);
    MessageResponse verifyEmail(UUID userId);
    boolean isEmailVerified(UUID userId);
    
    // Admin Operations
    MessageResponse createAdminUser(String username, String email, String password, Set<ERole> roles);
    
    // Utility Methods
    String extractFieldFromRequest(Object request, String fieldName);
    Set<ERole> parseRoles(Object rolesObject);
    JwtResponse buildJwtResponse(User user);
} 