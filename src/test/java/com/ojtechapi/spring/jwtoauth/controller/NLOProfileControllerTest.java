package com.ojtechapi.spring.jwtoauth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ojtechapi.spring.ojtech.OJTechApiApplication;
import com.ojtechapi.spring.ojtech.entities.NLOProfile;
import com.ojtechapi.spring.ojtech.entities.User;
import com.ojtechapi.spring.ojtech.entities.UserRole;
import com.ojtechapi.spring.ojtech.repositories.NLOProfileRepository;
import com.ojtechapi.spring.ojtech.repositories.UserRepository;
import com.ojtechapi.spring.ojtech.security.services.UserDetailsImpl;
import com.ojtechapi.spring.ojtech.service.CloudinaryService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = OJTechApiApplication.class)
@AutoConfigureMockMvc
public class NLOProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private NLOProfileRepository nloProfileRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private CloudinaryService cloudinaryService;

    private UUID userId;
    private UUID profileId;
    private User user;
    private NLOProfile nloProfile;

    @BeforeEach
    public void setUp() {
        // Create test user
        userId = UUID.randomUUID();
        profileId = UUID.randomUUID();
        
        user = new User();
        user.setId(userId);
        user.setUsername("employer");
        user.setEmail("employer@example.com");
        
        // Create test profile
        nloProfile = new NLOProfile();
        nloProfile.setId(profileId);
        nloProfile.setUser(user);
        nloProfile.setRole(UserRole.NLO);
        nloProfile.setFullName("Test Employer");
        nloProfile.setCompanyName("Test Company");
        nloProfile.setIndustry("Technology");
        nloProfile.setCompanySize("51-200");
        
        // Setup authentication
        UserDetailsImpl userDetails = new UserDetailsImpl(
                userId,
                "employer",
                "employer@example.com",
                "password",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_NLO"))
        );
        
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // Setup repository mocks
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(nloProfileRepository.findByUserId(userId)).thenReturn(Optional.of(nloProfile));
    }

    @Test
    public void testGetCurrentNLOProfile() throws Exception {
        mockMvc.perform(get("/api/employer-profiles/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Test Employer"))
                .andExpect(jsonPath("$.companyName").value("Test Company"))
                .andExpect(jsonPath("$.industry").value("Technology"));
    }

    @Test
    public void testCreateNLOProfile() throws Exception {
        // Setup
        when(nloProfileRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(nloProfileRepository.save(any(NLOProfile.class))).thenAnswer(invocation -> {
            NLOProfile savedProfile = invocation.getArgument(0);
            savedProfile.setId(profileId);
            return savedProfile;
        });
        
        Map<String, Object> profileData = new HashMap<>();
        profileData.put("fullName", "New Employer");
        profileData.put("companyName", "New Company");
        profileData.put("industry", "Healthcare");
        profileData.put("companySize", "1-10");
        
        // Execute and Verify
        mockMvc.perform(post("/api/employer-profiles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(profileData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    public void testCreateNLOProfileWhenAlreadyExists() throws Exception {
        // Setup
        Map<String, Object> profileData = new HashMap<>();
        profileData.put("fullName", "New Employer");
        
        // Execute and Verify
        mockMvc.perform(post("/api/employer-profiles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(profileData)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Employer profile already exists"));
    }

    @Test
    public void testUpdateNLOProfile() throws Exception {
        // Setup
        when(nloProfileRepository.save(any(NLOProfile.class))).thenReturn(nloProfile);
        
        Map<String, Object> profileData = new HashMap<>();
        profileData.put("fullName", "Updated Employer");
        profileData.put("companyName", "Updated Company");
        profileData.put("companyDescription", "A great company");
        
        // Execute and Verify
        mockMvc.perform(put("/api/employer-profiles/me")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(profileData)))
                .andExpect(status().isOk());
    }

    @Test
    public void testUploadLogo() throws Exception {
        // Setup
        MockMultipartFile file = new MockMultipartFile(
                "file", 
                "company-logo.png", 
                "image/png", 
                "Logo content".getBytes()
        );
        
        Map<String, Object> cloudinaryResponse = new HashMap<>();
        cloudinaryResponse.put("url", "https://example.com/company-logo.png");
        
        when(cloudinaryService.upload(any(), eq("logos"))).thenReturn(cloudinaryResponse);
        when(nloProfileRepository.save(any(NLOProfile.class))).thenReturn(nloProfile);
        
        // Execute and Verify
        mockMvc.perform(multipart("/api/employer-profiles/logo")
                .file(file))
                .andExpect(status().isOk());
    }

    @Test
    public void testProfileNotFound() throws Exception {
        // Setup
        when(nloProfileRepository.findByUserId(userId)).thenReturn(Optional.empty());
        
        // Execute and Verify
        mockMvc.perform(get("/api/employer-profiles/me"))
                .andExpect(status().isNotFound());
    }
}
