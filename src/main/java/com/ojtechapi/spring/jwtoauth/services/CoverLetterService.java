package com.ojtechapi.spring.jwtoauth.services;

import com.ojtechapi.spring.jwtoauth.entities.CV;
import com.ojtechapi.spring.jwtoauth.entities.Job;
import com.ojtechapi.spring.jwtoauth.entities.StudentProfile;
import com.ojtechapi.spring.jwtoauth.repositories.CVRepository;
import com.ojtechapi.spring.jwtoauth.repositories.JobRepository;
import com.ojtechapi.spring.jwtoauth.repositories.StudentProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class CoverLetterService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;
    
    @Autowired
    private CVRepository cvRepository;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";
    
    /**
     * Generates a cover letter for a job application based on student profile, CV, and job details
     * using Gemini AI.
     * 
     * @param studentId The UUID of the student applying for the job
     * @param jobId The UUID of the job being applied for
     * @param cvId The UUID of the CV being used for the application
     * @return A generated cover letter as a string
     */
    public String generateCoverLetter(UUID studentId, UUID jobId, UUID cvId) {
        // Get student profile
        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
        
        // Get job details
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        // Get CV
        CV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new RuntimeException("CV not found"));
        
        // Check if API key is configured
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            logGeminiApiMissingKeyError("cover letter generation");
            return generateBasicCoverLetter(student, job, cv);
        }
        
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", geminiApiKey);
        
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an expert career advisor specializing in personalized cover letter creation. ");
        prompt.append("Create a professional, tailored cover letter for a job application using the student's profile, CV details, and job description. ");
        prompt.append("The cover letter should:\n");
        prompt.append("1. Be professionally formatted with appropriate salutation and closing\n");
        prompt.append("2. Highlight the student's relevant skills and experiences that match the job requirements\n");
        prompt.append("3. Demonstrate knowledge of the company/position\n");
        prompt.append("4. Express enthusiasm for the role\n");
        prompt.append("5. Include a call to action\n\n");
        
        // Add student details
        prompt.append("STUDENT PROFILE:\n");
        prompt.append("Name: ").append(student.getFirstName()).append(" ").append(student.getLastName()).append("\n");
        prompt.append("University: ").append(student.getUniversity() != null ? student.getUniversity() : "Not specified").append("\n");
        prompt.append("Major: ").append(student.getMajor() != null ? student.getMajor() : "Not specified").append("\n");
        prompt.append("Graduation Year: ").append(student.getGraduationYear() != null ? student.getGraduationYear() : "Not specified").append("\n");
        prompt.append("Bio: ").append(student.getBio() != null ? student.getBio() : "Not provided").append("\n");
        
        // Add skills
        List<String> studentSkills = parseSkills(student.getSkills());
        prompt.append("Skills: ").append(String.join(", ", studentSkills)).append("\n\n");
        
        // Add CV details if available
        if (cv.getParsedResume() != null && !cv.getParsedResume().isEmpty()) {
            prompt.append("CV DETAILS:\n").append(cv.getParsedResume()).append("\n\n");
        }
        
        // Add work experiences if available
        if (cv.getExperiences() != null && !cv.getExperiences().isEmpty()) {
            prompt.append("WORK EXPERIENCE:\n");
            cv.getExperiences().forEach(exp -> {
                prompt.append("- ").append(exp.getTitle()).append(" at ").append(exp.getCompany())
                      .append(" (").append(exp.getStartDate()).append(" - ")
                      .append(exp.getEndDate() != null ? exp.getEndDate() : "Present").append(")\n")
                      .append("  ").append(exp.getDescription()).append("\n");
            });
            prompt.append("\n");
        }
        
        // Add certifications if available
        if (cv.getCertifications() != null && !cv.getCertifications().isEmpty()) {
            prompt.append("CERTIFICATIONS:\n");
            cv.getCertifications().forEach(cert -> {
                prompt.append("- ").append(cert.getName())
                      .append(" (").append(cert.getIssuer()).append(", ")
                      .append(cert.getDateReceived()).append(")\n");
            });
            prompt.append("\n");
        }
        
        // Add job details
        prompt.append("JOB DETAILS:\n");
        prompt.append("Title: ").append(job.getTitle()).append("\n");
        prompt.append("Company: ").append(job.getEmployer().getCompanyName()).append("\n");
        prompt.append("Description: ").append(job.getDescription()).append("\n");
        prompt.append("Location: ").append(job.getLocation() != null ? job.getLocation() : "Not specified").append("\n");
        
        // Add job required skills
        List<String> jobSkills = parseSkills(job.getRequiredSkills());
        prompt.append("Required Skills: ").append(String.join(", ", jobSkills)).append("\n\n");
        
        // Specify to use the employer's name in the salutation
        prompt.append("IMPORTANT: Use '").append(job.getEmployer().getCompanyName()).append("' as the recipient in the salutation instead of 'Hiring Manager'.\n\n");
        
        prompt.append("Create a personalized, professional cover letter based on this information. The letter should be ready to use without needing any placeholders filled in.");
        
        content.put("parts", Collections.singletonList(Collections.singletonMap("text", prompt.toString())));
        contents.add(content);
        requestBody.put("contents", contents);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            System.out.println("Calling Gemini API for cover letter generation...");
            Map<String, Object> response = restTemplate.postForObject(
                GEMINI_API_URL, entity, Map.class);
            
            if (response != null && response.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    List<Map<String, Object>> contentList = (List<Map<String, Object>>) candidate.get("content");
                    if (!contentList.isEmpty()) {
                        Map<String, Object> contentItem = contentList.get(0);
                        List<Map<String, Object>> responseParts = (List<Map<String, Object>>) contentItem.get("parts");
                        if (!responseParts.isEmpty()) {
                            String coverLetter = (String) responseParts.get(0).get("text");
                            System.out.println("Successfully received cover letter from Gemini API");
                            return coverLetter;
                        }
                    }
                }
                logGeminiApiResponseError("cover letter", response);
            } else {
                logGeminiApiResponseError("cover letter", response);
            }
        } catch (Exception e) {
            logGeminiApiError("cover letter", e);
        }
        
        // Fallback to basic cover letter if API call fails
        return generateBasicCoverLetter(student, job, cv);
    }
    
    /**
     * Generates a basic cover letter template when Gemini API is unavailable
     */
    private String generateBasicCoverLetter(StudentProfile student, Job job, CV cv) {
        StringBuilder coverLetter = new StringBuilder();
        
        // Current date
        coverLetter.append(new Date().toString()).append("\n\n");
        
        // Greeting - use employer company name
        String employerContactPersonName = job.getEmployer().getContactPersonName();
        coverLetter.append("Dear ").append(employerContactPersonName).append(",\n\n");
        
        // Introduction
        coverLetter.append("I am writing to express my interest in the ").append(job.getTitle())
                  .append(" position at ").append(job.getEmployer().getCompanyName())
                  .append(". As a ").append(student.getMajor() != null ? student.getMajor() : "student")
                  .append(" at ").append(student.getUniversity() != null ? student.getUniversity() : "my university")
                  .append(", I believe my skills and experiences make me a strong candidate for this role.\n\n");
        
        // Skills match
        List<String> studentSkills = parseSkills(student.getSkills());
        List<String> jobSkills = parseSkills(job.getRequiredSkills());
        List<String> matchingSkills = new ArrayList<>(studentSkills);
        matchingSkills.retainAll(jobSkills);
        
        if (!matchingSkills.isEmpty()) {
            coverLetter.append("My experience with ")
                      .append(String.join(", ", matchingSkills))
                      .append(" aligns well with your requirements. ");
        }
        
        // Experience
        coverLetter.append("Throughout my academic and professional journey, I have developed strong skills in ")
                  .append(String.join(", ", studentSkills.subList(0, Math.min(3, studentSkills.size()))))
                  .append(".\n\n");
        
        // Closing
        coverLetter.append("I am excited about the opportunity to bring my skills to ")
                  .append(job.getEmployer().getCompanyName())
                  .append(" and would welcome the chance to discuss how my background would be a good fit for this position. ")
                  .append("Thank you for considering my application.\n\n");
        
        // Sign-off
        coverLetter.append("Sincerely,\n")
                  .append(student.getFirstName()).append(" ").append(student.getLastName());
        
        return coverLetter.toString();
    }
    
    /**
     * Parses skills from a comma-separated or JSON array string
     */
    private List<String> parseSkills(String skillsString) {
        if (skillsString == null || skillsString.trim().isEmpty()) {
            return Collections.emptyList();
        }
        
        // Try to parse as JSON array if it starts with [ and ends with ]
        if (skillsString.trim().startsWith("[") && skillsString.trim().endsWith("]")) {
            try {
                // Simple JSON array parsing
                String trimmed = skillsString.trim();
                trimmed = trimmed.substring(1, trimmed.length() - 1); // Remove [ ]
                String[] items = trimmed.split(",");
                List<String> skills = new ArrayList<>();
                
                for (String item : items) {
                    // Remove quotes and trim
                    String skill = item.trim();
                    if (skill.startsWith("\"") && skill.endsWith("\"")) {
                        skill = skill.substring(1, skill.length() - 1);
                    }
                    if (!skill.isEmpty()) {
                        skills.add(skill);
                    }
                }
                
                return skills;
            } catch (Exception e) {
                // Fall back to comma-separated parsing
            }
        }
        
        // Parse as comma-separated list
        String[] skills = skillsString.split(",");
        List<String> skillsList = new ArrayList<>();
        for (String skill : skills) {
            String trimmedSkill = skill.trim();
            if (!trimmedSkill.isEmpty()) {
                skillsList.add(trimmedSkill);
            }
        }
        
        return skillsList;
    }
    
    private void logGeminiApiError(String analysisType, Exception e) {
        System.err.println("ERROR: Failed to call Gemini API for " + analysisType + " generation");
        System.err.println("Exception: " + e.getMessage());
        e.printStackTrace();
        System.err.println("Falling back to basic cover letter generation");
    }
    
    private void logGeminiApiResponseError(String analysisType, Map<String, Object> response) {
        System.err.println("ERROR: Unexpected Gemini API response for " + analysisType + " generation");
        System.err.println("Response structure: " + response);
        
        // Check for error details in the response
        if (response != null) {
            if (response.containsKey("error")) {
                Map<String, Object> error = (Map<String, Object>) response.get("error");
                System.err.println("Error code: " + error.getOrDefault("code", "unknown"));
                System.err.println("Error message: " + error.getOrDefault("message", "No message provided"));
                System.err.println("Error status: " + error.getOrDefault("status", "unknown"));
            } else if (response.containsKey("promptFeedback")) {
                Map<String, Object> feedback = (Map<String, Object>) response.get("promptFeedback");
                System.err.println("Prompt feedback: " + feedback);
            }
        }
        
        System.err.println("Falling back to basic cover letter generation");
    }
    
    private void logGeminiApiMissingKeyError(String analysisType) {
        System.err.println("ERROR: Gemini API key is not configured for " + analysisType);
        System.err.println("Please add gemini.api.key to your application.properties");
        System.err.println("Falling back to basic cover letter generation");
    }
} 
