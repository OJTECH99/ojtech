package com.melardev.spring.jwtoauth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.melardev.spring.jwtoauth.dtos.responses.JwtResponse;
import com.melardev.spring.jwtoauth.entities.Role;
import com.melardev.spring.jwtoauth.entities.ERole;
import com.melardev.spring.jwtoauth.entities.User;
import com.melardev.spring.jwtoauth.repositories.RoleRepository;
import com.melardev.spring.jwtoauth.repositories.UserRepository;
import com.melardev.spring.jwtoauth.security.jwt.JwtUtils;
import com.melardev.spring.jwtoauth.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth/oauth2")
public class OAuth2Controller {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2Controller.class);
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/google")
    public ResponseEntity<?> handleGoogleToken(@RequestBody Map<String, String> payload) {
        String tokenId = payload.get("tokenId");
        
        if (tokenId == null || tokenId.isEmpty()) {
            return ResponseEntity.badRequest().body("Google token is required");
        }
        
        try {
            // Decode the token's payload (2nd part of JWT)
            String[] chunks = tokenId.split("\\.");
            if (chunks.length < 2) {
                return ResponseEntity.badRequest().body("Invalid token format");
            }
            
            Base64.Decoder decoder = Base64.getUrlDecoder();
            String payloadJson = new String(decoder.decode(chunks[1]));
            
            // Parse the payload
            Map<String, Object> tokenData = new ObjectMapper().readValue(payloadJson, Map.class);
            
            String email = (String) tokenData.get("email");
            String name = (String) tokenData.getOrDefault("name", "");
            String sub = (String) tokenData.get("sub"); // Google user ID
            
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body("Email not found in token");
            }
            
            // Check if user exists in our database
            Optional<User> userOptional = userRepository.findByEmail(email);
            User user;
            
            if (userOptional.isPresent()) {
                // User exists, update if needed
                user = userOptional.get();
                logger.info("Existing user found: {}", user.getUsername());
                
                // Update provider info if not already set
                if (user.getProvider() == null || user.getProvider().isEmpty()) {
                    user.setProvider("google");
                    user.setProviderId(sub);
                    userRepository.save(user);
                }
            } else {
                // Create new user
                String username = email.split("@")[0];
                
                // Check if username exists and modify it if necessary
                int counter = 1;
                String baseUsername = username;
                while (userRepository.existsByUsername(username)) {
                    username = baseUsername + counter++;
                }
                
                user = new User();
                user.setUsername(username);
                user.setEmail(email);
                user.setPassword(encoder.encode(UUID.randomUUID().toString())); // Random password
                user.setProvider("google");
                user.setProviderId(sub);
                user.setEnabled(true);
                user.setEmailVerified(true);
                
                // Assign STUDENT role by default
                Set<Role> roles = new HashSet<>();
                Role userRole = roleRepository.findByName(ERole.ROLE_STUDENT)
                        .orElseThrow(() -> new RuntimeException("Error: Student Role not found."));
                roles.add(userRole);
                user.setRoles(roles);
                
                user = userRepository.save(user);
                logger.info("New user created from Google login: {}", username);
            }
            
            // Create UserDetails and generate JWT directly
            UserDetailsImpl userDetails = UserDetailsImpl.build(user);
            String jwt = jwtUtils.generateTokenFromUsername(userDetails.getUsername(), user.getId());
            
            List<String> roles = user.getRoles().stream()
                    .map(role -> role.getName().name())
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(new JwtResponse(jwt,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    roles));
            
        } catch (Exception e) {
            logger.error("Error processing Google token", e);
            return ResponseEntity.badRequest().body("Error processing Google token: " + e.getMessage());
        }
    }
} 