package com.melardev.spring.jwtoauth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.melardev.spring.jwtoauth.OJTechApiApplication;
import com.melardev.spring.jwtoauth.dtos.requests.LoginDto;
import com.melardev.spring.jwtoauth.dtos.requests.SignupDto;
import com.melardev.spring.jwtoauth.entities.ERole;
import com.melardev.spring.jwtoauth.entities.Role;
import com.melardev.spring.jwtoauth.repositories.RoleRepository;
import com.melardev.spring.jwtoauth.repositories.UserRepository;
import com.melardev.spring.jwtoauth.security.jwt.JwtUtils;
import com.melardev.spring.jwtoauth.security.services.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = OJTechApiApplication.class)
@AutoConfigureMockMvc
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private RoleRepository roleRepository;

    @BeforeEach
    public void setUp() {
        // Setup mock behavior for role repository
        Role studentRole = new Role();
        studentRole.setName(ERole.ROLE_STUDENT);
        when(roleRepository.findByName(ERole.ROLE_STUDENT)).thenReturn(Optional.of(studentRole));
    }

    @Test
    public void testAuthenticateUser() throws Exception {
        // Setup
        LoginDto loginDto = new LoginDto();
        loginDto.setEmail("testuser@example.com");
        loginDto.setPassword("password");

        UserDetailsImpl userDetails = new UserDetailsImpl(
                UUID.randomUUID(),
                "testuser",
                "testuser@example.com",
                "password",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_STUDENT"))
        );

        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("test-jwt-token");

        // Execute and Verify
        mockMvc.perform(post("/api/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("testuser@example.com"))
                .andExpect(jsonPath("$.roles[0]").value("ROLE_STUDENT"));
    }

    @Test
    public void testRegisterUser() throws Exception {
        // Setup
        SignupDto signupDto = new SignupDto();
        signupDto.setUsername("newuser");
        signupDto.setEmail("newuser@example.com");
        signupDto.setPassword("password");
        signupDto.setRoles(new HashSet<>(Collections.singletonList("student")));

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);

        // Execute and Verify
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User registered successfully!"));
    }

    @Test
    public void testRegisterUserWithExistingUsername() throws Exception {
        // Setup
        SignupDto signupDto = new SignupDto();
        signupDto.setUsername("existinguser");
        signupDto.setEmail("newuser@example.com");
        signupDto.setPassword("password");

        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        // Execute and Verify
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Error: Username is already taken!"));
    }
} 