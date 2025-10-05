package com.melardev.spring.jwtoauth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.melardev.spring.jwtoauth.OJTechApiApplication;
import com.melardev.spring.jwtoauth.entities.CV;
import com.melardev.spring.jwtoauth.entities.StudentProfile;
import com.melardev.spring.jwtoauth.entities.User;
import com.melardev.spring.jwtoauth.entities.UserRole;
import com.melardev.spring.jwtoauth.repositories.CVRepository;
import com.melardev.spring.jwtoauth.repositories.StudentProfileRepository;
import com.melardev.spring.jwtoauth.repositories.UserRepository;
import com.melardev.spring.jwtoauth.security.services.UserDetailsImpl;
import com.melardev.spring.jwtoauth.service.CloudinaryService;
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

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = OJTechApiApplication.class)
@AutoConfigureMockMvc
public class StudentProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private StudentProfileRepository studentProfileRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private CVRepository cvRepository;

    @MockBean
    private CloudinaryService cloudinaryService;

    private UUID userId;
    private UUID profileId;
    private User user;
    private StudentProfile studentProfile;

    @BeforeEach
    public void setUp() {
        // Create test user
        userId = UUID.randomUUID();
        profileId = UUID.randomUUID();
        
        user = new User();
        user.setId(userId);
        user.setUsername("student");
        user.setEmail("student@example.com");
        
        // Create test profile
        studentProfile = new StudentProfile();
        studentProfile.setId(profileId);
        studentProfile.setUser(user);
        studentProfile.setRole(UserRole.STUDENT);
        studentProfile.setFirstName("Test");
        studentProfile.setLastName("Student");
        studentProfile.setUniversity("Test University");
        studentProfile.setMajor("Computer Science");
        
        // Setup authentication
        UserDetailsImpl userDetails = new UserDetailsImpl(
                userId,
                "student",
                "student@example.com",
                "password",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_STUDENT"))
        );
        
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // Setup repository mocks
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(studentProfileRepository.findByUserId(userId)).thenReturn(Optional.of(studentProfile));
    }

    @Test
    public void testGetCurrentStudentProfile() throws Exception {
        mockMvc.perform(get("/api/student-profiles/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Test"))
                .andExpect(jsonPath("$.lastName").value("Student"))
                .andExpect(jsonPath("$.university").value("Test University"))
                .andExpect(jsonPath("$.major").value("Computer Science"));
    }

    @Test
    public void testCreateStudentProfile() throws Exception {
        // Setup
        when(studentProfileRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(studentProfileRepository.save(any(StudentProfile.class))).thenAnswer(invocation -> {
            StudentProfile savedProfile = invocation.getArgument(0);
            savedProfile.setId(profileId);
            return savedProfile;
        });
        
        Map<String, Object> profileData = new HashMap<>();
        profileData.put("firstName", "New");
        profileData.put("lastName", "Student");
        profileData.put("university", "New University");
        profileData.put("major", "Data Science");
        
        // Execute and Verify
        mockMvc.perform(post("/api/student-profiles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(profileData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    public void testCreateStudentProfileWhenAlreadyExists() throws Exception {
        // Setup
        Map<String, Object> profileData = new HashMap<>();
        profileData.put("fullName", "New Student");
        
        // Execute and Verify
        mockMvc.perform(post("/api/student-profiles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(profileData)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Student profile already exists"));
    }

    @Test
    public void testUpdateStudentProfile() throws Exception {
        // Setup
        when(studentProfileRepository.save(any(StudentProfile.class))).thenReturn(studentProfile);
        
        Map<String, Object> profileData = new HashMap<>();
        profileData.put("firstName", "Updated");
        profileData.put("lastName", "Student");
        profileData.put("university", "Updated University");
        
        // Execute and Verify
        mockMvc.perform(put("/api/student-profiles/me")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(profileData)))
                .andExpect(status().isOk());
    }

    @Test
    public void testUploadCV() throws Exception {
        // Setup
        MockMultipartFile file = new MockMultipartFile(
                "file", 
                "test-cv.pdf", 
                "application/pdf", 
                "PDF content".getBytes()
        );
        
        Map<String, Object> cloudinaryResponse = new HashMap<>();
        cloudinaryResponse.put("url", "https://example.com/test-cv.pdf");
        
        when(cloudinaryService.upload(any(), eq("cvs"))).thenReturn(cloudinaryResponse);
        
        CV cv = new CV();
        cv.setId(UUID.randomUUID());
        cv.setStudent(studentProfile);
        cv.setParsedResume("{\"fileName\":\"test-cv.pdf\",\"fileUrl\":\"https://example.com/test-cv.pdf\",\"fileType\":\"application/pdf\"}");
        cv.setLastUpdated(LocalDateTime.now());
        
        when(cvRepository.save(any(CV.class))).thenReturn(cv);
        
        // Execute and Verify
        mockMvc.perform(multipart("/api/student-profiles/cv")
                .file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.parsedResume").exists());
    }

    @Test
    public void testGetStudentCVs() throws Exception {
        // Setup
        List<CV> cvList = new ArrayList<>();
        
        CV cv1 = new CV();
        cv1.setId(UUID.randomUUID());
        cv1.setStudent(studentProfile);
        cv1.setParsedResume("{\"fileName\":\"cv1.pdf\",\"fileUrl\":\"https://example.com/cv1.pdf\"}");
        cvList.add(cv1);
        
        CV cv2 = new CV();
        cv2.setId(UUID.randomUUID());
        cv2.setStudent(studentProfile);
        cv2.setParsedResume("{\"fileName\":\"cv2.pdf\",\"fileUrl\":\"https://example.com/cv2.pdf\"}");
        cvList.add(cv2);
        
        when(cvRepository.findByStudent(studentProfile)).thenReturn(cvList);
        
        // Execute and Verify
        mockMvc.perform(get("/api/student-profiles/cvs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].parsedResume").exists())
                .andExpect(jsonPath("$[1].parsedResume").exists());
    }

    @Test
    public void testSetActiveCV() throws Exception {
        // Setup
        UUID cvId = UUID.randomUUID();
        
        CV cv = new CV();
        cv.setId(cvId);
        cv.setStudent(studentProfile);
        cv.setParsedResume("{\"fileName\":\"active-cv.pdf\"}");
        
        List<CV> cvList = new ArrayList<>();
        cvList.add(cv);
        
        when(cvRepository.findById(cvId)).thenReturn(Optional.of(cv));
        when(cvRepository.findByStudent(studentProfile)).thenReturn(cvList);
        when(cvRepository.saveAll(any())).thenReturn(cvList);
        when(cvRepository.save(any(CV.class))).thenReturn(cv);
        
        // Execute and Verify
        mockMvc.perform(put("/api/student-profiles/cv/" + cvId + "/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Active CV updated successfully"));
    }

    @Test
    public void testSetActiveCVNotFound() throws Exception {
        // Setup
        UUID cvId = UUID.randomUUID();
        when(cvRepository.findById(cvId)).thenReturn(Optional.empty());
        
        // Execute and Verify
        mockMvc.perform(put("/api/student-profiles/cv/" + cvId + "/active"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("CV not found or does not belong to you"));
    }
} 