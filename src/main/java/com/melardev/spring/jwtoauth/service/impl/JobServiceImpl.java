package com.melardev.spring.jwtoauth.service.impl;

import com.melardev.spring.jwtoauth.entities.EmployerProfile;
import com.melardev.spring.jwtoauth.entities.Job;
import com.melardev.spring.jwtoauth.entities.JobStatus;
import com.melardev.spring.jwtoauth.repositories.EmployerProfileRepository;
import com.melardev.spring.jwtoauth.repositories.JobRepository;
import com.melardev.spring.jwtoauth.service.interfaces.JobService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class JobServiceImpl implements JobService {

    private static final Logger logger = LoggerFactory.getLogger(JobServiceImpl.class);

    private final JobRepository jobRepository;
    private final EmployerProfileRepository employerProfileRepository;

    @Autowired
    public JobServiceImpl(JobRepository jobRepository, EmployerProfileRepository employerProfileRepository) {
        this.jobRepository = jobRepository;
        this.employerProfileRepository = employerProfileRepository;
    }

    @Override
    public List<Job> getAllActiveJobs() {
        return jobRepository.findByStatus(JobStatus.ACTIVE);
    }

    @Override
    public Job getJobById(UUID jobId) {
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (jobOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found");
        }
        return jobOpt.get();
    }

    @Override
    public List<Job> getJobsByEmployer(UUID employerId) {
        Optional<EmployerProfile> employerOpt = employerProfileRepository.findByUserId(employerId);
        if (employerOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Employer profile not found");
        }
        return jobRepository.findByEmployer(employerOpt.get());
    }

    @Override
    public Job getJobByIdForEmployer(UUID jobId, UUID employerId) {
        Job job = getJobById(jobId);
        if (!job.getEmployer().getUser().getId().equals(employerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to access this job");
        }
        return job;
    }

    @Override
    public Job createJob(UUID employerId, Map<String, Object> jobData) {
        Optional<EmployerProfile> employerOpt = employerProfileRepository.findByUserId(employerId);
        if (employerOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Employer profile not found");
        }

        Job job = buildJobFromData(jobData);
        job.setEmployer(employerOpt.get());
        job.setStatus(JobStatus.ACTIVE);
        job.setCreatedAt(LocalDateTime.now());
        job.setUpdatedAt(LocalDateTime.now());

        Job savedJob = jobRepository.save(job);
        logger.info("Created job {} for employer {}", savedJob.getId(), employerId);
        return savedJob;
    }

    @Override
    public Job updateJob(UUID jobId, UUID employerId, Map<String, Object> jobData) {
        Job job = getJobByIdForEmployer(jobId, employerId);
        updateJobFromData(job, jobData);
        job.setUpdatedAt(LocalDateTime.now());
        return jobRepository.save(job);
    }

    @Override
    public boolean deleteJob(UUID jobId, UUID employerId) {
        Job job = getJobByIdForEmployer(jobId, employerId);
        jobRepository.delete(job);
        logger.info("Deleted job {} for employer {}", jobId, employerId);
        return true;
    }

    @Override
    public List<Job> searchJobs(String title, String location, String employmentType, List<String> skills) {
        List<Job> jobs = getAllActiveJobs();
        
        return jobs.stream()
                .filter(job -> {
                    boolean matches = true;
                    
                    if (title != null && !title.trim().isEmpty()) {
                        matches &= job.getTitle().toLowerCase().contains(title.toLowerCase());
                    }
                    
                    if (location != null && !location.trim().isEmpty()) {
                        matches &= job.getLocation() != null && 
                                  job.getLocation().toLowerCase().contains(location.toLowerCase());
                    }
                    
                    if (employmentType != null && !employmentType.trim().isEmpty()) {
                        matches &= job.getEmploymentType() != null && 
                                  job.getEmploymentType().toLowerCase().equals(employmentType.toLowerCase());
                    }
                    
                    if (skills != null && !skills.isEmpty()) {
                        List<String> jobSkills = parseSkillsFromString(job.getRequiredSkills());
                        matches &= skills.stream().anyMatch(skill -> 
                            jobSkills.stream().anyMatch(jobSkill -> 
                                jobSkill.toLowerCase().contains(skill.toLowerCase())));
                    }
                    
                    return matches;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Job> getJobsBySkills(List<String> skills) {
        if (skills == null || skills.isEmpty()) {
            return new ArrayList<>();
        }
        
        return getAllActiveJobs().stream()
                .filter(job -> {
                    List<String> jobSkills = parseSkillsFromString(job.getRequiredSkills());
                    return skills.stream().anyMatch(skill -> 
                        jobSkills.stream().anyMatch(jobSkill -> 
                            jobSkill.toLowerCase().contains(skill.toLowerCase())));
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Job> getJobsByLocation(String location) {
        if (location == null || location.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        return getAllActiveJobs().stream()
                .filter(job -> job.getLocation() != null && 
                              job.getLocation().toLowerCase().contains(location.toLowerCase()))
                .collect(Collectors.toList());
    }

    @Override
    public boolean validateJobOwnership(UUID jobId, UUID employerId) {
        try {
            getJobByIdForEmployer(jobId, employerId);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public boolean isJobActive(UUID jobId) {
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        return jobOpt.isPresent() && jobOpt.get().getStatus() == JobStatus.ACTIVE;
    }

    @Override
    public Map<String, Object> getJobStatistics(UUID employerId) {
        List<Job> jobs = getJobsByEmployer(employerId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalJobs", jobs.size());
        stats.put("activeJobs", jobs.stream().mapToInt(job -> job.getStatus() == JobStatus.ACTIVE ? 1 : 0).sum());
        stats.put("totalApplications", jobs.stream().mapToInt(job -> job.getApplications().size()).sum());
        
        return stats;
    }

    @Override
    public Job buildJobFromData(Map<String, Object> jobData) {
        Job job = new Job();
        updateJobFromData(job, jobData);
        return job;
    }

    @Override
    public List<String> parseSkillsFromString(String skillsString) {
        if (skillsString == null || skillsString.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        return Arrays.asList(skillsString.split(","))
                .stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    // Helper method to update job from data
    private void updateJobFromData(Job job, Map<String, Object> jobData) {
        if (jobData.containsKey("title")) {
            job.setTitle((String) jobData.get("title"));
        }
        if (jobData.containsKey("description")) {
            job.setDescription((String) jobData.get("description"));
        }
        if (jobData.containsKey("location")) {
            job.setLocation((String) jobData.get("location"));
        }
        if (jobData.containsKey("employmentType")) {
            job.setEmploymentType((String) jobData.get("employmentType"));
        }
        if (jobData.containsKey("salaryRange")) {
            job.setSalaryRange((String) jobData.get("salaryRange"));
        }
        if (jobData.containsKey("requiredSkills")) {
            Object skillsObj = jobData.get("requiredSkills");
            if (skillsObj instanceof String) {
                job.setRequiredSkills((String) skillsObj);
            } else if (skillsObj instanceof List) {
                @SuppressWarnings("unchecked")
                List<String> skills = (List<String>) skillsObj;
                job.setRequiredSkills(String.join(", ", skills));
            }
        }
        if (jobData.containsKey("requirements")) {
            job.setRequirements((String) jobData.get("requirements"));
        }
        if (jobData.containsKey("benefits")) {
            job.setBenefits((String) jobData.get("benefits"));
        }
        if (jobData.containsKey("applicationDeadline")) {
            Object deadlineObj = jobData.get("applicationDeadline");
            if (deadlineObj instanceof String) {
                try {
                    // Handle date parsing if needed
                    // job.setApplicationDeadline(LocalDate.parse((String) deadlineObj));
                } catch (Exception e) {
                    logger.warn("Failed to parse application deadline: {}", deadlineObj);
                }
            }
        }
    }
} 