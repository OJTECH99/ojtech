package com.melardev.spring.jwtoauth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.melardev.spring.jwtoauth.OJTechApiApplication;
import com.melardev.spring.jwtoauth.entities.StudentProfile;
import com.melardev.spring.jwtoauth.entities.User;
import com.melardev.spring.jwtoauth.entities.UserRole;
import com.melardev.spring.jwtoauth.repositories.StudentProfileRepository;
import com.melardev.spring.jwtoauth.repositories.UserRepository;
import com.melardev.spring.jwtoauth.security.services.UserDetailsImpl;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = OJTechApiApplication.class)
@AutoConfigureMockMvc
public class ProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private StudentProfileRepository studentProfileRepository;

    @Test
    @WithMockUser(username = "testuser", roles = {"STUDENT"})
    public void testGetCurrentUserProfile() throws Exception {
        // Setup
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setId(userId);
        user.setUsername("testuser");
        user.setEmail("test@example.com");

        StudentProfile profile = new StudentProfile();
        profile.setId(UUID.randomUUID());
        profile.setUser(user);
        profile.setFullName("Test User");
        profile.setRole(UserRole.STUDENT);

        UserDetailsImpl userDetails = new UserDetailsImpl(
                userId,
                "testuser",
                "test@example.com",
                "password",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_STUDENT"))
        );

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(studentProfileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));

        // Execute and Verify
        mockMvc.perform(get("/api/profiles/me")
                .with(SecurityMockMvcRequestPostProcessors.user(userDetails)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Test User"))
                .andExpect(jsonPath("$.role").value("STUDENT"));
    }

    @Test
    @WithMockUser(username = "testuser", roles = {"STUDENT"})
    public void testUpdateProfile() throws Exception {
        // Setup
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setId(userId);
        user.setUsername("testuser");
        user.setEmail("test@example.com");

        StudentProfile profile = new StudentProfile();
        profile.setId(UUID.randomUUID());
        profile.setUser(user);
        profile.setFullName("Test User");
        profile.setRole(UserRole.STUDENT);

        UserDetailsImpl userDetails = new UserDetailsImpl(
                userId,
                "testuser",
                "test@example.com",
                "password",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_STUDENT"))
        );

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(studentProfileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
        when(studentProfileRepository.save(any(StudentProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Create update data
        Map<String, Object> updateData = new HashMap<>();
        updateData.put("fullName", "Updated Name");
        updateData.put("bio", "This is my updated bio");

        // Execute and Verify
        mockMvc.perform(put("/api/profiles/me")
                .with(SecurityMockMvcRequestPostProcessors.user(userDetails))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Updated Name"))
                .andExpect(jsonPath("$.bio").value("This is my updated bio"));
    }
} 