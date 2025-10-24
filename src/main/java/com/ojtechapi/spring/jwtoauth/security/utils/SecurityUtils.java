package com.ojtechapi.spring.jwtoauth.security.utils;

import com.ojtechapi.spring.jwtoauth.entities.User;
import com.ojtechapi.spring.jwtoauth.security.services.UserDetailsImpl;
import com.ojtechapi.spring.jwtoauth.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

/**
 * Utility class for handling security-related operations.
 */
public class SecurityUtils {

    /**
     * Gets the current authenticated user's ID
     *
     * @return The ID of the authenticated user or null if not authenticated
     */
    public static UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            return userDetails.getId();
        }
        
        return null;
    }
    
    /**
     * Gets the user ID from the request (set by AuthTokenFilter)
     *
     * @param request The HTTP request
     * @return The user ID or null if not found
     */
    public static UUID getUserIdFromRequest(HttpServletRequest request) {
        Object userId = request.getAttribute("userId");
        if (userId instanceof UUID) {
            return (UUID) userId;
        } else if (userId instanceof String) {
            return UUID.fromString((String) userId);
        }
        return null;
    }
    
    /**
     * Gets the current authenticated user entity
     *
     * @param userService The user service to fetch the user from the database
     * @return Optional containing the user if found
     */
    public static Optional<User> getCurrentUser(UserService userService) {
        UUID userId = getCurrentUserId();
        if (userId != null) {
            return userService.findById(userId);
        }
        return Optional.empty();
    }
} 
