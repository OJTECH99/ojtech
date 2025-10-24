package com.ojtechapi.spring.jwtoauth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ojtechapi.spring.ojtech.OJTechApiApplication;
import com.ojtechapi.spring.ojtech.entities.*;
import com.ojtechapi.spring.ojtech.repositories.CVRepository;
import com.ojtechapi.spring.ojtech.repositories.JobApplicationRepository;
import com.ojtechapi.spring.ojtech.repositories.JobRepository;
import com.ojtechapi.spring.ojtech.repositories.StudentProfileRepository;
import com.ojtechapi.spring.ojtech.repositories.UserRepository;
import com.ojtechapi.spring.ojtech.security.services.UserDetailsImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = OJTechApiApplication.class)
@AutoConfigureMockMvc
public class JobApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;
    
    @MockBean
    private StudentProfileRepository studentProfileRepository;
    
    @MockBean
    private CVRepository cvRepository;
    
    @MockBean
    private JobRepository jobRepository;
    
    @MockBean
    private JobApplicationRepository jobApplicationRepository;
    
    @MockBean
    private UserRepository userRepository;

    private UUID employerId;
    private UUID studentId;
    private UUID jobId;
    private UUID cvId;
    private User employerUser;
    private User studentUser;
    private StudentProfile studentProfile;
    private NLOProfile NLOProfile;
    private Job job;
    private CV cv;

    @BeforeEach
    void setUp() {
        // Set up user IDs
        employerId = UUID.randomUUID();
        studentId = UUID.randomUUID();
        jobId = UUID.randomUUID();
        cvId = UUID.randomUUID();
        
        // Set up mock users
        employerUser = new User();
        employerUser.setId(employerId);
        employerUser.setUsername("employer_test");
        employerUser.setEmail("employer@test.com");
        
        studentUser = new User();
        studentUser.setId(studentId);
        studentUser.setUsername("student_test");
        studentUser.setEmail("student@test.com");
        
        // Set up employer profile
        NLOProfile = new NLOProfile();
        NLOProfile.setId(UUID.randomUUID());
        NLOProfile.setUser(employerUser);
        NLOProfile.setCompanyName("Test Company");
        
        // Set up student profile
        studentProfile = new StudentProfile();
        studentProfile.setId(UUID.randomUUID());
        studentProfile.setUser(studentUser);
        studentProfile.setFirstName("Test");
        studentProfile.setLastName("Student");
        
        // Set up job
        job = new Job();
        job.setId(jobId);
        job.setTitle("Software Engineer");
        job.setDescription("Test job description");
        job.setEmployer(NLOProfile);
        
        // Set up CV
        cv = new CV();
        cv.setId(cvId);
        cv.setStudent(studentProfile);
        cv.setParsedResume("{\"fileName\":\"test_cv.pdf\",\"fileUrl\":\"https://example.com/test_cv.pdf\"}");
        
        // Set up repository mocks
        when(userRepository.findById(employerId)).thenReturn(Optional.of(employerUser));
        when(userRepository.findById(studentId)).thenReturn(Optional.of(studentUser));
        when(studentProfileRepository.findByUserId(studentId)).thenReturn(Optional.of(studentProfile));
        when(jobRepository.findById(jobId)).thenReturn(Optional.of(job));
        when(cvRepository.findById(cvId)).thenReturn(Optional.of(cv));
    }

    @Test
    public void testEmployerCannotApplyForJob() throws Exception {
        // Set up authentication context with employer role
        mockAuthWithEmployer();
        
        Map<String, Object> applicationData = new HashMap<>();
        applicationData.put("coverLetter", "I am interested in this position");
        applicationData.put("cvId", cvId);

        mockMvc.perform(post("/api/applications/apply/" + jobId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(applicationData)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testStudentCannotUpdateApplicationStatus() throws Exception {
        // Set up authentication context with student role
        mockAuthWithStudent();
        
        UUID applicationId = UUID.randomUUID();
        
        Map<String, Object> updateData = new HashMap<>();
        updateData.put("status", "ACCEPTED");
        
        mockMvc.perform(put("/api/applications/" + applicationId + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateData)))
                .andExpect(status().isForbidden());
    }
    
    // Helper methods to set up auth context
    private void mockAuthWithEmployer() {
        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_NLO"));
        
        UserDetailsImpl userDetails = new UserDetailsImpl(
                employerId,
                "employer_test",
                "employer@test.com",
                "password",
                authorities);
        
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, authorities);
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
    
    private void mockAuthWithStudent() {
        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_STUDENT"));
        
        UserDetailsImpl userDetails = new UserDetailsImpl(
                studentId,
                "student_test",
                "student@test.com", 
                "password",
                authorities);
        
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, authorities);
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
