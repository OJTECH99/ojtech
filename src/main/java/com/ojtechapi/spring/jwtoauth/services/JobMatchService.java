package com.ojtechapi.spring.jwtoauth.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ojtechapi.spring.jwtoauth.entities.CV;
import com.ojtechapi.spring.jwtoauth.entities.Certification;
import com.ojtechapi.spring.jwtoauth.entities.Job;
import com.ojtechapi.spring.jwtoauth.entities.JobMatch;
import com.ojtechapi.spring.jwtoauth.entities.StudentProfile;
import com.ojtechapi.spring.jwtoauth.entities.WorkExperience;
import com.ojtechapi.spring.jwtoauth.repositories.CVRepository;
import com.ojtechapi.spring.jwtoauth.repositories.JobMatchRepository;
import com.ojtechapi.spring.jwtoauth.repositories.JobRepository;
import com.ojtechapi.spring.jwtoauth.repositories.StudentProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class JobMatchService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private JobMatchRepository jobMatchRepository;
    
    @Autowired
    private CVRepository cvRepository;

     @Value("${backend.base-url}")
    private String baseUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";
    
    private final RestTemplate restTemplate = new RestTemplate();

    public List<JobMatch> findMatchesForStudent(UUID studentId, Double minScore) {
        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        // Get all active jobs
        List<Job> activeJobs = jobRepository.findByActiveTrue();
        
        // If no active jobs in database, try to fetch from API
        if (activeJobs.isEmpty()) {
            activeJobs = fetchJobsFromApi();
            
            // If still no jobs, log error and return empty list
            if (activeJobs.isEmpty()) {
                System.err.println("No active jobs found in database or API");
                return new ArrayList<>();
            }
        }
        
        // Get existing job matches for this student
        List<JobMatch> existingMatches = jobMatchRepository.findByStudentIdOrderByMatchScoreDesc(studentId);
        Set<UUID> matchedJobIds = new HashSet<>();
        for (JobMatch match : existingMatches) {
            matchedJobIds.add(match.getJob().getId());
        }
        
        List<JobMatch> newMatches = new ArrayList<>();
        
        // Get student's active CV
        CV activeCv = null;
        if (student.getActiveCvId() != null) {
            activeCv = cvRepository.findById(student.getActiveCvId()).orElse(null);
        }
        
        // Extract student skills as a list
        List<String> studentSkills = parseSkills(student.getSkills());
        
        // Process each job and wait for AI response
        for (Job job : activeJobs) {
            try {
                // Skip jobs that already have a match with this student
                if (matchedJobIds.contains(job.getId())) {
                    continue;
                }
                
                // Parse job skills
                List<String> jobSkills = parseSkills(job.getRequiredSkills());
                
                // Collect all analyses first to feed into the final match score calculation
                Map<String, String> detailedAnalysis = new HashMap<>();
                
                // Generate detailed match explanation first
                String matchDetails = generateMatchDetails(student, studentSkills, activeCv, job);
                detailedAnalysis.put("overallMatch", matchDetails);
                
                // Analyze GitHub projects if available
                String githubAnalysis = null;
                if (student.getGithubUrl() != null || student.getGithubProjects() != null) {
                    githubAnalysis = analyzeGitHubProjects(
                        student.getGithubUrl(), 
                        student.getGithubProjects(), 
                        jobSkills);
                    detailedAnalysis.put("githubAnalysis", githubAnalysis);
                }
                
                // Analyze portfolio if available
                String portfolioAnalysis = null;
                if (student.getPortfolioUrl() != null) {
                    portfolioAnalysis = analyzePortfolio(student.getPortfolioUrl(), jobSkills);
                    detailedAnalysis.put("portfolioAnalysis", portfolioAnalysis);
                }
                
                // Analyze certifications if available
                String certificationsAnalysis = null;
                if (student.getCertifications() != null && !student.getCertifications().isEmpty()) {
                    certificationsAnalysis = analyzeCertifications(student.getCertifications(), jobSkills);
                    detailedAnalysis.put("certificationsAnalysis", certificationsAnalysis);
                }
                
                // Analyze work experience if available
                String experiencesAnalysis = null;
                if (student.getExperiences() != null && !student.getExperiences().isEmpty()) {
                    experiencesAnalysis = analyzeWorkExperience(student.getExperiences(), jobSkills);
                    detailedAnalysis.put("experiencesAnalysis", experiencesAnalysis);
                }
                
                // Analyze bio if available using NLP
                String bioAnalysis = null;
                if (student.getBio() != null && !student.getBio().isEmpty()) {
                    bioAnalysis = analyzeBioWithNLP(student.getBio(), jobSkills, job);
                    detailedAnalysis.put("bioAnalysis", bioAnalysis);
                }
                
                // Now calculate match score using ALL available analyses
                Double matchScore = calculateMatchScoreWithAllData(student, studentSkills, activeCv, job, 
                    githubAnalysis, portfolioAnalysis, certificationsAnalysis, experiencesAnalysis, bioAnalysis);
                
                // Create job match
                JobMatch jobMatch = new JobMatch(job, student, matchScore);
                jobMatch.setMatchDetails(matchDetails);
                jobMatch.setMatchedAt(LocalDateTime.now());
                
                // Convert detailed analysis to JSON string
                try {
                    ObjectMapper objectMapper = new ObjectMapper();
                    String analysisJson = objectMapper.writeValueAsString(detailedAnalysis);
                    jobMatch.setDetailedAnalysis(analysisJson);
                } catch (Exception e) {
                    System.err.println("Error converting detailed analysis to JSON: " + e.getMessage());
                }
                
                // Save to database
                JobMatch savedMatch = jobMatchRepository.save(jobMatch);
                newMatches.add(savedMatch);
            } catch (Exception e) {
                System.err.println("Error processing job " + job.getId() + ": " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        // Sort matches by score (highest first)
        newMatches.sort((a, b) -> b.getMatchScore().compareTo(a.getMatchScore()));
        
        // Combine existing and new matches if needed
        if (minScore != null) {
            // Filter both existing and new matches by minimum score
            List<JobMatch> allMatches = new ArrayList<>();
            for (JobMatch match : existingMatches) {
                if (match.getMatchScore() >= minScore) {
                    allMatches.add(match);
                }
            }
            allMatches.addAll(newMatches);
            allMatches.sort((a, b) -> b.getMatchScore().compareTo(a.getMatchScore()));
            return allMatches;
        }
        
        return newMatches;
    }
    
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
            String trimmed = skill.trim();
            if (!trimmed.isEmpty()) {
                skillsList.add(trimmed);
            }
        }
        return skillsList;
    }
    
    private List<Job> fetchJobsFromApi() {
        try {
            ResponseEntity<List<Job>> response = restTemplate.exchange(
                baseUrl + "/api/jobs",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<Job>>() {}
            );
            
            if (response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            System.err.println("Error fetching jobs from API: " + e.getMessage());
        }
        
        return new ArrayList<>();
    }
    
    public List<JobMatch> getStudentMatches(UUID studentId) {
        List<JobMatch> allMatches = jobMatchRepository.findByStudentIdOrderByMatchScoreDesc(studentId);
        // Filter to only return matches with 60% or above match score
        return allMatches.stream()
                .filter(match -> match.getMatchScore() != null && match.getMatchScore() >= 60.0)
                .collect(java.util.stream.Collectors.toList());
    }
    
    /**
     * Recalculates match scores for all existing job matches of a student.
     * This method is called when a student updates their profile to ensure
     * match scores reflect the latest profile data.
     * 
     * @param studentId The ID of the student whose matches should be recalculated
     */
    public void recalculateMatchesForStudent(UUID studentId) {
        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        // Get all existing job matches for this student
        List<JobMatch> existingMatches = jobMatchRepository.findByStudentIdOrderByMatchScoreDesc(studentId);
        
        if (existingMatches.isEmpty()) {
            System.out.println("No existing matches found for student " + studentId);
            return;
        }
        
        System.out.println("Recalculating " + existingMatches.size() + " job matches for student " + studentId);
        
        // Get student's active CV
        CV activeCv = null;
        if (student.getActiveCvId() != null) {
            activeCv = cvRepository.findById(student.getActiveCvId()).orElse(null);
        }
        
        // Extract student skills
        List<String> studentSkills = parseSkills(student.getSkills());
        
        // Recalculate each match
        for (JobMatch match : existingMatches) {
            try {
                Job job = match.getJob();
                
                // Skip if job is no longer active
                if (!job.isActive()) {
                    System.out.println("Skipping inactive job: " + job.getId());
                    continue;
                }
                
                // Parse job skills
                List<String> jobSkills = parseSkills(job.getRequiredSkills());
                
                // Collect all analyses
                String githubAnalysis = null;
                if (student.getGithubUrl() != null || student.getGithubProjects() != null) {
                    githubAnalysis = analyzeGitHubProjects(
                        student.getGithubUrl(), 
                        student.getGithubProjects(), 
                        jobSkills);
                }
                
                String portfolioAnalysis = null;
                if (student.getPortfolioUrl() != null) {
                    portfolioAnalysis = analyzePortfolio(student.getPortfolioUrl(), jobSkills);
                }
                
                String certificationsAnalysis = null;
                if (student.getCertifications() != null && !student.getCertifications().isEmpty()) {
                    certificationsAnalysis = analyzeCertifications(student.getCertifications(), jobSkills);
                }
                
                String experiencesAnalysis = null;
                if (student.getExperiences() != null && !student.getExperiences().isEmpty()) {
                    experiencesAnalysis = analyzeWorkExperience(student.getExperiences(), jobSkills);
                }
                
                String bioAnalysis = null;
                if (student.getBio() != null && !student.getBio().isEmpty()) {
                    bioAnalysis = analyzeBioWithNLP(student.getBio(), jobSkills, job);
                }
                
                // Calculate new match score
                Double newMatchScore = calculateMatchScoreWithAllData(student, studentSkills, activeCv, job, 
                    githubAnalysis, portfolioAnalysis, certificationsAnalysis, experiencesAnalysis, bioAnalysis);
                
                // Generate new match details
                String newMatchDetails = generateMatchDetails(student, studentSkills, activeCv, job);
                
                // Update the match
                match.setMatchScore(newMatchScore);
                match.setMatchDetails(newMatchDetails);
                match.setUpdatedAt(LocalDateTime.now());
                
                jobMatchRepository.save(match);
                
                System.out.println("Updated match for job " + job.getId() + " - New score: " + newMatchScore);
                
            } catch (Exception e) {
                System.err.println("Error recalculating match for job " + match.getJob().getId() + ": " + e.getMessage());
                // Continue with next match even if one fails
            }
        }
        
        System.out.println("Completed recalculating matches for student " + studentId);
    }
    
    private Double calculateMatchScore(StudentProfile student, List<String> studentSkills, CV cv, Job job) {
        // First, calculate a direct skill match percentage
        List<String> jobSkills = parseSkills(job.getRequiredSkills());
        
        // Get framework-language relationships for better matching
        Map<String, List<String>> frameworkLanguageMap = getFrameworkLanguageMap();
        
        // Calculate matching skills with improved framework-language relationship detection
        List<String> directMatches = new ArrayList<>();
        List<String> relatedMatches = new ArrayList<>();
        List<String> frameworkLanguageMatches = new ArrayList<>();
        
        // First pass: Find direct matches
        for (String jobSkill : jobSkills) {
            String jobSkillLower = jobSkill.toLowerCase();
            
            // Check for direct matches
            boolean matched = false;
            for (String studentSkill : studentSkills) {
                String studentSkillLower = studentSkill.toLowerCase();
                if (jobSkillLower.equals(studentSkillLower)) {
                    directMatches.add(jobSkill);
                    matched = true;
                    break;
                }
            }
            
            if (!matched) {
                // Check for partial matches (one contains the other)
                for (String studentSkill : studentSkills) {
                    String studentSkillLower = studentSkill.toLowerCase();
                    if (jobSkillLower.contains(studentSkillLower) || studentSkillLower.contains(jobSkillLower)) {
                        relatedMatches.add(jobSkill);
                        matched = true;
                        break;
                    }
                }
            }
        }
        
        // Second pass: Check for framework-language relationships
        for (String jobSkill : jobSkills) {
            if (directMatches.contains(jobSkill) || relatedMatches.contains(jobSkill)) {
                continue; // Skip already matched skills
            }
            
            String jobSkillLower = jobSkill.toLowerCase();
            
            // Check if job skill is a framework and student has the related language
            for (Map.Entry<String, List<String>> entry : frameworkLanguageMap.entrySet()) {
                String framework = entry.getKey();
                List<String> languages = entry.getValue();
                
                if (jobSkillLower.contains(framework)) {
                    // Job requires a framework, check if student knows the related language
                    for (String language : languages) {
                        for (String studentSkill : studentSkills) {
                            String studentSkillLower = studentSkill.toLowerCase();
                            if (studentSkillLower.contains(language)) {
                                frameworkLanguageMatches.add(jobSkill + " (via " + studentSkill + ")");
                                break;
                            }
                        }
                    }
                }
                
                // Check if job requires a language and student knows a related framework
                for (String language : languages) {
                    if (jobSkillLower.contains(language)) {
                        // Job requires a language, check if student knows the related framework
                        for (String studentSkill : studentSkills) {
                            String studentSkillLower = studentSkill.toLowerCase();
                            if (studentSkillLower.contains(framework)) {
                                frameworkLanguageMatches.add(jobSkill + " (via " + studentSkill + ")");
                                break;
                            }
                        }
                    }
                }
            }
        }
        
        // Calculate weighted match score
        double directMatchWeight = 1.0;
        double relatedMatchWeight = 0.7;
        double frameworkLanguageWeight = 0.5;
        
        double totalMatches = (directMatches.size() * directMatchWeight) + 
                             (relatedMatches.size() * relatedMatchWeight) + 
                             (frameworkLanguageMatches.size() * frameworkLanguageWeight);
        
        double directMatchPercentage = jobSkills.isEmpty() ? 0 : 
            (totalMatches / jobSkills.size()) * 100;
        
        // Special case for Java, Spring Boot, and React skills
        boolean hasJava = false;
        boolean hasSpring = false;
        boolean hasReact = false;
        
        for (String skill : studentSkills) {
            String lowerSkill = skill.toLowerCase();
            if (lowerSkill.contains("java")) hasJava = true;
            if (lowerSkill.contains("spring")) hasSpring = true;
            if (lowerSkill.contains("react")) hasReact = true;
        }
        
        boolean jobNeedsJava = false;
        boolean jobNeedsSpring = false;
        boolean jobNeedsReact = false;
        
        for (String skill : jobSkills) {
            String lowerSkill = skill.toLowerCase();
            if (lowerSkill.contains("java")) jobNeedsJava = true;
            if (lowerSkill.contains("spring")) jobNeedsSpring = true;
            if (lowerSkill.contains("react")) jobNeedsReact = true;
        }
        
        // If job requires Java, Spring, React and student has them, ensure at least 60% match
        if ((hasJava && jobNeedsJava) && 
            (hasSpring && jobNeedsSpring) && 
            (hasReact && jobNeedsReact)) {
            directMatchPercentage = Math.max(directMatchPercentage, 60.0);
        }
        
        // Incorporate additional profile elements to boost score
        double additionalBoost = 0.0;
        
        // Check for GitHub projects
        if (student.getGithubUrl() != null && !student.getGithubUrl().isEmpty()) {
            additionalBoost += 5.0;
        }
        
        // Check for portfolio
        if (student.getPortfolioUrl() != null && !student.getPortfolioUrl().isEmpty()) {
            additionalBoost += 5.0;
        }
        
        // Check for certifications
        if (student.getCertifications() != null && !student.getCertifications().isEmpty()) {
            additionalBoost += 5.0;
        }
        
        // Check for work experience
        if (student.getExperiences() != null && !student.getExperiences().isEmpty()) {
            additionalBoost += 5.0;
        }
        
        // Apply the boost, but ensure we don't exceed 100%
        directMatchPercentage = Math.min(100.0, directMatchPercentage + additionalBoost);
        
        // If we have a good direct match (over 40%), we can return that
        if (directMatchPercentage >= 40) {
            return directMatchPercentage;
        }
        
        // Check if API key is configured
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            logGeminiApiMissingKeyError("match score calculation");
            return Math.max(directMatchPercentage, 1.0); // Return direct match with minimum of 1%
        }
        
        // Otherwise, use AI for a more nuanced analysis
        HttpHeaders headers = createGeminiHeaders();
        
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an AI job matcher specializing in deep skill compatibility analysis using NLP techniques. ");
        prompt.append("Your task is to analyze the compatibility between a job and a student's comprehensive profile using semantic understanding. ");
        prompt.append("Consider not just direct skill matches, but also semantic similarity, related skills, transferable knowledge, and potential. ");
        prompt.append("Apply the following NLP concepts in your analysis:\n");
        prompt.append("1. Semantic similarity between skills (e.g., React and Angular are both frontend frameworks)\n");
        prompt.append("2. Skill taxonomy and hierarchies (e.g., Spring is a Java framework)\n");
        prompt.append("3. Entity recognition to identify technologies, tools, and domains\n");
        prompt.append("4. Contextual understanding of skill relationships\n\n");
        prompt.append("Return a match score between 1 and 100, where 100 is a perfect match. ");
        prompt.append("Only return the numeric score as an integer between 1 and 100, nothing else. \n\n");
        
        prompt.append("JOB DETAILS:\n");
        prompt.append("Title: ").append(job.getTitle()).append("\n");
        prompt.append("Description: ").append(job.getDescription()).append("\n");
        prompt.append("Required Skills: ").append(String.join(", ", jobSkills)).append("\n\n");
        
        prompt.append("STUDENT DETAILS:\n");
        prompt.append("Skills: ").append(String.join(", ", studentSkills)).append("\n");
        prompt.append("Major: ").append(student.getMajor()).append("\n");
        
        // Add additional student profile elements if available
        if (student.getBio() != null && !student.getBio().isEmpty()) {
            prompt.append("Bio: ").append(student.getBio()).append("\n");
        }
        
        if (student.getGithubUrl() != null && !student.getGithubUrl().isEmpty()) {
            prompt.append("GitHub Projects: ").append(student.getGithubUrl()).append("\n");
        }
        
        if (student.getCertifications() != null && !student.getCertifications().isEmpty()) {
            prompt.append("Certifications: ").append(student.getCertifications()).append("\n");
        }
        
        if (student.getExperiences() != null && !student.getExperiences().isEmpty()) {
            prompt.append("Experiences: ").append(student.getExperiences()).append("\n");
        }
        
        if (student.getPortfolioUrl() != null && !student.getPortfolioUrl().isEmpty()) {
            prompt.append("Portfolio URL: ").append(student.getPortfolioUrl()).append("\n");
        }
        
        if (cv != null) {
            prompt.append("CV Content: ").append(cv.getParsedResume()).append("\n");
        }
        
        // Add specific NLP analysis instructions
        prompt.append("\nNLP ANALYSIS INSTRUCTIONS:\n");
        prompt.append("1. Perform semantic similarity analysis:\n");
        prompt.append("   - Compare the student's skills [").append(String.join(", ", studentSkills)).append("] ");
        prompt.append("with the job's required skills [").append(String.join(", ", jobSkills)).append("]\n");
        prompt.append("   - Use semantic understanding to identify conceptually similar skills even with different terminology\n");
        prompt.append("   - Consider skill hierarchies and relationships (e.g., React is a JavaScript framework)\n\n");
        
        prompt.append("2. Apply skill taxonomy awareness:\n");
        prompt.append("   - Group skills by domains: frontend, backend, database, cloud, etc.\n");
        prompt.append("   - Recognize when a student has skills in the same domain as required skills\n");
        prompt.append("   - Identify complementary skill sets (e.g., React+Redux, Java+Spring)\n\n");
        
        prompt.append("3. Consider educational and experiential context:\n");
        prompt.append("   - Evaluate how the student's major and education relate to job requirements\n");
        prompt.append("   - Assess GitHub projects and portfolio for practical skill application\n");
        prompt.append("   - Consider certifications as formal validation of skills\n\n");
        
        prompt.append("4. Apply these special matching rules:\n");
        prompt.append("   - If the student has Java, Spring Boot, and React skills, and the job requires these, give at least a 60% match\n");
        prompt.append("   - Consider related technologies as partial matches (e.g., React is related to Angular, Java is related to Kotlin)\n");
        prompt.append("   - Weigh recent experience and education more heavily\n");
        prompt.append("   - Consider the student's potential to quickly learn missing skills\n\n");
        
        prompt.append("5. Framework-language relationships to consider:\n");
        prompt.append("   - React, Angular, Vue → JavaScript/TypeScript\n");
        prompt.append("   - Spring → Java/Kotlin\n");
        prompt.append("   - Django, Flask → Python\n");
        prompt.append("   - Express → Node.js/JavaScript\n");
        prompt.append("   - Laravel → PHP\n");
        prompt.append("   - Rails → Ruby\n");
        prompt.append("   - ASP.NET → C#/.NET\n");
        prompt.append("   - If student knows a language, consider partial match for frameworks in that language\n");
        prompt.append("   - If student knows a framework, consider partial match for the underlying language\n\n");
        
        prompt.append("6. IMPORTANT: Return only a single number between 1-100 representing the match percentage\n");
        
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt.toString());
        parts.add(textPart);
        
        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            Map<String, Object> response = restTemplate.postForObject(GEMINI_API_URL, entity, Map.class);
            String scoreText = extractGeminiResponse(response);
            
            if (scoreText != null) {
                try {
                    double score = Double.parseDouble(scoreText.trim());
                    return Math.min(100.0, Math.max(1.0, score));
                } catch (NumberFormatException e) {
                    System.err.println("Error parsing score from AI: " + e.getMessage());
                    return Math.max(directMatchPercentage, 1.0);
                }
            }
            logGeminiApiResponseError("match score calculation", response);
        } catch (Exception e) {
            logGeminiApiError("match score calculation", e);
        }
        
        // If AI fails, return the direct match percentage
        return Math.max(directMatchPercentage, 1.0);
    }
    
    private String generateMatchDetails(StudentProfile student, List<String> studentSkills, CV cv, Job job) {
        // Check if API key is configured
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            logGeminiApiMissingKeyError("match details");
            return generateBasicMatchDetails(student, studentSkills, cv, job);
        }
        
        HttpHeaders headers = createGeminiHeaders();
        
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an AI job matcher specializing in comprehensive candidate evaluation using advanced NLP techniques. ");
        prompt.append("Analyze the compatibility between this job and student profile in detail using semantic analysis. ");
        prompt.append("Your analysis should include:\n");
        prompt.append("1. Semantic similarity between job requirements and candidate skills\n");
        prompt.append("2. Keyword extraction from both job description and student profile\n");
        prompt.append("3. Entity recognition to identify technologies, tools, and domain expertise\n");
        prompt.append("4. Contextual understanding of skill relationships and hierarchies\n");
        prompt.append("5. Sentiment analysis of the candidate's descriptions and achievements\n\n");
        
        prompt.append("Provide a thorough explanation (max 1500 characters) of why they match or don't match. ");
        prompt.append("Focus on direct skill matches, related skills, transferable knowledge, education relevance, and growth potential. ");
        prompt.append("Be specific about strengths, gaps, and include recommendations for the student. ");
        prompt.append("Include a percentage match score (1-100%) at the end.\n\n");
        
        // Parse job required skills
        List<String> jobSkills = parseSkills(job.getRequiredSkills());
        
        prompt.append("JOB DETAILS:\n");
        prompt.append("Title: ").append(job.getTitle()).append("\n");
        prompt.append("Description: ").append(job.getDescription()).append("\n");
        prompt.append("Required Skills: ").append(String.join(", ", jobSkills)).append("\n\n");
        
        prompt.append("STUDENT DETAILS:\n");
        prompt.append("Skills: ").append(String.join(", ", studentSkills)).append("\n");
        prompt.append("Major: ").append(student.getMajor()).append("\n");
        prompt.append("University: ").append(student.getUniversity()).append("\n");
        prompt.append("Graduation Year: ").append(student.getGraduationYear()).append("\n");
        
        // Add additional student profile elements if available
        if (student.getBio() != null && !student.getBio().isEmpty()) {
            prompt.append("Bio: ").append(student.getBio()).append("\n");
        }
        
        if (student.getGithubUrl() != null && !student.getGithubUrl().isEmpty()) {
            prompt.append("GitHub Projects: ").append(student.getGithubUrl()).append("\n");
        }
        
        if (student.getCertifications() != null && !student.getCertifications().isEmpty()) {
            prompt.append("Certifications: ");
            for (Certification cert : student.getCertifications()) {
                prompt.append(cert.getName()).append(" (").append(cert.getIssuer()).append("), ");
            }
            prompt.append("\n");
        }
        
        if (student.getExperiences() != null && !student.getExperiences().isEmpty()) {
            prompt.append("Work Experiences: ");
            for (WorkExperience exp : student.getExperiences()) {
                prompt.append(exp.getTitle()).append(" at ").append(exp.getCompany()).append(", ");
            }
            prompt.append("\n");
        }
        
        if (student.getPortfolioUrl() != null && !student.getPortfolioUrl().isEmpty()) {
            prompt.append("Portfolio URL: ").append(student.getPortfolioUrl()).append("\n");
        }
        
        if (cv != null) {
            prompt.append("CV Content: ").append(cv.getParsedResume()).append("\n");
        }
        
        // Add specific instructions for detailed NLP analysis
        prompt.append("\nNLP ANALYSIS INSTRUCTIONS:\n");
        prompt.append("1. Perform semantic similarity analysis between student skills and job required skills\n");
        prompt.append("   - Use vector space understanding to identify conceptually similar skills even with different terminology\n");
        prompt.append("   - Consider skill hierarchies (e.g., React is a subset of JavaScript frameworks)\n");
        prompt.append("   - Identify skill clusters and domains (frontend, backend, database, etc.)\n\n");
        
        prompt.append("2. Extract key entities from both profiles:\n");
        prompt.append("   - Technologies: programming languages, frameworks, tools\n");
        prompt.append("   - Domains: industry sectors, specialized fields\n");
        prompt.append("   - Soft skills: communication, teamwork, leadership\n");
        prompt.append("   - Experience levels: junior, mid-level, senior indicators\n\n");
        
        prompt.append("3. Analyze skill relationships:\n");
        prompt.append("   - Identify complementary skills (e.g., React + Redux, Java + Spring)\n");
        prompt.append("   - Recognize transferable skills across domains\n");
        prompt.append("   - Evaluate skill recency and relevance to current industry trends\n\n");
        
        prompt.append("4. Consider ALL aspects of the student profile:\n");
        prompt.append("   - GitHub projects that demonstrate practical application of skills\n");
        prompt.append("   - Portfolio work that showcases relevant abilities\n");
        prompt.append("   - Certifications that validate specific competencies\n");
        prompt.append("   - Work experience that demonstrates real-world application\n");
        prompt.append("   - Educational background and its relevance to the position\n\n");
        
        prompt.append("5. Format your response with clear sections:\n");
        prompt.append("   - Semantic Match Analysis: Overall compatibility based on meaning, not just keywords\n");
        prompt.append("   - Strengths: Areas where the candidate strongly matches the job\n");
        prompt.append("   - Gaps: Skills or experiences the candidate should develop\n");
        prompt.append("   - Recommendations: Specific actions to improve match quality\n");
        prompt.append("   - Match Score: Final percentage (1-100%) with brief explanation\n\n");
        
        prompt.append("6. IMPORTANT: Consider these special cases:\n");
        prompt.append("   - Related technologies as partial matches (e.g., React is related to Angular, Java is related to Kotlin)\n");
        prompt.append("   - If the student has Java, Spring Boot, and React skills, and the job requires these, give at least a 60% match\n");
        prompt.append("   - Educational background that complements technical skills\n");
        prompt.append("   - Project experience that demonstrates practical application of skills\n");
        prompt.append("   - Framework-language relationships (e.g., knowing React implies JavaScript knowledge)\n");
        prompt.append("   - Value demonstrated experience (GitHub, portfolio, work) more heavily than listed skills\n");
        
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt.toString());
        parts.add(textPart);
        
        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            Map<String, Object> response = restTemplate.postForObject(GEMINI_API_URL, entity, Map.class);
            String details = extractGeminiResponse(response);
            
            if (details != null) {
                if (details.length() > 2000) {
                    details = details.substring(0, 1997) + "...";
                }
                return details;
            }
            logGeminiApiResponseError("match details", response);
        } catch (Exception e) {
            logGeminiApiError("match details", e);
        }
        
        // Fallback to basic analysis if API call fails
        return generateBasicMatchDetails(student, studentSkills, cv, job);
    }
    
    private String generateBasicMatchDetails(StudentProfile student, List<String> studentSkills, CV cv, Job job) {
        StringBuilder analysis = new StringBuilder();
        analysis.append("## Job Match Analysis\n\n");
        
        // Parse job required skills
        List<String> jobSkills = parseSkills(job.getRequiredSkills());
        
        analysis.append("### Job Details\n");
        analysis.append("Title: ").append(job.getTitle()).append("\n");
        analysis.append("Required Skills: ").append(String.join(", ", jobSkills)).append("\n\n");
        
        analysis.append("### Student Skills\n");
        analysis.append(String.join(", ", studentSkills)).append("\n\n");
        
        // Get framework-language relationships for better matching
        Map<String, List<String>> frameworkLanguageMap = getFrameworkLanguageMap();
        
        // Calculate direct skill matches
        List<String> directMatches = new ArrayList<>();
        List<String> relatedMatches = new ArrayList<>();
        List<String> frameworkLanguageMatches = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();
        
        // First pass: Find direct matches
        for (String jobSkill : jobSkills) {
            String jobSkillLower = jobSkill.toLowerCase();
            
            // Check for direct matches
            boolean matched = false;
            for (String studentSkill : studentSkills) {
                String studentSkillLower = studentSkill.toLowerCase();
                if (jobSkillLower.equals(studentSkillLower)) {
                    directMatches.add(jobSkill);
                    matched = true;
                    break;
                }
            }
            
            if (!matched) {
                // Check for partial matches (one contains the other)
                for (String studentSkill : studentSkills) {
                    String studentSkillLower = studentSkill.toLowerCase();
                    if (jobSkillLower.contains(studentSkillLower) || studentSkillLower.contains(jobSkillLower)) {
                        relatedMatches.add(jobSkill + " (related to " + studentSkill + ")");
                        matched = true;
                        break;
                    }
                }
            }
            
            if (!matched) {
                // Check for framework-language relationships
                boolean frameworkMatched = false;
                
                // Check if job skill is a framework and student has the related language
                for (Map.Entry<String, List<String>> entry : frameworkLanguageMap.entrySet()) {
                    String framework = entry.getKey();
                    List<String> languages = entry.getValue();
                    
                    if (jobSkillLower.contains(framework)) {
                        // Job requires a framework, check if student knows the related language
                        for (String language : languages) {
                            for (String studentSkill : studentSkills) {
                                String studentSkillLower = studentSkill.toLowerCase();
                                if (studentSkillLower.contains(language)) {
                                    frameworkLanguageMatches.add(jobSkill + " (via " + studentSkill + ")");
                                    frameworkMatched = true;
                                    break;
                                }
                            }
                            if (frameworkMatched) break;
                        }
                    }
                    
                    if (frameworkMatched) break;
                    
                    // Check if job requires a language and student knows a related framework
                    for (String language : languages) {
                        if (jobSkillLower.contains(language)) {
                            // Job requires a language, check if student knows the related framework
                            for (String studentSkill : studentSkills) {
                                String studentSkillLower = studentSkill.toLowerCase();
                                if (studentSkillLower.contains(framework)) {
                                    frameworkLanguageMatches.add(jobSkill + " (via " + studentSkill + ")");
                                    frameworkMatched = true;
                                    break;
                                }
                            }
                            if (frameworkMatched) break;
                        }
                    }
                    
                    if (frameworkMatched) break;
                }
                
                if (!frameworkMatched) {
                    missingSkills.add(jobSkill);
                }
            }
        }
        
        // Calculate match percentage
        double directMatchWeight = 1.0;
        double relatedMatchWeight = 0.7;
        double frameworkLanguageWeight = 0.5;
        
        double weightedMatches = (directMatches.size() * directMatchWeight) + 
                               (relatedMatches.size() * relatedMatchWeight) + 
                               (frameworkLanguageMatches.size() * frameworkLanguageWeight);
        
        double matchPercentage = jobSkills.isEmpty() ? 0 : (weightedMatches / jobSkills.size()) * 100;
        
        // Special case for Java, Spring Boot, and React skills
        boolean hasJava = false;
        boolean hasSpring = false;
        boolean hasReact = false;
        
        for (String skill : studentSkills) {
            String lowerSkill = skill.toLowerCase();
            if (lowerSkill.contains("java")) hasJava = true;
            if (lowerSkill.contains("spring")) hasSpring = true;
            if (lowerSkill.contains("react")) hasReact = true;
        }
        
        boolean jobNeedsJava = false;
        boolean jobNeedsSpring = false;
        boolean jobNeedsReact = false;
        
        for (String skill : jobSkills) {
            String lowerSkill = skill.toLowerCase();
            if (lowerSkill.contains("java")) jobNeedsJava = true;
            if (lowerSkill.contains("spring")) jobNeedsSpring = true;
            if (lowerSkill.contains("react")) jobNeedsReact = true;
        }
        
        // If job requires Java, Spring, React and student has them, ensure at least 60% match
        if ((hasJava && jobNeedsJava) && 
            (hasSpring && jobNeedsSpring) && 
            (hasReact && jobNeedsReact)) {
            matchPercentage = Math.max(matchPercentage, 60.0);
            analysis.append("### Special Match Bonus\n");
            analysis.append("You have Java, Spring Boot, and React skills which are highly valued for this position.\n\n");
        }
        
        // Incorporate additional profile elements to boost score
        double additionalBoost = 0.0;
        List<String> boostSources = new ArrayList<>();
        
        // Check for GitHub projects
        if (student.getGithubUrl() != null && !student.getGithubUrl().isEmpty()) {
            additionalBoost += 5.0;
            boostSources.add("GitHub projects");
        }
        
        // Check for portfolio
        if (student.getPortfolioUrl() != null && !student.getPortfolioUrl().isEmpty()) {
            additionalBoost += 5.0;
            boostSources.add("portfolio");
        }
        
        // Check for certifications
        if (student.getCertifications() != null && !student.getCertifications().isEmpty()) {
            additionalBoost += 5.0;
            boostSources.add("certifications");
        }
        
        // Check for work experience
        if (student.getExperiences() != null && !student.getExperiences().isEmpty()) {
            additionalBoost += 5.0;
            boostSources.add("work experience");
        }
        
        // Apply the boost, but ensure we don't exceed 100%
        double finalMatchPercentage = Math.min(100.0, matchPercentage + additionalBoost);
        
        if (additionalBoost > 0) {
            analysis.append("### Profile Strength Bonus\n");
            analysis.append("Your profile received a ").append(Math.round(additionalBoost)).append("% boost for having: ");
            analysis.append(String.join(", ", boostSources)).append(".\n\n");
        }
        
        // Round to nearest integer
        int roundedMatchPercentage = (int) Math.round(finalMatchPercentage);
        
        // Add match details
        analysis.append("### Skill Match Analysis\n\n");
        
        analysis.append("#### Direct Matches\n");
        if (!directMatches.isEmpty()) {
            for (String match : directMatches) {
                analysis.append("- ").append(match).append("\n");
            }
        } else {
            analysis.append("- No direct skill matches found\n");
        }
        analysis.append("\n");
        
        analysis.append("#### Related Matches\n");
        if (!relatedMatches.isEmpty()) {
            for (String match : relatedMatches) {
                analysis.append("- ").append(match).append("\n");
            }
        } else {
            analysis.append("- No related skill matches found\n");
        }
        analysis.append("\n");
        
        analysis.append("#### Framework-Language Relationships\n");
        if (!frameworkLanguageMatches.isEmpty()) {
            for (String match : frameworkLanguageMatches) {
                analysis.append("- ").append(match).append("\n");
            }
        } else {
            analysis.append("- No framework-language relationships found\n");
        }
        analysis.append("\n");
        
        analysis.append("#### Missing Skills\n");
        if (!missingSkills.isEmpty()) {
            for (String skill : missingSkills) {
                analysis.append("- ").append(skill).append("\n");
            }
        } else {
            analysis.append("- No missing skills! You have all the required skills.\n");
        }
        analysis.append("\n");
        
        // Add education relevance
        analysis.append("### Education Relevance\n\n");
        if (student.getMajor() != null && !student.getMajor().isEmpty()) {
            analysis.append("Your major in ").append(student.getMajor()).append(" ");
            
            // Check if major is relevant to job title or skills
            boolean majorRelevant = false;
            String majorLower = student.getMajor().toLowerCase();
            
            if (job.getTitle().toLowerCase().contains(majorLower)) {
                majorRelevant = true;
            } else {
                for (String skill : jobSkills) {
                    if (skill.toLowerCase().contains(majorLower) || 
                        majorLower.contains(skill.toLowerCase())) {
                        majorRelevant = true;
                        break;
                    }
                }
            }
            
            if (majorRelevant) {
                analysis.append("is directly relevant to this position.\n\n");
            } else {
                analysis.append("provides transferable skills that could be applied to this role.\n\n");
            }
        }
        
        // Add recommendations
        analysis.append("### Recommendations\n\n");
        if (!missingSkills.isEmpty()) {
            analysis.append("To improve your match for this position, consider developing these skills:\n");
            for (String skill : missingSkills.subList(0, Math.min(3, missingSkills.size()))) {
                analysis.append("- ").append(skill).append("\n");
            }
            analysis.append("\n");
        }
        
        // Add final match percentage
        analysis.append("### Overall Match\n\n");
        analysis.append("Your profile matches approximately ").append(roundedMatchPercentage).append("% of the job requirements.");
        
        // Limit to 2000 characters (column limit)
        String result = analysis.toString();
        if (result.length() > 2000) {
            result = result.substring(0, 1997) + "...";
        }
        
        return result;
    }
    
    public JobMatch markAsViewed(UUID jobMatchId, UUID studentId) {
        JobMatch jobMatch = jobMatchRepository.findById(jobMatchId)
                .orElseThrow(() -> new RuntimeException("Job match not found"));
        
        // Verify ownership
        if (!jobMatch.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("You do not have permission to access this job match");
        }
        
        jobMatch.setViewed(true);
        return jobMatchRepository.save(jobMatch);
    }

    public boolean hasGeminiApiKey() {
        return geminiApiKey != null && !geminiApiKey.trim().isEmpty();
    }
    
    public String generateSkillMatchAnalysis(List<String> studentSkills, List<String> jobSkills) {
        // Check if API key is configured
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            logGeminiApiMissingKeyError("skill match");
            return generateBasicSkillMatchAnalysis(studentSkills, jobSkills);
        }
        
        HttpHeaders headers = createGeminiHeaders();
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an AI job matcher with expertise in NLP-based skill analysis. ");
        prompt.append("Your task is to analyze the compatibility between a student's skills and job required skills ");
        prompt.append("using advanced natural language processing techniques. ");
        prompt.append("Apply the following NLP approaches in your analysis:\n");
        prompt.append("1. Semantic similarity measurement between skill sets\n");
        prompt.append("2. Skill taxonomy and hierarchical relationships\n");
        prompt.append("3. Entity recognition to identify and categorize technologies\n");
        prompt.append("4. Contextual understanding of skill domains and relationships\n\n");
        
        prompt.append("Provide a detailed analysis of the match, focusing on strengths and gaps. ");
        prompt.append("Be specific about which skills match and which are missing. Also suggest how the student could improve their profile. ");
        prompt.append("Include a final match percentage (1-100%) at the end.\n\n");
        
        prompt.append("STUDENT SKILLS:\n");
        prompt.append(String.join(", ", studentSkills)).append("\n\n");
        
        prompt.append("JOB REQUIRED SKILLS:\n");
        prompt.append(String.join(", ", jobSkills)).append("\n\n");
        
        prompt.append("NLP ANALYSIS INSTRUCTIONS:\n");
        prompt.append("1. Perform semantic similarity analysis:\n");
        prompt.append("   - Measure direct matches between identical skills\n");
        prompt.append("   - Identify semantically similar skills (e.g., 'React' and 'React.js')\n");
        prompt.append("   - Calculate semantic proximity between related skills (e.g., React and Angular)\n\n");
        
        prompt.append("2. Apply skill taxonomy understanding:\n");
        prompt.append("   - Group skills by domains: frontend, backend, database, cloud, etc.\n");
        prompt.append("   - Identify parent-child relationships (e.g., JavaScript → React)\n");
        prompt.append("   - Recognize skill clusters that indicate domain expertise\n\n");
        
        prompt.append("3. Analyze skill relevance and transferability:\n");
        prompt.append("   - Identify which skills match directly\n");
        prompt.append("   - Determine which skills are related/transferable\n");
        prompt.append("   - Evaluate the learning curve for missing skills\n\n");
        
        prompt.append("4. Format your response with clear sections:\n");
        prompt.append("   - Semantic Match Analysis: Overview of skill compatibility based on meaning\n");
        prompt.append("   - Direct Matches: Skills that match exactly\n");
        prompt.append("   - Related Skills: Skills that are semantically related but not exact matches\n");
        prompt.append("   - Missing Skills: Critical skills the student lacks\n");
        prompt.append("   - Recommendations: Specific skills to develop with learning resources\n");
        prompt.append("   - Match Score: Final percentage (1-100%) with explanation\n\n");
        
        prompt.append("5. IMPORTANT: Consider these special cases:\n");
        prompt.append("   - Related technologies as partial matches (e.g., React is related to Angular, Java is related to Kotlin)\n");
        prompt.append("   - Skill hierarchy (knowing a framework implies some knowledge of its underlying language)\n");
        prompt.append("   - Complementary skill sets (e.g., frontend + backend = fullstack potential)\n");
        prompt.append("   - If the student has Java, Spring Boot, and React skills, and the job requires these, give at least a 60% match\n");
        
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt.toString());
        parts.add(textPart);
        
        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            Map<String, Object> response = restTemplate.postForObject(GEMINI_API_URL, entity, Map.class);
            String analysis = extractGeminiResponse(response);
            
            if (analysis != null) {
                return analysis;
            }
            logGeminiApiResponseError("skill match", response);
        } catch (Exception e) {
            logGeminiApiError("skill match", e);
        }
        
        // Fallback to basic analysis if API call fails
        return generateBasicSkillMatchAnalysis(studentSkills, jobSkills);
    }
    
    private String generateBasicSkillMatchAnalysis(List<String> studentSkills, List<String> jobSkills) {
        StringBuilder analysis = new StringBuilder();
        analysis.append("## Skill Match Analysis\n\n");
        
        // Get framework-language relationships for better matching
        Map<String, List<String>> frameworkLanguageMap = getFrameworkLanguageMap();
        
        // Calculate direct and related matches
        List<String> directMatches = new ArrayList<>();
        List<String> relatedMatches = new ArrayList<>();
        List<String> frameworkLanguageMatches = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();
        
        // First pass: Find direct matches
        for (String jobSkill : jobSkills) {
            String jobSkillLower = jobSkill.toLowerCase();
            
            // Check for direct matches
            boolean matched = false;
            for (String studentSkill : studentSkills) {
                String studentSkillLower = studentSkill.toLowerCase();
                if (jobSkillLower.equals(studentSkillLower)) {
                    directMatches.add(jobSkill);
                    matched = true;
                    break;
                }
            }
            
            if (!matched) {
                // Check for partial matches (one contains the other)
                for (String studentSkill : studentSkills) {
                    String studentSkillLower = studentSkill.toLowerCase();
                    if (jobSkillLower.contains(studentSkillLower) || studentSkillLower.contains(jobSkillLower)) {
                        relatedMatches.add(jobSkill + " (related to " + studentSkill + ")");
                        matched = true;
                        break;
                    }
                }
            }
            
            if (!matched) {
                // Check for framework-language relationships
                boolean frameworkMatched = false;
                
                // Check if job skill is a framework and student has the related language
                for (Map.Entry<String, List<String>> entry : frameworkLanguageMap.entrySet()) {
                    String framework = entry.getKey();
                    List<String> languages = entry.getValue();
                    
                    if (jobSkillLower.contains(framework)) {
                        // Job requires a framework, check if student knows the related language
                        for (String language : languages) {
                            for (String studentSkill : studentSkills) {
                                String studentSkillLower = studentSkill.toLowerCase();
                                if (studentSkillLower.contains(language)) {
                                    frameworkLanguageMatches.add(jobSkill + " (via " + studentSkill + ")");
                                    frameworkMatched = true;
                                    break;
                                }
                            }
                            if (frameworkMatched) break;
                        }
                    }
                    
                    if (frameworkMatched) break;
                    
                    // Check if job requires a language and student knows a related framework
                    for (String language : languages) {
                        if (jobSkillLower.contains(language)) {
                            // Job requires a language, check if student knows the related framework
                            for (String studentSkill : studentSkills) {
                                String studentSkillLower = studentSkill.toLowerCase();
                                if (studentSkillLower.contains(framework)) {
                                    frameworkLanguageMatches.add(jobSkill + " (via " + studentSkill + ")");
                                    frameworkMatched = true;
                                    break;
                                }
                            }
                            if (frameworkMatched) break;
                        }
                    }
                    
                    if (frameworkMatched) break;
                }
                
                if (!frameworkMatched) {
                    missingSkills.add(jobSkill);
                }
            }
        }
        
        // Calculate match percentage
        double directMatchWeight = 1.0;
        double relatedMatchWeight = 0.7;
        double frameworkLanguageWeight = 0.5;
        
        double weightedMatches = (directMatches.size() * directMatchWeight) + 
                               (relatedMatches.size() * relatedMatchWeight) + 
                               (frameworkLanguageMatches.size() * frameworkLanguageWeight);
        
        double matchPercentage = jobSkills.isEmpty() ? 0 : (weightedMatches / jobSkills.size()) * 100;
        
        // Special case for Java, Spring Boot, and React skills
        boolean hasJava = false;
        boolean hasSpring = false;
        boolean hasReact = false;
        
        for (String skill : studentSkills) {
            String lowerSkill = skill.toLowerCase();
            if (lowerSkill.contains("java")) hasJava = true;
            if (lowerSkill.contains("spring")) hasSpring = true;
            if (lowerSkill.contains("react")) hasReact = true;
        }
        
        boolean jobNeedsJava = false;
        boolean jobNeedsSpring = false;
        boolean jobNeedsReact = false;
        
        for (String skill : jobSkills) {
            String lowerSkill = skill.toLowerCase();
            if (lowerSkill.contains("java")) jobNeedsJava = true;
            if (lowerSkill.contains("spring")) jobNeedsSpring = true;
            if (lowerSkill.contains("react")) jobNeedsReact = true;
        }
        
        // If job requires Java, Spring, React and student has them, ensure at least 60% match
        if ((hasJava && jobNeedsJava) && 
            (hasSpring && jobNeedsSpring) && 
            (hasReact && jobNeedsReact)) {
            matchPercentage = Math.max(matchPercentage, 60.0);
            analysis.append("### Special Match Bonus\n");
            analysis.append("You have Java, Spring Boot, and React skills which are highly valued for this position.\n\n");
        }
        
        // Round to nearest integer
        int roundedMatchPercentage = (int) Math.round(matchPercentage);
        
        // Add match details
        analysis.append("### Student Skills\n");
        analysis.append(String.join(", ", studentSkills)).append("\n\n");
        
        analysis.append("### Job Required Skills\n");
        analysis.append(String.join(", ", jobSkills)).append("\n\n");
        
        analysis.append("### Skill Match Analysis\n\n");
        
        analysis.append("#### Direct Matches\n");
        if (!directMatches.isEmpty()) {
            for (String match : directMatches) {
                analysis.append("- ").append(match).append("\n");
            }
        } else {
            analysis.append("- No direct skill matches found\n");
        }
        analysis.append("\n");
        
        analysis.append("#### Related Matches\n");
        if (!relatedMatches.isEmpty()) {
            for (String match : relatedMatches) {
                analysis.append("- ").append(match).append("\n");
            }
        } else {
            analysis.append("- No related skill matches found\n");
        }
        analysis.append("\n");
        
        analysis.append("#### Framework-Language Relationships\n");
        if (!frameworkLanguageMatches.isEmpty()) {
            analysis.append("Even though you don't have exact skill matches, your knowledge of related technologies is valuable:\n");
            for (String match : frameworkLanguageMatches) {
                analysis.append("- ").append(match).append("\n");
            }
        } else {
            analysis.append("- No framework-language relationships found\n");
        }
        analysis.append("\n");
        
        analysis.append("#### Missing Skills\n");
        if (!missingSkills.isEmpty()) {
            for (String skill : missingSkills) {
                analysis.append("- ").append(skill).append("\n");
            }
        } else {
            analysis.append("- No missing skills! You have all the required skills.\n");
        }
        analysis.append("\n");
        
        // Add learning path recommendations
        if (!missingSkills.isEmpty()) {
            analysis.append("### Learning Path Recommendations\n\n");
            analysis.append("To improve your match for this position, consider developing these skills:\n");
            
            int recommendCount = Math.min(3, missingSkills.size());
            for (int i = 0; i < recommendCount; i++) {
                String skill = missingSkills.get(i);
                analysis.append("- ").append(skill).append("\n");
                
                // Add learning resource suggestions for common skills
                String skillLower = skill.toLowerCase();
                if (skillLower.contains("react")) {
                    analysis.append("  - Resource: React official documentation or Udemy React courses\n");
                } else if (skillLower.contains("java")) {
                    analysis.append("  - Resource: Oracle Java tutorials or Codecademy Java course\n");
                } else if (skillLower.contains("spring")) {
                    analysis.append("  - Resource: Spring.io guides or Baeldung Spring tutorials\n");
                } else if (skillLower.contains("python")) {
                    analysis.append("  - Resource: Python.org documentation or Coursera Python specialization\n");
                } else if (skillLower.contains("javascript") || skillLower.contains("js")) {
                    analysis.append("  - Resource: MDN JavaScript documentation or freeCodeCamp JavaScript course\n");
                } else if (skillLower.contains("sql")) {
                    analysis.append("  - Resource: W3Schools SQL tutorial or SQLZoo interactive exercises\n");
                }
            }
            analysis.append("\n");
        }
        
        // Add final match percentage with explanation
        analysis.append("### Overall Match\n\n");
        analysis.append("Your skills match approximately ").append(roundedMatchPercentage).append("% of the job requirements.\n\n");
        
        // Add match quality assessment
        if (roundedMatchPercentage >= 80) {
            analysis.append("**Excellent match!** You have most of the skills required for this position.");
        } else if (roundedMatchPercentage >= 60) {
            analysis.append("**Good match!** You have many of the skills required, with some areas for development.");
        } else if (roundedMatchPercentage >= 40) {
            analysis.append("**Moderate match.** You have some relevant skills, but would benefit from developing more expertise in the missing areas.");
        } else {
            analysis.append("**Basic match.** This position requires several skills you don't currently have, but with targeted learning, you could become a stronger candidate.");
        }
        
        return analysis.toString();
    }
    
    public String analyzeGitHubProjects(String githubUrl, String githubProjects, List<String> jobSkills) {
        if ((githubUrl == null || githubUrl.isEmpty()) && (githubProjects == null || githubProjects.isEmpty())) {
            return "No GitHub information available for analysis.";
        }
        
        // Check if API key is configured
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            logGeminiApiMissingKeyError("GitHub project");
            return generateBasicGitHubAnalysis(githubUrl, githubProjects, jobSkills);
        }
        
        HttpHeaders headers = createGeminiHeaders();
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an AI technical recruiter specializing in GitHub project analysis using advanced NLP techniques. ");
        prompt.append("Analyze the student's GitHub profile and projects in relation to the job skills required using semantic analysis. ");
        prompt.append("Apply the following NLP approaches in your analysis:\n");
        prompt.append("1. Semantic similarity analysis between GitHub project technologies and job required skills\n");
        prompt.append("2. Entity extraction to identify programming languages, frameworks, and tools used in projects\n");
        prompt.append("3. Topic modeling to understand the domains and specializations demonstrated\n");
        prompt.append("4. Contextual understanding of technology relationships and hierarchies\n\n");
        
        prompt.append("Provide insights on how their GitHub work demonstrates relevant skills for the job. ");
        prompt.append("Focus on code quality, project complexity, and skill demonstration.\n\n");
        
        if (githubUrl != null && !githubUrl.isEmpty()) {
            prompt.append("GITHUB URL: ").append(githubUrl).append("\n\n");
        }
        
        if (githubProjects != null && !githubProjects.isEmpty()) {
            prompt.append("GITHUB PROJECTS: ").append(githubProjects).append("\n\n");
        }
        
        prompt.append("JOB REQUIRED SKILLS: ").append(String.join(", ", jobSkills)).append("\n\n");
        
        prompt.append("NLP ANALYSIS INSTRUCTIONS:\n");
        prompt.append("1. Perform semantic extraction and analysis:\n");
        prompt.append("   - Extract technologies, languages, and frameworks mentioned in GitHub projects\n");
        prompt.append("   - Identify semantic relationships between extracted technologies and job skills\n");
        prompt.append("   - Consider technology hierarchies (e.g., React is a JavaScript framework)\n\n");
        
        prompt.append("2. Analyze project complexity and relevance:\n");
        prompt.append("   - Evaluate the complexity of projects based on technologies used\n");
        prompt.append("   - Assess how directly the projects relate to the job requirements\n");
        prompt.append("   - Consider the recency and activity level of projects\n\n");
        
        prompt.append("3. Identify skill demonstrations:\n");
        prompt.append("   - Determine which job skills are directly evidenced in the GitHub work\n");
        prompt.append("   - Identify related skills that suggest transferable knowledge\n");
        prompt.append("   - Evaluate the depth of skill implementation (basic usage vs. advanced application)\n\n");
        
        prompt.append("4. Format your response with clear sections:\n");
        prompt.append("   - Project Technology Analysis: Technologies identified and their relation to job skills\n");
        prompt.append("   - Skill Evidence Assessment: How projects demonstrate required job skills\n");
        prompt.append("   - Development Strengths: Areas where the GitHub profile shows strong capabilities\n");
        prompt.append("   - Improvement Suggestions: How to better showcase skills through GitHub\n");
        prompt.append("   - Relevance Score: A percentage (1-100%) indicating how well the GitHub profile supports the job application\n\n");
        
        prompt.append("5. IMPORTANT: Consider these special cases:\n");
        prompt.append("   - Projects using technologies related to job skills (e.g., Vue project for React job)\n");
        prompt.append("   - Implementation quality over quantity of repositories\n");
        prompt.append("   - Evidence of collaborative development (pull requests, issues, etc.)\n");
        prompt.append("   - Project documentation and code organization\n");
        
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt.toString());
        parts.add(textPart);
        
        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            Map<String, Object> response = restTemplate.postForObject(GEMINI_API_URL, entity, Map.class);
            String analysis = extractGeminiResponse(response);
            
            if (analysis != null) {
                return analysis;
            }
            logGeminiApiResponseError("GitHub project", response);
        } catch (Exception e) {
            logGeminiApiError("GitHub project", e);
        }
        
        // Fallback to basic analysis if API call fails
        return generateBasicGitHubAnalysis(githubUrl, githubProjects, jobSkills);
    }
    
    private String generateBasicGitHubAnalysis(String githubUrl, String githubProjects, List<String> jobSkills) {
        StringBuilder analysis = new StringBuilder();
        analysis.append("## GitHub Profile Analysis\n\n");
        
        // Extract project names from githubProjects JSON if available
        List<String> projectNames = new ArrayList<>();
        if (githubProjects != null && !githubProjects.isEmpty()) {
            try {
                if (githubProjects.startsWith("[") && githubProjects.endsWith("]")) {
                    // Simple extraction of project names from JSON array
                    String[] projects = githubProjects.substring(1, githubProjects.length() - 1).split("\\},\\{");
                    for (String project : projects) {
                        if (project.contains("\"name\":")) {
                            int nameStart = project.indexOf("\"name\":") + 8;
                            int nameEnd = project.indexOf("\"", nameStart);
                            if (nameEnd > nameStart) {
                                projectNames.add(project.substring(nameStart, nameEnd));
                            }
                        }
                    }
                }
            } catch (Exception e) {
                // Ignore parsing errors
            }
        }
        
        // Add GitHub URL if available
        if (githubUrl != null && !githubUrl.isEmpty()) {
            analysis.append("GitHub profile: ").append(githubUrl).append("\n\n");
        }
        
        // Add project names if available
        if (!projectNames.isEmpty()) {
            analysis.append("Projects found: ").append(String.join(", ", projectNames)).append("\n\n");
        }
        
        // Basic skill matching
        analysis.append("### Skills Assessment\n\n");
        
        // Check for common technologies in GitHub URL or projects
        List<String> potentialSkills = new ArrayList<>();
        String combinedText = (githubUrl != null ? githubUrl.toLowerCase() : "") + 
                             (githubProjects != null ? githubProjects.toLowerCase() : "");
        
        // Common programming languages and technologies to check for
        String[] commonTechs = {"java", "spring", "react", "angular", "vue", "javascript", "typescript", 
                               "python", "django", "flask", "node", "express", "php", "laravel", 
                               "ruby", "rails", "c#", ".net", "go", "rust", "kotlin", "swift",
                               "android", "ios", "mobile", "web", "frontend", "backend", "fullstack",
                               "database", "sql", "nosql", "mongodb", "postgresql", "mysql", "oracle",
                               "aws", "azure", "gcp", "cloud", "docker", "kubernetes", "devops", "cicd"};
        
        for (String tech : commonTechs) {
            if (combinedText.contains(tech)) {
                potentialSkills.add(tech);
            }
        }
        
        // Get framework-language relationships
        Map<String, List<String>> frameworkLanguageMap = getFrameworkLanguageMap();
        
        // Match with job skills
        List<String> directMatches = new ArrayList<>();
        List<String> relatedMatches = new ArrayList<>();
        List<String> frameworkLanguageMatches = new ArrayList<>();
        
        for (String jobSkill : jobSkills) {
            String jobSkillLower = jobSkill.toLowerCase();
            
            // Check for direct matches
            boolean matched = false;
            if (combinedText.contains(jobSkillLower)) {
                directMatches.add(jobSkill);
                matched = true;
            }
            
            if (!matched) {
                // Check for related skills
                for (String potentialSkill : potentialSkills) {
                    if (jobSkillLower.contains(potentialSkill) || potentialSkill.contains(jobSkillLower)) {
                        relatedMatches.add(jobSkill + " (via " + potentialSkill + ")");
                        matched = true;
                        break;
                    }
                }
            }
            
            if (!matched) {
                // Check for framework-language relationships
                for (Map.Entry<String, List<String>> entry : frameworkLanguageMap.entrySet()) {
                    String framework = entry.getKey();
                    List<String> languages = entry.getValue();
                    
                    if (jobSkillLower.contains(framework) && combinedText.contains(framework)) {
                        // Job requires a framework that's in the GitHub profile
                        frameworkLanguageMatches.add(jobSkill);
                        matched = true;
                        break;
                    }
                    
                    if (jobSkillLower.contains(framework)) {
                        // Job requires a framework, check if GitHub has the related language
                        for (String language : languages) {
                            if (combinedText.contains(language)) {
                                frameworkLanguageMatches.add(jobSkill + " (via " + language + ")");
                                matched = true;
                                break;
                            }
                        }
                    }
                    
                    if (matched) break;
                    
                    // Check if job requires a language and GitHub has the related framework
                    for (String language : languages) {
                        if (jobSkillLower.contains(language) && combinedText.contains(framework)) {
                            frameworkLanguageMatches.add(jobSkill + " (via " + framework + ")");
                            matched = true;
                            break;
                        }
                    }
                    
                    if (matched) break;
                }
            }
        }
        
        // Combine all matches for percentage calculation
        List<String> allMatches = new ArrayList<>();
        allMatches.addAll(directMatches);
        allMatches.addAll(relatedMatches);
        allMatches.addAll(frameworkLanguageMatches);
        
        // Add matching skills to analysis
        if (!directMatches.isEmpty()) {
            analysis.append("Direct skill matches: ").append(String.join(", ", directMatches)).append("\n\n");
        }
        
        if (!relatedMatches.isEmpty()) {
            analysis.append("Related skill matches: ").append(String.join(", ", relatedMatches)).append("\n\n");
        }
        
        if (!frameworkLanguageMatches.isEmpty()) {
            analysis.append("Framework-language relationships: ").append(String.join(", ", frameworkLanguageMatches)).append("\n\n");
        }
        
        if (!allMatches.isEmpty()) {
            // Calculate match percentage with weighted scoring
            double directMatchWeight = 1.0;
            double relatedMatchWeight = 0.7;
            double frameworkLanguageWeight = 0.5;
            
            double weightedMatches = (directMatches.size() * directMatchWeight) + 
                                   (relatedMatches.size() * relatedMatchWeight) + 
                                   (frameworkLanguageMatches.size() * frameworkLanguageWeight);
            
            int matchPercentage = Math.min(100, (int)Math.round((weightedMatches / jobSkills.size()) * 100));
            analysis.append("GitHub profile demonstrates approximately ").append(matchPercentage).append("% of the required job skills.\n\n");
            
            // Add recommendations
            analysis.append("### Recommendations\n\n");
            if (matchPercentage < 50) {
                analysis.append("To better showcase your skills for this job, consider:\n");
                analysis.append("- Creating more repositories that demonstrate ").append(jobSkills.get(0));
                if (jobSkills.size() > 1) {
                    analysis.append(" and ").append(jobSkills.get(1));
                }
                analysis.append("\n");
                analysis.append("- Adding detailed README files to your projects explaining the technologies used\n");
                analysis.append("- Pinning your most relevant projects to the top of your GitHub profile\n");
            } else {
                analysis.append("Your GitHub profile effectively demonstrates many of the required skills. To further enhance it:\n");
                analysis.append("- Consider adding more detailed documentation to your projects\n");
                analysis.append("- Ensure your READMEs highlight the technologies used that are relevant to this job\n");
            }
        } else {
            analysis.append("No direct matches found between GitHub profile and job required skills.\n\n");
            analysis.append("GitHub profile demonstrates approximately 0% of the required job skills.\n\n");
            
            // Add recommendations
            analysis.append("### Recommendations\n\n");
            analysis.append("To improve your GitHub profile for this job, consider:\n");
            analysis.append("- Creating repositories that showcase ").append(String.join(", ", jobSkills.subList(0, Math.min(3, jobSkills.size())))).append("\n");
            analysis.append("- Contributing to open-source projects related to these technologies\n");
            analysis.append("- Adding a detailed profile README highlighting your experience with relevant skills\n");
        }
        
    
        
        return analysis.toString();
    }
    
    public String analyzePortfolio(String portfolioUrl, List<String> jobSkills) {
        if (portfolioUrl == null || portfolioUrl.isEmpty()) {
            return "No portfolio URL available for analysis.";
        }
        
        // Check if API key is configured
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            logGeminiApiMissingKeyError("portfolio");
            return generateBasicPortfolioAnalysis(portfolioUrl, jobSkills);
        }
        
        HttpHeaders headers = createGeminiHeaders();
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an AI portfolio analyst for job applications with expertise in NLP techniques. ");
        prompt.append("Analyze the student's portfolio URL in relation to the job skills required using semantic analysis. ");
        prompt.append("Apply the following NLP approaches in your analysis:\n");
        prompt.append("1. Named entity recognition to identify technologies, frameworks, and domains\n");
        prompt.append("2. Semantic similarity analysis between portfolio content and job requirements\n");
        prompt.append("3. Domain classification to understand the portfolio's specialization areas\n");
        prompt.append("4. Contextual understanding of technology relationships and hierarchies\n\n");
        
        prompt.append("Provide insights on how their portfolio demonstrates relevant skills for the job. ");
        prompt.append("Focus on project quality, skill demonstration, and presentation.\n\n");
        
        prompt.append("PORTFOLIO URL: ").append(portfolioUrl).append("\n\n");
        prompt.append("JOB REQUIRED SKILLS: ").append(String.join(", ", jobSkills)).append("\n\n");
        
        prompt.append("NLP ANALYSIS INSTRUCTIONS:\n");
        prompt.append("1. Perform URL and domain analysis:\n");
        prompt.append("   - Extract domain information and hosting platform (GitHub Pages, Netlify, etc.)\n");
        prompt.append("   - Identify technology indicators in the URL structure\n");
        prompt.append("   - Infer potential technologies based on hosting platform\n\n");
        
        prompt.append("2. Apply semantic understanding to portfolio content:\n");
        prompt.append("   - Identify likely technologies used to build the portfolio itself\n");
        prompt.append("   - Recognize project types and domains represented\n");
        prompt.append("   - Assess the sophistication level of the implementation\n\n");
        
        prompt.append("3. Analyze skill representation:\n");
        prompt.append("   - Determine which job skills are likely demonstrated in the portfolio\n");
        prompt.append("   - Identify related skills that suggest transferable knowledge\n");
        prompt.append("   - Evaluate the depth of skill implementation (basic vs. advanced)\n\n");
        
        prompt.append("4. Format your response with clear sections:\n");
        prompt.append("   - Portfolio Technology Analysis: Technologies identified and their relation to job skills\n");
        prompt.append("   - Skill Evidence Assessment: How the portfolio demonstrates required job skills\n");
        prompt.append("   - Presentation Strengths: How effectively skills are showcased\n");
        prompt.append("   - Improvement Suggestions: How to better demonstrate skills through the portfolio\n");
        prompt.append("   - Relevance Score: A percentage (1-100%) indicating how well the portfolio supports the job application\n\n");
        
        prompt.append("5. IMPORTANT: Consider these special cases:\n");
        prompt.append("   - Portfolio built with technologies related to job skills\n");
        prompt.append("   - Design quality as an indicator of frontend skills\n");
        prompt.append("   - UX considerations as evidence of user-centered thinking\n");
        prompt.append("   - Portfolio structure as evidence of organizational skills\n");
        
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt.toString());
        parts.add(textPart);
        
        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            Map<String, Object> response = restTemplate.postForObject(GEMINI_API_URL, entity, Map.class);
            String analysis = extractGeminiResponse(response);
            
            if (analysis != null) {
                return analysis;
            }
            logGeminiApiResponseError("portfolio", response);
        } catch (Exception e) {
            logGeminiApiError("portfolio", e);
        }
        
        // Fallback to basic analysis if API call fails
        return generateBasicPortfolioAnalysis(portfolioUrl, jobSkills);
    }
    
    private String generateBasicPortfolioAnalysis(String portfolioUrl, List<String> jobSkills) {
        StringBuilder analysis = new StringBuilder();
        analysis.append("## Portfolio Analysis\n\n");
        
        // Add portfolio URL
        analysis.append("Portfolio URL: ").append(portfolioUrl).append("\n\n");
        
        // Extract domain information
        String domain = "";
        try {
            URI uri = new URI(portfolioUrl);
            domain = uri.getHost();
        } catch (Exception e) {
            // If URL parsing fails, just use the raw URL
            domain = portfolioUrl;
        }
        
        // Basic portfolio assessment
        analysis.append("### Portfolio Assessment\n\n");
        analysis.append("A portfolio website is a strong indicator of a candidate's dedication to showcasing their work ");
        analysis.append("and technical abilities. Having a dedicated portfolio suggests the candidate takes their ");
        analysis.append("professional presentation seriously.\n\n");
        
        // Check if portfolio is on a common platform
        if (domain != null) {
            domain = domain.toLowerCase();
            if (domain.contains("github.io")) {
                analysis.append("This portfolio is hosted on GitHub Pages, which demonstrates familiarity with Git and web deployment.\n\n");
            } else if (domain.contains("netlify")) {
                analysis.append("This portfolio is hosted on Netlify, which suggests experience with modern web deployment pipelines.\n\n");
            } else if (domain.contains("vercel")) {
                analysis.append("This portfolio is hosted on Vercel, which indicates experience with Next.js and modern React deployment.\n\n");
            } else if (domain.contains("heroku")) {
                analysis.append("This portfolio is hosted on Heroku, which shows experience with cloud platform deployment.\n\n");
            } else if (domain.contains("wix") || domain.contains("squarespace") || domain.contains("wordpress")) {
                analysis.append("This portfolio appears to be built using a website builder, which may indicate less technical web development experience but good design sensibilities.\n\n");
            }
        }
        
        // Skill inference based on domain
        List<String> likelySkills = new ArrayList<>();
        if (portfolioUrl.contains("react") || portfolioUrl.contains("jsx")) {
            likelySkills.add("React");
        }
        if (portfolioUrl.contains("angular")) {
            likelySkills.add("Angular");
        }
        if (portfolioUrl.contains("vue")) {
            likelySkills.add("Vue.js");
        }
        if (portfolioUrl.contains("node")) {
            likelySkills.add("Node.js");
        }
        if (portfolioUrl.contains("java")) {
            likelySkills.add("Java");
        }
        if (portfolioUrl.contains("spring")) {
            likelySkills.add("Spring");
        }
        if (portfolioUrl.contains("python")) {
            likelySkills.add("Python");
        }
        
        // Match with job skills
        List<String> matchingSkills = new ArrayList<>();
        for (String jobSkill : jobSkills) {
            String jobSkillLower = jobSkill.toLowerCase();
            if (portfolioUrl.toLowerCase().contains(jobSkillLower)) {
                matchingSkills.add(jobSkill);
            } else {
                // Check for related skills
                for (String likelySkill : likelySkills) {
                    if (jobSkillLower.contains(likelySkill.toLowerCase()) || 
                        likelySkill.toLowerCase().contains(jobSkillLower)) {
                        matchingSkills.add(jobSkill + " (potentially via " + likelySkill + ")");
                        break;
                    }
                }
            }
        }
        
        // Add matching skills to analysis
        if (!matchingSkills.isEmpty()) {
            analysis.append("Potentially matching skills based on URL analysis: ").append(String.join(", ", matchingSkills)).append("\n\n");
            
            // Calculate match percentage (lower confidence than direct analysis)
            int matchPercentage = Math.min(75, Math.round((float) matchingSkills.size() / jobSkills.size() * 100));
            analysis.append("Portfolio may demonstrate approximately ").append(matchPercentage).append("% of the required job skills.\n\n");
        } else {
            analysis.append("No direct skill matches could be inferred from the portfolio URL.\n");
            analysis.append("For a proper assessment, a manual review of the portfolio is recommended.\n\n");
            analysis.append("Portfolio relevance score: Unable to determine automatically.\n\n");
        }
        
        analysis.append("Note: This is a basic URL analysis only. For a more detailed assessment, please ensure the Gemini API is properly configured or manually review the portfolio website.");
        
        return analysis.toString();
    }
    
    public String analyzeCertifications(Set<Certification> certifications, List<String> jobSkills) {
        if (certifications == null || certifications.isEmpty()) {
            return "No certifications available for analysis.";
        }
        
        // Check if API key is configured
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            logGeminiApiMissingKeyError("certifications");
            return generateBasicCertificationsAnalysis(certifications, jobSkills);
        }
        
        HttpHeaders headers = createGeminiHeaders();
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an AI certification analyst for job applications with expertise in NLP techniques. ");
        prompt.append("Analyze the student's certifications in relation to the job skills required using semantic analysis. ");
        prompt.append("Apply the following NLP approaches in your analysis:\n");
        prompt.append("1. Named entity recognition to identify technologies, frameworks, and domains in certifications\n");
        prompt.append("2. Semantic similarity analysis between certification topics and job requirements\n");
        prompt.append("3. Knowledge graph understanding of certification hierarchies and relationships\n");
        prompt.append("4. Contextual understanding of certification value in different domains\n\n");
        
        prompt.append("Provide insights on how their certifications demonstrate relevant skills for the job. ");
        prompt.append("Focus on certification relevance, credibility, and skill validation.\n\n");
        
        prompt.append("CERTIFICATIONS:\n");
        for (Certification cert : certifications) {
            prompt.append("- ").append(cert.getName())
                .append(" (").append(cert.getIssuer()).append(")")
                .append(" - ").append(cert.getDateReceived())
                .append("\n");
        }
        prompt.append("\n");
        
        prompt.append("JOB REQUIRED SKILLS: ").append(String.join(", ", jobSkills)).append("\n\n");
        
        prompt.append("NLP ANALYSIS INSTRUCTIONS:\n");
        prompt.append("1. Perform certification entity extraction:\n");
        prompt.append("   - Extract technologies, platforms, and domains from certification names\n");
        prompt.append("   - Identify certification issuers and their industry reputation\n");
        prompt.append("   - Recognize certification levels and specializations\n\n");
        
        prompt.append("2. Apply semantic understanding to certification value:\n");
        prompt.append("   - Map certifications to skill domains and competencies\n");
        prompt.append("   - Assess certification difficulty and industry recognition\n");
        prompt.append("   - Evaluate certification recency and relevance to current practices\n\n");
        
        prompt.append("3. Analyze skill validation:\n");
        prompt.append("   - Determine which job skills are formally validated by certifications\n");
        prompt.append("   - Identify related skills that are likely covered in certification curricula\n");
        prompt.append("   - Evaluate the depth of skill validation (foundational vs. expert level)\n\n");
        
        prompt.append("4. Format your response with clear sections:\n");
        prompt.append("   - Certification Analysis: Overview of certifications and their relevance\n");
        prompt.append("   - Skill Validation Assessment: How certifications validate required job skills\n");
        prompt.append("   - Certification Strengths: Areas where certifications strongly support the application\n");
        prompt.append("   - Certification Gaps: Additional certifications that would strengthen the application\n");
        prompt.append("   - Relevance Score: A percentage (1-100%) indicating how well the certifications support the job application\n\n");
        
        prompt.append("5. IMPORTANT: Consider these special cases:\n");
        prompt.append("   - Industry-standard certifications that carry significant weight\n");
        prompt.append("   - Certifications that cover multiple skill domains\n");
        prompt.append("   - Complementary certifications that demonstrate breadth of knowledge\n");
        prompt.append("   - Certification progression that shows commitment to professional development\n");
        
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt.toString());
        parts.add(textPart);
        
        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            Map<String, Object> response = restTemplate.postForObject(GEMINI_API_URL, entity, Map.class);
            String analysis = extractGeminiResponse(response);
            
            if (analysis != null) {
                return analysis;
            }
            logGeminiApiResponseError("certifications", response);
        } catch (Exception e) {
            logGeminiApiError("certifications", e);
        }
        
        // Fallback to basic analysis if API call fails
        return generateBasicCertificationsAnalysis(certifications, jobSkills);
    }
    
    private String generateBasicCertificationsAnalysis(Set<Certification> certifications, List<String> jobSkills) {
        StringBuilder analysis = new StringBuilder();
        analysis.append("## Certifications Analysis\n\n");
        
        // List all certifications
        analysis.append("### Certifications Summary\n\n");
        for (Certification cert : certifications) {
            analysis.append("- ").append(cert.getName())
                .append(" (").append(cert.getIssuer()).append(")")
                .append(" - ").append(cert.getDateReceived());
            
            if (cert.getExpiryDate() != null) {
                analysis.append(" to ").append(cert.getExpiryDate());
            }
            analysis.append("\n");
        }
        analysis.append("\n");
        
        // Analyze certifications for skill matches
        Map<String, List<String>> certSkillMap = new HashMap<>();
        
        // Common certification-skill mappings
        certSkillMap.put("aws", Arrays.asList("AWS", "Cloud", "DevOps", "Amazon Web Services", "S3", "EC2", "Lambda"));
        certSkillMap.put("azure", Arrays.asList("Azure", "Cloud", "Microsoft", "DevOps"));
        certSkillMap.put("google cloud", Arrays.asList("GCP", "Cloud", "Google Cloud", "DevOps"));
        certSkillMap.put("java", Arrays.asList("Java", "Spring", "J2EE", "JVM", "Backend"));
        certSkillMap.put("oracle", Arrays.asList("Java", "Oracle", "SQL", "Database"));
        certSkillMap.put("spring", Arrays.asList("Spring", "Spring Boot", "Java", "Backend"));
        certSkillMap.put("microsoft", Arrays.asList(".NET", "C#", "Azure", "SQL Server"));
        certSkillMap.put("scrum", Arrays.asList("Agile", "Scrum", "Project Management"));
        certSkillMap.put("agile", Arrays.asList("Agile", "Scrum", "Project Management"));
        certSkillMap.put("pmp", Arrays.asList("Project Management", "Leadership"));
        certSkillMap.put("security", Arrays.asList("Cybersecurity", "Security", "InfoSec", "Network Security"));
        certSkillMap.put("comptia", Arrays.asList("IT", "Security", "Networking"));
        certSkillMap.put("cisco", Arrays.asList("Networking", "CCNA", "Network Security"));
        certSkillMap.put("salesforce", Arrays.asList("Salesforce", "CRM", "Cloud"));
        certSkillMap.put("react", Arrays.asList("React", "JavaScript", "Frontend", "Web Development"));
        certSkillMap.put("angular", Arrays.asList("Angular", "JavaScript", "TypeScript", "Frontend"));
        certSkillMap.put("vue", Arrays.asList("Vue.js", "JavaScript", "Frontend"));
        certSkillMap.put("javascript", Arrays.asList("JavaScript", "Frontend", "Web Development"));
        certSkillMap.put("python", Arrays.asList("Python", "Data Science", "Backend"));
        certSkillMap.put("machine learning", Arrays.asList("Machine Learning", "AI", "Data Science", "Python"));
        certSkillMap.put("data science", Arrays.asList("Data Science", "Machine Learning", "Statistics", "Python", "R"));
        certSkillMap.put("docker", Arrays.asList("Docker", "Containers", "DevOps", "Kubernetes"));
        certSkillMap.put("kubernetes", Arrays.asList("Kubernetes", "Containers", "DevOps", "Docker"));
        
        // Find matching skills
        Set<String> matchingSkills = new HashSet<>();
        Map<String, List<String>> certificationMatches = new HashMap<>();
        
        for (Certification cert : certifications) {
            String certNameLower = cert.getName().toLowerCase();
            String issuerLower = cert.getIssuer().toLowerCase();
            
            List<String> certMatches = new ArrayList<>();
            
            // Check for direct matches in certification name and issuer
            for (Map.Entry<String, List<String>> entry : certSkillMap.entrySet()) {
                String keyword = entry.getKey();
                if (certNameLower.contains(keyword) || issuerLower.contains(keyword)) {
                    for (String skill : entry.getValue()) {
                        for (String jobSkill : jobSkills) {
                            if (jobSkill.toLowerCase().contains(skill.toLowerCase()) || 
                                skill.toLowerCase().contains(jobSkill.toLowerCase())) {
                                matchingSkills.add(jobSkill);
                                certMatches.add(jobSkill);
                            }
                        }
                    }
                }
            }
            
            if (!certMatches.isEmpty()) {
                certificationMatches.put(cert.getName(), certMatches);
            }
        }
        
        // Add skill matches to analysis
        if (!matchingSkills.isEmpty()) {
            analysis.append("### Skill Matches\n\n");
            analysis.append("The following job-required skills are supported by the candidate's certifications:\n");
            for (String skill : matchingSkills) {
                analysis.append("- ").append(skill).append("\n");
            }
            analysis.append("\n");
            
            // Show which certifications match which skills
            analysis.append("### Certification-Skill Mapping\n\n");
            for (Map.Entry<String, List<String>> entry : certificationMatches.entrySet()) {
                analysis.append("- ").append(entry.getKey()).append(" supports: ")
                    .append(String.join(", ", entry.getValue())).append("\n");
            }
            analysis.append("\n");
            
            // Calculate match percentage
            int matchPercentage = Math.min(100, Math.round((float) matchingSkills.size() / jobSkills.size() * 100));
            analysis.append("Certifications demonstrate approximately ").append(matchPercentage)
                .append("% of the required job skills.\n\n");
        } else {
            analysis.append("### Skill Matches\n\n");
            analysis.append("No direct matches found between certifications and job required skills.\n\n");
            analysis.append("Certifications demonstrate approximately 0% of the required job skills.\n\n");
        }
        
        // Recommendations
        analysis.append("### Recommendations\n\n");
        analysis.append("To strengthen the application, consider obtaining certifications in these areas:\n");
        Set<String> recommendedCerts = new HashSet<>();
        
        for (String jobSkill : jobSkills) {
            if (!matchingSkills.contains(jobSkill)) {
                String skillLower = jobSkill.toLowerCase();
                
                if (skillLower.contains("java") && !recommendedCerts.contains("Java")) {
                    recommendedCerts.add("Oracle Certified Professional Java SE Developer");
                } else if ((skillLower.contains("aws") || skillLower.contains("cloud")) && !recommendedCerts.contains("AWS")) {
                    recommendedCerts.add("AWS Certified Developer Associate");
                } else if (skillLower.contains("spring") && !recommendedCerts.contains("Spring")) {
                    recommendedCerts.add("Spring Professional Certification");
                } else if ((skillLower.contains("react") || skillLower.contains("frontend")) && !recommendedCerts.contains("Frontend")) {
                    recommendedCerts.add("Meta React Developer Certification");
                } else if (skillLower.contains("python") && !recommendedCerts.contains("Python")) {
                    recommendedCerts.add("Python Institute PCEP or PCAP Certification");
                } else if ((skillLower.contains("data") || skillLower.contains("analytics")) && !recommendedCerts.contains("Data")) {
                    recommendedCerts.add("Google Data Analytics Professional Certificate");
                } else if ((skillLower.contains("agile") || skillLower.contains("scrum")) && !recommendedCerts.contains("Agile")) {
                    recommendedCerts.add("Professional Scrum Master (PSM) Certification");
                }
            }
        }
        
        if (!recommendedCerts.isEmpty()) {
            for (String cert : recommendedCerts) {
                analysis.append("- ").append(cert).append("\n");
            }
        } else {
            analysis.append("- Current certifications appear sufficient for the job requirements\n");
        }
        
        analysis.append("\nNote: This is a basic analysis. For a more detailed assessment, please ensure the Gemini API is properly configured.");
        
        return analysis.toString();
    }
    
    public String analyzeWorkExperience(Set<WorkExperience> experiences, List<String> jobSkills) {
        if (experiences == null || experiences.isEmpty()) {
            return "No work experiences available for analysis.";
        }
        
        // Check if API key is configured
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            logGeminiApiMissingKeyError("work experience");
            return generateBasicWorkExperienceAnalysis(experiences, jobSkills);
        }
        
        HttpHeaders headers = createGeminiHeaders();
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an AI work experience analyst for job applications with expertise in NLP techniques. ");
        prompt.append("Analyze the student's work experiences in relation to the job skills required using semantic analysis. ");
        prompt.append("Apply the following NLP approaches in your analysis:\n");
        prompt.append("1. Named entity recognition to identify roles, companies, technologies, and accomplishments\n");
        prompt.append("2. Semantic similarity analysis between work descriptions and job requirements\n");
        prompt.append("3. Temporal analysis of experience progression and skill development\n");
        prompt.append("4. Contextual understanding of industry-specific terminology and roles\n\n");
        
        prompt.append("Provide insights on how their experiences demonstrate relevant skills for the job. ");
        prompt.append("Focus on transferable skills, achievements, and relevance to the job.\n\n");
        
        prompt.append("WORK EXPERIENCES:\n");
        for (WorkExperience exp : experiences) {
            prompt.append("- ").append(exp.getTitle())
                .append(" at ").append(exp.getCompany())
                .append(" (").append(exp.getStartDate());
            
            if (exp.getEndDate() != null) {
                prompt.append(" to ").append(exp.getEndDate());
            } else {
                prompt.append(" to Present");
            }
            
            prompt.append(")\n");
            
            if (exp.getDescription() != null && !exp.getDescription().isEmpty()) {
                prompt.append("  Description: ").append(exp.getDescription()).append("\n");
            }
        }
        prompt.append("\n");
        
        prompt.append("JOB REQUIRED SKILLS: ").append(String.join(", ", jobSkills)).append("\n\n");
        
        prompt.append("NLP ANALYSIS INSTRUCTIONS:\n");
        prompt.append("1. Perform experience entity extraction:\n");
        prompt.append("   - Extract job titles, roles, responsibilities, and achievements\n");
        prompt.append("   - Identify technologies, tools, and methodologies mentioned\n");
        prompt.append("   - Recognize industry sectors and domains of expertise\n\n");
        
        prompt.append("2. Apply semantic understanding to experience value:\n");
        prompt.append("   - Map job roles to skill domains and competencies\n");
        prompt.append("   - Assess experience depth and progression over time\n");
        prompt.append("   - Evaluate relevance of past roles to the target position\n\n");
        
        prompt.append("3. Analyze skill evidence:\n");
        prompt.append("   - Determine which job skills are directly evidenced in work history\n");
        prompt.append("   - Identify transferable skills from different domains or roles\n");
        prompt.append("   - Evaluate the depth of skill application (basic usage vs. leadership)\n\n");
        
        prompt.append("4. Format your response with clear sections:\n");
        prompt.append("   - Experience Analysis: Overview of work history and its relevance\n");
        prompt.append("   - Skill Evidence Assessment: How work history demonstrates required job skills\n");
        prompt.append("   - Professional Strengths: Areas where experience strongly supports the application\n");
        prompt.append("   - Experience Gaps: Areas where additional experience would strengthen the application\n");
        prompt.append("   - Relevance Score: A percentage (1-100%) indicating how well the work experience supports the job application\n\n");
        
        prompt.append("5. IMPORTANT: Consider these special cases:\n");
        prompt.append("   - Leadership and management experience\n");
        prompt.append("   - Project-based accomplishments that demonstrate multiple skills\n");
        prompt.append("   - Experience progression that shows career growth\n");
        prompt.append("   - Industry-specific experience that may be particularly valuable\n");
        
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt.toString());
        parts.add(textPart);
        
        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            Map<String, Object> response = restTemplate.postForObject(GEMINI_API_URL, entity, Map.class);
            String analysis = extractGeminiResponse(response);
            
            if (analysis != null) {
                return analysis;
            }
            logGeminiApiResponseError("work experience", response);
        } catch (Exception e) {
            logGeminiApiError("work experience", e);
        }
        
        // Fallback to basic analysis if API call fails
        return generateBasicWorkExperienceAnalysis(experiences, jobSkills);
    }
    
    private String generateBasicWorkExperienceAnalysis(Set<WorkExperience> experiences, List<String> jobSkills) {
        StringBuilder analysis = new StringBuilder();
        analysis.append("## Work Experience Analysis\n\n");
        
        // List all work experiences
        analysis.append("### Work Experience Summary\n\n");
        for (WorkExperience exp : experiences) {
            analysis.append("- ").append(exp.getTitle())
                .append(" at ").append(exp.getCompany())
                .append(" (").append(exp.getStartDate());
            
            if (exp.getEndDate() != null) {
                analysis.append(" to ").append(exp.getEndDate());
            } else {
                analysis.append(" to Present");
            }
            
            analysis.append(")\n");
            
            if (exp.getDescription() != null && !exp.getDescription().isEmpty()) {
                analysis.append("  Description: ").append(exp.getDescription()).append("\n");
            }
        }
        analysis.append("\n");
        
        // Calculate total experience duration in months
        int totalMonths = 0;
        for (WorkExperience exp : experiences) {
            // Calculate months between start and end date
            int months = 0;
            if (exp.getStartDate() != null) {
                if (exp.getEndDate() != null) {
                    months = (exp.getEndDate().getYear() - exp.getStartDate().getYear()) * 12 + 
                             (exp.getEndDate().getMonthValue() - exp.getStartDate().getMonthValue());
                } else {
                    // If current position, calculate months until now
                    java.time.LocalDate now = java.time.LocalDate.now();
                    months = (now.getYear() - exp.getStartDate().getYear()) * 12 + 
                             (now.getMonthValue() - exp.getStartDate().getMonthValue());
                }
            }
            totalMonths += Math.max(0, months);
        }
        
        int years = totalMonths / 12;
        int remainingMonths = totalMonths % 12;
        
        analysis.append("Total work experience: ");
        if (years > 0) {
            analysis.append(years).append(" year").append(years > 1 ? "s" : "");
            if (remainingMonths > 0) {
                analysis.append(" and ");
            }
        }
        if (remainingMonths > 0 || years == 0) {
            analysis.append(remainingMonths).append(" month").append(remainingMonths != 1 ? "s" : "");
        }
        analysis.append("\n\n");
        
        // Analyze work experience for skill matches
        Map<String, List<String>> roleSkillMap = new HashMap<>();
        
        // Common role-skill mappings
        roleSkillMap.put("developer", Arrays.asList("Programming", "Software Development", "Coding", "Debugging"));
        roleSkillMap.put("software", Arrays.asList("Programming", "Software Development", "Coding", "Debugging"));
        roleSkillMap.put("engineer", Arrays.asList("Engineering", "Problem Solving", "Technical Design"));
        roleSkillMap.put("frontend", Arrays.asList("HTML", "CSS", "JavaScript", "UI/UX", "React", "Angular", "Vue"));
        roleSkillMap.put("backend", Arrays.asList("Server-side", "API", "Database", "Java", "Python", "PHP", "Node.js"));
        roleSkillMap.put("fullstack", Arrays.asList("Frontend", "Backend", "Full-stack", "End-to-end"));
        roleSkillMap.put("web", Arrays.asList("Web Development", "HTML", "CSS", "JavaScript", "Web Applications"));
        roleSkillMap.put("mobile", Arrays.asList("Mobile Development", "iOS", "Android", "React Native", "Flutter"));
        roleSkillMap.put("data", Arrays.asList("Data Analysis", "Data Science", "SQL", "Statistics", "Analytics"));
        roleSkillMap.put("devops", Arrays.asList("CI/CD", "Docker", "Kubernetes", "Cloud", "Infrastructure"));
        roleSkillMap.put("qa", Arrays.asList("Testing", "Quality Assurance", "Test Automation"));
        roleSkillMap.put("test", Arrays.asList("Testing", "Quality Assurance", "Test Automation"));
        roleSkillMap.put("project", Arrays.asList("Project Management", "Leadership", "Coordination", "Planning"));
        roleSkillMap.put("manager", Arrays.asList("Management", "Leadership", "Team Lead", "Supervision"));
        roleSkillMap.put("design", Arrays.asList("UI/UX Design", "User Experience", "Graphic Design"));
        roleSkillMap.put("analyst", Arrays.asList("Analysis", "Requirements", "Business Analysis"));
        roleSkillMap.put("security", Arrays.asList("Cybersecurity", "Information Security", "Security Analysis"));
        roleSkillMap.put("cloud", Arrays.asList("AWS", "Azure", "GCP", "Cloud Computing", "Cloud Architecture"));
        roleSkillMap.put("database", Arrays.asList("SQL", "NoSQL", "Database Design", "Data Modeling"));
        roleSkillMap.put("ai", Arrays.asList("Artificial Intelligence", "Machine Learning", "Deep Learning"));
        roleSkillMap.put("machine learning", Arrays.asList("ML", "AI", "Data Science", "Algorithms"));
        
        // Find matching skills
        Set<String> matchingSkills = new HashSet<>();
        Map<String, List<String>> experienceMatches = new HashMap<>();
        
        for (WorkExperience exp : experiences) {
            String titleLower = exp.getTitle().toLowerCase();
            String companyLower = exp.getCompany().toLowerCase();
            String descLower = exp.getDescription() != null ? exp.getDescription().toLowerCase() : "";
            
            List<String> expMatches = new ArrayList<>();
            
            // Check for direct matches in job title and description
            for (Map.Entry<String, List<String>> entry : roleSkillMap.entrySet()) {
                String keyword = entry.getKey();
                if (titleLower.contains(keyword) || descLower.contains(keyword)) {
                    for (String skill : entry.getValue()) {
                        for (String jobSkill : jobSkills) {
                            if (jobSkill.toLowerCase().contains(skill.toLowerCase()) || 
                                skill.toLowerCase().contains(jobSkill.toLowerCase())) {
                                matchingSkills.add(jobSkill);
                                expMatches.add(jobSkill);
                            }
                        }
                    }
                }
            }
            
            // Check for direct matches with job skills
            for (String jobSkill : jobSkills) {
                String skillLower = jobSkill.toLowerCase();
                if (titleLower.contains(skillLower) || descLower.contains(skillLower)) {
                    matchingSkills.add(jobSkill);
                    expMatches.add(jobSkill);
                }
            }
            
            if (!expMatches.isEmpty()) {
                experienceMatches.put(exp.getTitle() + " at " + exp.getCompany(), expMatches);
            }
        }
        
        // Add skill matches to analysis
        if (!matchingSkills.isEmpty()) {
            analysis.append("### Skill Matches\n\n");
            analysis.append("The following job-required skills are evidenced in the candidate's work experience:\n");
            for (String skill : matchingSkills) {
                analysis.append("- ").append(skill).append("\n");
            }
            analysis.append("\n");
            
            // Show which experiences match which skills
            analysis.append("### Experience-Skill Mapping\n\n");
            for (Map.Entry<String, List<String>> entry : experienceMatches.entrySet()) {
                analysis.append("- ").append(entry.getKey()).append(" demonstrates: ")
                    .append(String.join(", ", entry.getValue())).append("\n");
            }
            analysis.append("\n");
            
            // Calculate match percentage
            int matchPercentage = Math.min(100, Math.round((float) matchingSkills.size() / jobSkills.size() * 100));
            analysis.append("Work experience demonstrates approximately ").append(matchPercentage)
                .append("% of the required job skills.\n\n");
        } else {
            analysis.append("### Skill Matches\n\n");
            analysis.append("No direct matches found between work experience and job required skills.\n\n");
            analysis.append("Work experience demonstrates approximately 0% of the required job skills.\n\n");
        }
        
        // Assess experience relevance
        analysis.append("### Experience Relevance\n\n");
        
        if (totalMonths >= 24) {
            analysis.append("The candidate has substantial work experience (").append(years).append("+ years), ");
            analysis.append("which is valuable even if not directly related to all required skills.\n\n");
        } else if (totalMonths >= 12) {
            analysis.append("The candidate has moderate work experience (").append(years).append("+ years), ");
            analysis.append("which provides some foundation for the role.\n\n");
        } else {
            analysis.append("The candidate has limited work experience (less than 1 year), ");
            analysis.append("which may require additional training or mentorship.\n\n");
        }
        
        analysis.append("Note: This is a basic analysis. For a more detailed assessment, please ensure the Gemini API is properly configured.");
        
        return analysis.toString();
    }
    
    /**
     * Analyzes student bio using NLP to extract skills, personality traits, career goals, and alignment with job
     */
    public String analyzeBioWithNLP(String bio, List<String> jobSkills, Job job) {
        if (bio == null || bio.trim().isEmpty()) {
            return "No bio available for analysis.";
        }
        
        // Check if API key is configured
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            logGeminiApiMissingKeyError("bio NLP");
            return generateBasicBioAnalysis(bio, jobSkills, job);
        }
        
        HttpHeaders headers = createGeminiHeaders();
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an AI bio analyzer specializing in advanced Natural Language Processing and semantic analysis. ");
        prompt.append("Your task is to deeply analyze the student's professional bio to extract hidden insights, implicit skills, ");
        prompt.append("personality traits, career aspirations, and cultural fit for the target job position. ");
        prompt.append("Apply cutting-edge NLP techniques including:\n\n");
        
        prompt.append("NLP TECHNIQUES TO APPLY:\n");
        prompt.append("1. **Semantic Analysis**: Extract meaning beyond keywords through contextual understanding\n");
        prompt.append("2. **Named Entity Recognition (NER)**: Identify technologies, skills, organizations, and domains\n");
        prompt.append("3. **Sentiment Analysis**: Gauge passion, enthusiasm, and confidence levels\n");
        prompt.append("4. **Topic Modeling**: Identify main themes and areas of expertise\n");
        prompt.append("5. **Skill Extraction**: Detect both explicit and implicit technical and soft skills\n");
        prompt.append("6. **Intent Recognition**: Understand career goals, motivations, and aspirations\n");
        prompt.append("7. **Personality Trait Inference**: Deduce personality characteristics from language patterns\n");
        prompt.append("8. **Contextual Embeddings**: Use semantic similarity to match bio content with job requirements\n\n");
        
        prompt.append("STUDENT BIO:\n");
        prompt.append(bio).append("\n\n");
        
        prompt.append("JOB DETAILS:\n");
        prompt.append("Title: ").append(job.getTitle()).append("\n");
        prompt.append("Description: ").append(job.getDescription()).append("\n");
        prompt.append("Required Skills: ").append(String.join(", ", jobSkills)).append("\n\n");
        
        prompt.append("COMPREHENSIVE NLP ANALYSIS INSTRUCTIONS:\n\n");
        
        prompt.append("1. **Semantic Skill Extraction**:\n");
        prompt.append("   - Extract ALL technical skills mentioned (explicitly and implicitly)\n");
        prompt.append("   - Identify soft skills (communication, teamwork, problem-solving, etc.)\n");
        prompt.append("   - Map extracted skills to job requirements using semantic similarity\n");
        prompt.append("   - Consider synonyms and related technologies (e.g., 'frontend' → React, Angular, Vue)\n");
        prompt.append("   - Identify skill proficiency levels from language intensity\n\n");
        
        prompt.append("2. **Named Entity Recognition**:\n");
        prompt.append("   - Programming languages and frameworks mentioned\n");
        prompt.append("   - Technologies, tools, and platforms\n");
        prompt.append("   - Project types and domains\n");
        prompt.append("   - Industry sectors and specializations\n");
        prompt.append("   - Methodologies (Agile, DevOps, etc.)\n\n");
        
        prompt.append("3. **Sentiment and Passion Analysis**:\n");
        prompt.append("   - Measure enthusiasm level (passionate, motivated, eager, etc.)\n");
        prompt.append("   - Identify areas of strong interest and excitement\n");
        prompt.append("   - Detect confidence indicators in skill descriptions\n");
        prompt.append("   - Assess overall positivity and professional tone\n\n");
        
        prompt.append("4. **Career Intent and Goals**:\n");
        prompt.append("   - Extract career aspirations and long-term goals\n");
        prompt.append("   - Identify desired role types and responsibilities\n");
        prompt.append("   - Detect growth mindset and learning orientation\n");
        prompt.append("   - Match career goals with job position trajectory\n\n");
        
        prompt.append("5. **Personality Trait Inference**:\n");
        prompt.append("   - Collaborative indicators (team player, collaborative, etc.)\n");
        prompt.append("   - Independent work capability\n");
        prompt.append("   - Leadership potential\n");
        prompt.append("   - Attention to detail vs. big-picture thinking\n");
        prompt.append("   - Innovation and creativity markers\n\n");
        
        prompt.append("6. **Cultural and Value Alignment**:\n");
        prompt.append("   - Work values mentioned (quality, innovation, user-focus, etc.)\n");
        prompt.append("   - Professional ethics and standards\n");
        prompt.append("   - Alignment with typical industry/company cultures\n\n");
        
        prompt.append("7. **Skill-Job Semantic Matching**:\n");
        prompt.append("   - For EACH required job skill, determine if the bio provides evidence (direct or indirect)\n");
        prompt.append("   - Use semantic similarity to find related concepts\n");
        prompt.append("   - Consider transferable skills and learning potential\n");
        prompt.append("   - Identify skill gaps that are NOT mentioned in the bio\n\n");
        
        prompt.append("OUTPUT FORMAT (provide detailed analysis in these sections):\n\n");
        prompt.append("### Extracted Skills Analysis\n");
        prompt.append("- **Technical Skills Identified**: [List all technical skills found with confidence level]\n");
        prompt.append("- **Soft Skills Identified**: [List all soft skills detected]\n");
        prompt.append("- **Skill-Job Alignment**: [For each job skill, explain if/how the bio demonstrates it]\n\n");
        
        prompt.append("### Semantic Match Assessment\n");
        prompt.append("- **Direct Matches**: [Skills explicitly mentioned that match job requirements]\n");
        prompt.append("- **Semantic Matches**: [Related skills/concepts that semantically align with job needs]\n");
        prompt.append("- **Missing Skills**: [Required skills with NO evidence in bio]\n\n");
        
        prompt.append("### Personality and Traits\n");
        prompt.append("- **Key Personality Traits**: [Inferred traits with supporting evidence]\n");
        prompt.append("- **Work Style Indicators**: [Collaborative, independent, detail-oriented, etc.]\n");
        prompt.append("- **Cultural Fit Indicators**: [Values and preferences that indicate cultural alignment]\n\n");
        
        prompt.append("### Career Goals and Motivation\n");
        prompt.append("- **Career Aspirations**: [Goals and desired career path]\n");
        prompt.append("- **Passion Areas**: [Topics showing high enthusiasm]\n");
        prompt.append("- **Alignment with Job**: [How career goals align with this position]\n");
        prompt.append("- **Growth Mindset Indicators**: [Evidence of learning orientation]\n\n");
        
        prompt.append("### Sentiment and Confidence\n");
        prompt.append("- **Overall Sentiment**: [Positive/neutral/concerning]\n");
        prompt.append("- **Confidence Level**: [High/moderate/low with evidence]\n");
        prompt.append("- **Passion Intensity**: [Score 1-10 with explanation]\n\n");
        
        prompt.append("### Bio Relevance Score\n");
        prompt.append("- **Overall Bio-Job Match**: [Percentage 1-100% with detailed explanation]\n");
        prompt.append("- **Reasoning**: [Explain the score based on skill coverage, alignment, and potential]\n");
        prompt.append("- **Recommendations**: [How student could improve bio for better match]\n\n");
        
        prompt.append("IMPORTANT CONSIDERATIONS:\n");
        prompt.append("- Weight demonstrated passion and motivation highly\n");
        prompt.append("- Consider implicit skills (e.g., 'built web apps' → HTML, CSS, JavaScript)\n");
        prompt.append("- Value learning orientation and growth potential\n");
        prompt.append("- Recognize transferable skills from different domains\n");
        prompt.append("- Assess cultural fit through language and values expressed\n");
        prompt.append("- Provide specific evidence from the bio for each insight\n");
        
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt.toString());
        parts.add(textPart);
        
        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            Map<String, Object> response = restTemplate.postForObject(GEMINI_API_URL, entity, Map.class);
            String analysis = extractGeminiResponse(response);
            
            if (analysis != null) {
                return analysis;
            }
            logGeminiApiResponseError("bio NLP", response);
        } catch (Exception e) {
            logGeminiApiError("bio NLP", e);
        }
        
        // Fallback to basic analysis if API call fails
        return generateBasicBioAnalysis(bio, jobSkills, job);
    }
    
    /**
     * Generate basic bio analysis without AI
     */
    private String generateBasicBioAnalysis(String bio, List<String> jobSkills, Job job) {
        StringBuilder analysis = new StringBuilder();
        analysis.append("## Bio Analysis\n\n");
        
        analysis.append("### Student Bio\n");
        analysis.append(bio).append("\n\n");
        
        String bioLower = bio.toLowerCase();
        
        // Extract potential skills from bio
        List<String> foundSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();
        
        for (String jobSkill : jobSkills) {
            String skillLower = jobSkill.toLowerCase();
            if (bioLower.contains(skillLower)) {
                foundSkills.add(jobSkill);
            } else {
                // Check for partial matches
                boolean partialMatch = false;
                String[] skillWords = skillLower.split("\\s+");
                for (String word : skillWords) {
                    if (word.length() > 3 && bioLower.contains(word)) {
                        foundSkills.add(jobSkill + " (partial)");
                        partialMatch = true;
                        break;
                    }
                }
                if (!partialMatch) {
                    missingSkills.add(jobSkill);
                }
            }
        }
        
        // Analyze found skills
        analysis.append("### Skill Mentions in Bio\n\n");
        if (!foundSkills.isEmpty()) {
            analysis.append("The following job skills are mentioned in the bio:\n");
            for (String skill : foundSkills) {
                analysis.append("- ").append(skill).append("\n");
            }
            analysis.append("\n");
        } else {
            analysis.append("No direct job skill mentions found in the bio.\n\n");
        }
        
        // Analyze missing skills
        if (!missingSkills.isEmpty()) {
            analysis.append("### Skills Not Mentioned\n\n");
            analysis.append("The following job skills are not explicitly mentioned in the bio:\n");
            for (String skill : missingSkills) {
                analysis.append("- ").append(skill).append("\n");
            }
            analysis.append("\n");
        }
        
        // Detect passion indicators
        analysis.append("### Passion and Motivation Indicators\n\n");
        List<String> passionWords = Arrays.asList("passionate", "love", "enjoy", "excited", "enthusiastic", 
            "dedicated", "committed", "motivated", "eager", "interested", "fascinated");
        List<String> foundPassionWords = new ArrayList<>();
        
        for (String word : passionWords) {
            if (bioLower.contains(word)) {
                foundPassionWords.add(word);
            }
        }
        
        if (!foundPassionWords.isEmpty()) {
            analysis.append("Passion indicators found: ").append(String.join(", ", foundPassionWords)).append("\n");
            analysis.append("This suggests strong motivation and enthusiasm for the field.\n\n");
        } else {
            analysis.append("No explicit passion indicators found. Consider adding words that convey enthusiasm.\n\n");
        }
        
        // Calculate match percentage
        int matchPercentage = 0;
        if (!jobSkills.isEmpty()) {
            matchPercentage = Math.round((float) foundSkills.size() / jobSkills.size() * 100);
        }
        
        analysis.append("### Bio Relevance Score\n\n");
        analysis.append("The bio demonstrates approximately ").append(matchPercentage)
            .append("% of the required job skills through direct mentions.\n\n");
        
        if (matchPercentage < 30) {
            analysis.append("**Recommendation**: Consider updating your bio to include more specific technical skills and project experiences that align with job requirements.\n");
        } else if (matchPercentage < 60) {
            analysis.append("**Recommendation**: Your bio shows some relevant skills. Consider adding more details about projects and experiences that demonstrate the missing skills.\n");
        } else {
            analysis.append("**Good**: Your bio effectively communicates relevant skills and experience for this position.\n");
        }
        
        analysis.append("\n*Note: This is a basic keyword-based analysis. For deeper NLP analysis, please ensure the Gemini API is properly configured.*");
        
        return analysis.toString();
    }

    public JobMatch getJobMatch(UUID jobMatchId) {
        return jobMatchRepository.findById(jobMatchId).orElse(null);
    }

    private void logGeminiApiError(String analysisType, Exception e) {
        System.err.println("ERROR: Gemini API call failed for " + analysisType + " analysis");
        System.err.println("Error message: " + e.getMessage());
        if (e.getCause() != null) {
            System.err.println("Cause: " + e.getCause().getMessage());
        }
        System.err.println("Falling back to basic analysis method");
        e.printStackTrace();
    }
    
    private void logGeminiApiResponseError(String analysisType, Map<String, Object> response) {
        System.err.println("ERROR: Unexpected Gemini API response for " + analysisType + " analysis");
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
        
        System.err.println("Falling back to basic analysis method");
    }
    
    private void logGeminiApiMissingKeyError(String analysisType) {
        System.err.println("ERROR: Gemini API key is not configured for " + analysisType + " analysis");
        System.err.println("Please add gemini.api.key to your application.properties");
        System.err.println("Falling back to basic analysis method");
    }
    
    /**
     * Create HttpHeaders for Gemini API requests
     */
    private HttpHeaders createGeminiHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", geminiApiKey);
        return headers;
    }
    
    /**
     * Extract text response from Gemini API response
     */
    private String extractGeminiResponse(Map<String, Object> response) {
        if (response != null && response.containsKey("candidates")) {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (!candidates.isEmpty()) {
                Map<String, Object> candidate = candidates.get(0);
                List<Map<String, Object>> contentList = (List<Map<String, Object>>) candidate.get("content");
                if (!contentList.isEmpty()) {
                    Map<String, Object> contentItem = contentList.get(0);
                    List<Map<String, Object>> responseParts = (List<Map<String, Object>>) contentItem.get("parts");
                    if (!responseParts.isEmpty()) {
                        return (String) responseParts.get(0).get("text");
                    }
                }
            }
        }
        return null;
    }

    /**
     * Returns a comprehensive map of framework-language relationships for better skill matching.
     * The key is the framework/library name, and the value is a list of related languages and technologies.
     */
    private Map<String, List<String>> getFrameworkLanguageMap() {
        Map<String, List<String>> frameworkLanguageMap = new HashMap<>();
        
        // Frontend frameworks
        frameworkLanguageMap.put("react", Arrays.asList("javascript", "typescript", "js", "jsx", "tsx", "frontend", "ui"));
        frameworkLanguageMap.put("react.js", Arrays.asList("javascript", "typescript", "js", "jsx", "tsx", "react"));
        frameworkLanguageMap.put("angular", Arrays.asList("javascript", "typescript", "js", "ts", "frontend", "ui"));
        frameworkLanguageMap.put("vue", Arrays.asList("javascript", "typescript", "js", "frontend", "ui"));
        frameworkLanguageMap.put("vue.js", Arrays.asList("javascript", "typescript", "js", "vue"));
        frameworkLanguageMap.put("svelte", Arrays.asList("javascript", "typescript", "js", "frontend"));
        frameworkLanguageMap.put("nextjs", Arrays.asList("javascript", "typescript", "react", "js", "jsx", "tsx", "ssr"));
        frameworkLanguageMap.put("next.js", Arrays.asList("javascript", "typescript", "react", "nextjs"));
        frameworkLanguageMap.put("gatsby", Arrays.asList("javascript", "typescript", "react", "js", "jsx", "tsx"));
        frameworkLanguageMap.put("nuxt", Arrays.asList("javascript", "typescript", "vue", "ssr"));
        frameworkLanguageMap.put("ember", Arrays.asList("javascript", "typescript", "frontend"));
        
        // Backend frameworks - Java/Kotlin
        frameworkLanguageMap.put("spring", Arrays.asList("java", "kotlin", "backend", "api"));
        frameworkLanguageMap.put("spring boot", Arrays.asList("java", "kotlin", "spring", "backend", "api"));
        frameworkLanguageMap.put("springboot", Arrays.asList("java", "kotlin", "spring", "backend"));
        frameworkLanguageMap.put("spring mvc", Arrays.asList("java", "kotlin", "spring", "web"));
        frameworkLanguageMap.put("hibernate", Arrays.asList("java", "kotlin", "orm", "database"));
        frameworkLanguageMap.put("jpa", Arrays.asList("java", "kotlin", "orm", "database", "hibernate"));
        frameworkLanguageMap.put("junit", Arrays.asList("java", "kotlin", "testing"));
        frameworkLanguageMap.put("mockito", Arrays.asList("java", "kotlin", "testing"));
        frameworkLanguageMap.put("maven", Arrays.asList("java", "build", "dependency"));
        frameworkLanguageMap.put("gradle", Arrays.asList("java", "kotlin", "build", "dependency"));
        
        // Backend frameworks - JavaScript/TypeScript
        frameworkLanguageMap.put("express", Arrays.asList("javascript", "typescript", "node", "nodejs", "node.js", "backend", "api"));
        frameworkLanguageMap.put("express.js", Arrays.asList("javascript", "typescript", "node", "express", "backend"));
        frameworkLanguageMap.put("nestjs", Arrays.asList("javascript", "typescript", "node", "nodejs", "node.js", "backend"));
        frameworkLanguageMap.put("nest.js", Arrays.asList("typescript", "node", "nestjs", "backend"));
        frameworkLanguageMap.put("koa", Arrays.asList("javascript", "typescript", "node", "backend"));
        frameworkLanguageMap.put("fastify", Arrays.asList("javascript", "typescript", "node", "backend"));
        frameworkLanguageMap.put("hapi", Arrays.asList("javascript", "node", "backend"));
        
        // Backend frameworks - Python
        frameworkLanguageMap.put("django", Arrays.asList("python", "backend", "web", "orm"));
        frameworkLanguageMap.put("flask", Arrays.asList("python", "backend", "web", "api"));
        frameworkLanguageMap.put("fastapi", Arrays.asList("python", "backend", "api", "async"));
        frameworkLanguageMap.put("pyramid", Arrays.asList("python", "backend", "web"));
        frameworkLanguageMap.put("tornado", Arrays.asList("python", "backend", "async"));
        frameworkLanguageMap.put("pytest", Arrays.asList("python", "testing"));
        frameworkLanguageMap.put("sqlalchemy", Arrays.asList("python", "orm", "database"));
        
        // Backend frameworks - PHP
        frameworkLanguageMap.put("laravel", Arrays.asList("php", "backend", "web", "mvc"));
        frameworkLanguageMap.put("symfony", Arrays.asList("php", "backend", "web"));
        frameworkLanguageMap.put("codeigniter", Arrays.asList("php", "backend", "web"));
        frameworkLanguageMap.put("yii", Arrays.asList("php", "backend", "web"));
        
        // Backend frameworks - Ruby
        frameworkLanguageMap.put("rails", Arrays.asList("ruby", "backend", "web", "mvc"));
        frameworkLanguageMap.put("ruby on rails", Arrays.asList("ruby", "rails", "backend"));
        frameworkLanguageMap.put("sinatra", Arrays.asList("ruby", "backend", "web"));
        
        // .NET frameworks
        frameworkLanguageMap.put("asp.net", Arrays.asList("c#", "csharp", ".net", "dotnet", "backend", "web"));
        frameworkLanguageMap.put("asp.net core", Arrays.asList("c#", "csharp", ".net", "dotnet", "backend"));
        frameworkLanguageMap.put("dotnet", Arrays.asList("c#", "csharp", ".net", "f#", "vb.net"));
        frameworkLanguageMap.put(".net", Arrays.asList("c#", "csharp", "dotnet", "backend"));
        frameworkLanguageMap.put("xamarin", Arrays.asList("c#", "csharp", ".net", "dotnet", "mobile"));
        frameworkLanguageMap.put("blazor", Arrays.asList("c#", "csharp", ".net", "frontend"));
        frameworkLanguageMap.put("entity framework", Arrays.asList("c#", "csharp", ".net", "orm", "database"));
        
        // Mobile frameworks
        frameworkLanguageMap.put("react native", Arrays.asList("javascript", "typescript", "react", "js", "jsx", "tsx", "mobile"));
        frameworkLanguageMap.put("flutter", Arrays.asList("dart", "mobile", "cross-platform"));
        frameworkLanguageMap.put("android", Arrays.asList("java", "kotlin", "mobile"));
        frameworkLanguageMap.put("ios", Arrays.asList("swift", "objective-c", "mobile"));
        frameworkLanguageMap.put("ionic", Arrays.asList("javascript", "typescript", "angular", "mobile"));
        frameworkLanguageMap.put("cordova", Arrays.asList("javascript", "html", "css", "mobile"));
        frameworkLanguageMap.put("phonegap", Arrays.asList("javascript", "html", "mobile"));
        
        // Data & ML frameworks
        frameworkLanguageMap.put("tensorflow", Arrays.asList("python", "java", "javascript", "ml", "ai"));
        frameworkLanguageMap.put("pytorch", Arrays.asList("python", "ml", "ai", "deep learning"));
        frameworkLanguageMap.put("keras", Arrays.asList("python", "tensorflow", "ml", "ai"));
        frameworkLanguageMap.put("scikit-learn", Arrays.asList("python", "ml", "data science"));
        frameworkLanguageMap.put("pandas", Arrays.asList("python", "data analysis", "data science"));
        frameworkLanguageMap.put("numpy", Arrays.asList("python", "data science", "numerical"));
        
        // Database and ORM
        frameworkLanguageMap.put("mongodb", Arrays.asList("nosql", "database", "json"));
        frameworkLanguageMap.put("mysql", Arrays.asList("sql", "database", "relational"));
        frameworkLanguageMap.put("postgresql", Arrays.asList("sql", "database", "relational"));
        frameworkLanguageMap.put("redis", Arrays.asList("nosql", "cache", "database"));
        frameworkLanguageMap.put("cassandra", Arrays.asList("nosql", "database", "distributed"));
        frameworkLanguageMap.put("elasticsearch", Arrays.asList("search", "nosql", "database"));
        
        // Cloud and DevOps
        frameworkLanguageMap.put("aws", Arrays.asList("cloud", "devops", "infrastructure"));
        frameworkLanguageMap.put("azure", Arrays.asList("cloud", "devops", "infrastructure", "microsoft"));
        frameworkLanguageMap.put("gcp", Arrays.asList("cloud", "devops", "infrastructure", "google"));
        frameworkLanguageMap.put("docker", Arrays.asList("containerization", "devops", "deployment"));
        frameworkLanguageMap.put("kubernetes", Arrays.asList("container orchestration", "devops", "docker", "k8s"));
        frameworkLanguageMap.put("jenkins", Arrays.asList("ci/cd", "devops", "automation"));
        frameworkLanguageMap.put("terraform", Arrays.asList("infrastructure as code", "devops", "cloud"));
        
        // Testing frameworks
        frameworkLanguageMap.put("jest", Arrays.asList("javascript", "typescript", "testing", "react"));
        frameworkLanguageMap.put("mocha", Arrays.asList("javascript", "typescript", "testing"));
        frameworkLanguageMap.put("chai", Arrays.asList("javascript", "typescript", "testing"));
        frameworkLanguageMap.put("cypress", Arrays.asList("javascript", "typescript", "testing", "e2e"));
        frameworkLanguageMap.put("selenium", Arrays.asList("testing", "automation", "e2e"));
        
        // State management
        frameworkLanguageMap.put("redux", Arrays.asList("javascript", "typescript", "react", "state management"));
        frameworkLanguageMap.put("mobx", Arrays.asList("javascript", "typescript", "react", "state management"));
        frameworkLanguageMap.put("vuex", Arrays.asList("javascript", "vue", "state management"));
        frameworkLanguageMap.put("ngrx", Arrays.asList("typescript", "angular", "state management"));
        
        // Build tools and bundlers
        frameworkLanguageMap.put("webpack", Arrays.asList("javascript", "build", "bundler"));
        frameworkLanguageMap.put("vite", Arrays.asList("javascript", "typescript", "build", "bundler"));
        frameworkLanguageMap.put("parcel", Arrays.asList("javascript", "build", "bundler"));
        frameworkLanguageMap.put("rollup", Arrays.asList("javascript", "build", "bundler"));
        
        return frameworkLanguageMap;
    }

    /**
     * Calculate match score using ALL available analyses from different sources
     * This method prioritizes the AI analysis for the final match score
     */
    private Double calculateMatchScoreWithAllData(StudentProfile student, List<String> studentSkills, CV cv, Job job,
                                                String githubAnalysis, String portfolioAnalysis, 
                                                String certificationsAnalysis, String experiencesAnalysis, String bioAnalysis) {
        // Check if API key is configured
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            logGeminiApiMissingKeyError("comprehensive match score calculation");
            // Fall back to basic match calculation
            return calculateMatchScore(student, studentSkills, cv, job);
        }
        
        // Use AI for a comprehensive analysis that takes into account all data sources
        HttpHeaders headers = createGeminiHeaders();
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an AI job matcher specializing in comprehensive candidate evaluation. ");
        prompt.append("Your task is to analyze ALL available data about a student and a job to determine the most accurate match score. ");
        prompt.append("You will be provided with multiple analyses from different aspects of the student's profile. ");
        prompt.append("Synthesize all this information to produce a final match score between 1 and 100, where 100 is a perfect match. ");
        prompt.append("Only return the numeric score as an integer between 1 and 100, nothing else.\n\n");
        
        // Parse job required skills
        List<String> jobSkills = parseSkills(job.getRequiredSkills());
        
        prompt.append("JOB DETAILS:\n");
        prompt.append("Title: ").append(job.getTitle()).append("\n");
        prompt.append("Description: ").append(job.getDescription()).append("\n");
        prompt.append("Required Skills: ").append(String.join(", ", jobSkills)).append("\n\n");
        
        prompt.append("STUDENT DETAILS:\n");
        prompt.append("Skills: ").append(String.join(", ", studentSkills)).append("\n");
        prompt.append("Major: ").append(student.getMajor()).append("\n");
        prompt.append("University: ").append(student.getUniversity()).append("\n");
        prompt.append("Graduation Year: ").append(student.getGraduationYear()).append("\n");
        
        // Add additional student profile elements if available
        if (student.getBio() != null && !student.getBio().isEmpty()) {
            prompt.append("Bio: ").append(student.getBio()).append("\n");
        }
        
        if (student.getGithubUrl() != null && !student.getGithubUrl().isEmpty()) {
            prompt.append("GitHub URL: ").append(student.getGithubUrl()).append("\n");
        }
        
        if (student.getPortfolioUrl() != null && !student.getPortfolioUrl().isEmpty()) {
            prompt.append("Portfolio URL: ").append(student.getPortfolioUrl()).append("\n");
        }
        
        if (cv != null) {
            prompt.append("CV Content: ").append(cv.getParsedResume()).append("\n\n");
        }
        
        // Add all the detailed analyses that have been performed
        prompt.append("ANALYSES PERFORMED:\n\n");
        
        // Add GitHub analysis if available
        if (githubAnalysis != null && !githubAnalysis.isEmpty()) {
            prompt.append("GitHub Analysis:\n").append(githubAnalysis).append("\n\n");
        }
        
        // Add portfolio analysis if available
        if (portfolioAnalysis != null && !portfolioAnalysis.isEmpty()) {
            prompt.append("Portfolio Analysis:\n").append(portfolioAnalysis).append("\n\n");
        }
        
        // Add certifications analysis if available
        if (certificationsAnalysis != null && !certificationsAnalysis.isEmpty()) {
            prompt.append("Certifications Analysis:\n").append(certificationsAnalysis).append("\n\n");
        }
        
        // Add work experience analysis if available
        if (experiencesAnalysis != null && !experiencesAnalysis.isEmpty()) {
            prompt.append("Work Experience Analysis:\n").append(experiencesAnalysis).append("\n\n");
        }
        
        // Add bio analysis if available
        if (bioAnalysis != null && !bioAnalysis.isEmpty()) {
            prompt.append("Bio NLP Analysis:\n").append(bioAnalysis).append("\n\n");
        }
        
        // Add specific instructions for comprehensive analysis
        prompt.append("COMPREHENSIVE ANALYSIS INSTRUCTIONS:\n");
        prompt.append("1. Consider ALL available data sources in your evaluation\n");
        prompt.append("2. Weigh the following factors in determining the match score:\n");
        prompt.append("   - Direct skill matches between student skills and job requirements\n");
        prompt.append("   - Related skills and framework-language relationships\n");
        prompt.append("   - GitHub projects that demonstrate relevant skills\n");
        prompt.append("   - Portfolio projects that showcase relevant abilities\n");
        prompt.append("   - Certifications that validate specific competencies\n");
        prompt.append("   - Work experience that demonstrates practical application\n");
        prompt.append("   - Educational background relevance to the position\n");
        prompt.append("   - Bio analysis showing personality traits, passion, and career goals alignment\n\n");
        
        prompt.append("3. Apply these special matching rules:\n");
        prompt.append("   - If the student has Java, Spring Boot, and React skills, and the job requires these, give at least a 60% match\n");
        prompt.append("   - Consider framework-language relationships (e.g., knowing React implies JavaScript knowledge)\n");
        prompt.append("   - Value demonstrated experience (GitHub, portfolio, work) more heavily than listed skills\n");
        prompt.append("   - Consider the student's potential to quickly learn missing skills based on related knowledge\n\n");
        
        prompt.append("4. IMPORTANT: Return only a single number between 1-100 representing the final match percentage\n");
        
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt.toString());
        parts.add(textPart);
        
        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            Map<String, Object> response = restTemplate.postForObject(GEMINI_API_URL, entity, Map.class);
            String scoreText = extractGeminiResponse(response);
            
            if (scoreText != null) {
                try {
                    double score = Double.parseDouble(scoreText.trim());
                    return Math.min(100.0, Math.max(1.0, score));
                } catch (NumberFormatException e) {
                    System.err.println("Error parsing score from AI: " + e.getMessage());
                    return calculateMatchScore(student, studentSkills, cv, job);
                }
            }
            logGeminiApiResponseError("comprehensive match score", response);
        } catch (Exception e) {
            logGeminiApiError("comprehensive match score calculation", e);
        }
        
        // If AI fails, fall back to basic match calculation
        return calculateMatchScore(student, studentSkills, cv, job);
    }
} 
