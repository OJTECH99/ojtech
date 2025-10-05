package com.melardev.spring.jwtoauth.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.melardev.spring.jwtoauth.dtos.responses.JwtResponse;
import com.melardev.spring.jwtoauth.dtos.responses.MessageResponse;
import com.melardev.spring.jwtoauth.entities.*;
import com.melardev.spring.jwtoauth.repositories.AdminProfileRepository;
import com.melardev.spring.jwtoauth.repositories.RoleRepository;
import com.melardev.spring.jwtoauth.repositories.UserRepository;
import com.melardev.spring.jwtoauth.security.jwt.JwtUtils;
import com.melardev.spring.jwtoauth.security.services.UserDetailsImpl;
import com.melardev.spring.jwtoauth.service.EmailService;
import com.melardev.spring.jwtoauth.service.interfaces.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private AdminProfileRepository adminProfileRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private EmailService emailService;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${app.base-url}")
    private String baseURL;

    @Override
    public JwtResponse authenticateUser(Object loginRequest) {
        try {
            String username = extractFieldFromRequest(loginRequest, "username");
            String password = extractFieldFromRequest(loginRequest, "password");

            if (username == null || password == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username and password are required");
            }

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());

            Optional<User> userOptional = userRepository.findById(userDetails.getId());
            if (userOptional.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
            }

            User user = userOptional.get();

            return new JwtResponse(jwt,
                    userDetails.getId(),
                    userDetails.getUsername(),
                    userDetails.getEmail(),
                    roles,
                    user.isEmailVerified());

        } catch (Exception e) {
            logger.error("Authentication failed", e);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
    }

    @Override
    public JwtResponse authenticateGoogleUser(String token) {
        try {
            // Verify Google token
            String googleApiUrl = "https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=" + token;
            Map<String, Object> googleResponse = restTemplate.getForObject(googleApiUrl, Map.class);

            if (googleResponse == null || !googleClientId.equals(googleResponse.get("aud"))) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google token");
            }

            String email = (String) googleResponse.get("email");
            String name = (String) googleResponse.get("name");

            // Find or create user
            Optional<User> existingUser = userRepository.findByEmail(email);
            User user;

            if (existingUser.isPresent()) {
                user = existingUser.get();
            } else {
                // Create new user with Google OAuth
                Set<Role> roles = new HashSet<>();
                Role studentRole = roleRepository.findByName(ERole.ROLE_STUDENT)
                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                roles.add(studentRole);

                user = new User(email, email, encoder.encode(UUID.randomUUID().toString()));
                user.setRoles(roles);
                user.setEmailVerified(true); // Google emails are pre-verified
                user = userRepository.save(user);
            }

            // Create authentication and JWT
            UserDetailsImpl userPrincipal = UserDetailsImpl.build(user);
            Authentication auth = new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(auth);

            String jwt = jwtUtils.generateJwtToken(auth);

            List<String> roleNames = user.getRoles().stream()
                    .map(role -> role.getName().name())
                    .collect(Collectors.toList());

            return new JwtResponse(jwt, user.getId(), user.getUsername(), user.getEmail(), roleNames, user.isEmailVerified());

        } catch (Exception e) {
            logger.error("Google authentication failed", e);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google authentication failed");
        }
    }

    @Override
    public boolean validateCredentials(String username, String password) {
        try {
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return false;
            }
            return encoder.matches(password, userOpt.get().getPassword());
        } catch (Exception e) {
            logger.error("Credential validation failed", e);
            return false;
        }
    }

    @Override
    public MessageResponse registerUser(Object signupRequest) {
        try {
            String username = extractFieldFromRequest(signupRequest, "username");
            String email = extractFieldFromRequest(signupRequest, "email");
            String password = extractFieldFromRequest(signupRequest, "password");
            Object rolesObject = extractFieldFromRequestAsObject(signupRequest, "role");

            if (username == null || email == null || password == null) {
                return new MessageResponse("Error: Username, email, and password are required!");
            }

            if (userRepository.existsByUsername(username)) {
                return new MessageResponse("Error: Username is already taken!");
            }

            if (userRepository.existsByEmail(email)) {
                return new MessageResponse("Error: Email is already in use!");
            }

            Set<ERole> roles = parseRoles(rolesObject);
            User user = createUserWithRoles(username, email, password, roles);

            // Send verification email
            try {
                emailService.sendVerificationEmail(user.getEmail(), user.getId().toString());
                logger.info("Verification email sent to {}", email);
            } catch (Exception e) {
                logger.warn("Failed to send verification email to {}: {}", email, e.getMessage());
            }

            return new MessageResponse("User registered successfully! Please check your email to verify your account.");

        } catch (Exception e) {
            logger.error("User registration failed", e);
            return new MessageResponse("Error: Registration failed - " + e.getMessage());
        }
    }

    @Override
    public User createUserWithRoles(String username, String email, String password, Set<ERole> roles) {
        User user = new User(username, email, encoder.encode(password));

        Set<Role> userRoles = new HashSet<>();

        if (roles == null || roles.isEmpty()) {
            Role studentRole = roleRepository.findByName(ERole.ROLE_STUDENT)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            userRoles.add(studentRole);
        } else {
            for (ERole roleName : roles) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("Error: Role " + roleName + " is not found."));
                userRoles.add(role);
            }
        }

        user.setRoles(userRoles);
        return userRepository.save(user);
    }

    @Override
    public boolean isUsernameAvailable(String username) {
        return !userRepository.existsByUsername(username);
    }

    @Override
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }

    @Override
    public MessageResponse sendVerificationEmail(UUID userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return new MessageResponse("Error: User not found");
            }

            User user = userOpt.get();
            if (user.isEmailVerified()) {
                return new MessageResponse("Email is already verified");
            }

            emailService.sendVerificationEmail(user.getEmail(), userId.toString());
            return new MessageResponse("Verification email sent successfully");

        } catch (Exception e) {
            logger.error("Failed to send verification email", e);
            return new MessageResponse("Error: Failed to send verification email");
        }
    }

    @Override
    public MessageResponse verifyEmail(UUID userId) {
        try {
            Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isEmpty()) {
                return new MessageResponse("Error: User not found");
            }

            User user = userOptional.get();
            if (user.isEmailVerified()) {
                return new MessageResponse("Email is already verified");
            }

            user.setEmailVerified(true);
            userRepository.save(user);

            return new MessageResponse("Email verified successfully! You can now log in.");

        } catch (Exception e) {
            logger.error("Email verification failed", e);
            return new MessageResponse("Error: Email verification failed");
        }
    }

    @Override
    public boolean isEmailVerified(UUID userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        return userOptional.map(User::isEmailVerified).orElse(false);
    }

    @Override
    public MessageResponse createAdminUser(String username, String email, String password, Set<ERole> roles) {
        try {
            if (userRepository.existsByUsername(username)) {
                return new MessageResponse("Error: Username is already taken!");
            }

            if (userRepository.existsByEmail(email)) {
                return new MessageResponse("Error: Email is already in use!");
            }

            User user = createUserWithRoles(username, email, password, roles);
            user.setEmailVerified(true); // Admin users don't need email verification

            // Create admin profile if user has admin role
            if (roles.contains(ERole.ROLE_ADMIN)) {
                AdminProfile adminProfile = new AdminProfile();
                adminProfile.setUser(user);
                adminProfile.setFullName("Admin User");
                adminProfileRepository.save(adminProfile);
            }

            return new MessageResponse("Admin user created successfully!");

        } catch (Exception e) {
            logger.error("Admin user creation failed", e);
            return new MessageResponse("Error: Failed to create admin user - " + e.getMessage());
        }
    }

    @Override
    public String extractFieldFromRequest(Object request, String fieldName) {
        try {
            Map<String, Object> requestMap = objectMapper.convertValue(request, Map.class);
            Object value = requestMap.get(fieldName);
            return value != null ? value.toString() : null;
        } catch (Exception e) {
            logger.warn("Failed to extract field {} from request", fieldName, e);
            return null;
        }
    }

    private Object extractFieldFromRequestAsObject(Object request, String fieldName) {
        try {
            Map<String, Object> requestMap = objectMapper.convertValue(request, Map.class);
            return requestMap.get(fieldName);
        } catch (Exception e) {
            logger.warn("Failed to extract field {} from request", fieldName, e);
            return null;
        }
    }

    @Override
    public Set<ERole> parseRoles(Object rolesObject) {
        Set<ERole> roles = new HashSet<>();

        if (rolesObject == null) {
            return roles;
        }

        try {
            if (rolesObject instanceof String) {
                String roleStr = (String) rolesObject;
                try {
                    roles.add(ERole.valueOf("ROLE_" + roleStr.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    logger.warn("Invalid role: {}", roleStr);
                }
            } else if (rolesObject instanceof List) {
                List<?> rolesList = (List<?>) rolesObject;
                for (Object roleObj : rolesList) {
                    if (roleObj instanceof String) {
                        String roleStr = (String) roleObj;
                        try {
                            roles.add(ERole.valueOf("ROLE_" + roleStr.toUpperCase()));
                        } catch (IllegalArgumentException e) {
                            logger.warn("Invalid role: {}", roleStr);
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.warn("Failed to parse roles", e);
        }

        return roles;
    }

    @Override
    public JwtResponse buildJwtResponse(User user) {
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        String jwt = jwtUtils.generateJwtToken(auth);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return new JwtResponse(jwt, user.getId(), user.getUsername(), user.getEmail(), roles, user.isEmailVerified());
    }
} 