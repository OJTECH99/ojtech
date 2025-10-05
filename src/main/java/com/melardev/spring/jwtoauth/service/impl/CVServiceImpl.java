package com.melardev.spring.jwtoauth.service.impl;

import com.melardev.spring.jwtoauth.entities.*;
import com.melardev.spring.jwtoauth.repositories.*;
import com.melardev.spring.jwtoauth.service.interfaces.CVService;
import com.melardev.spring.jwtoauth.services.JobMatchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class CVServiceImpl implements CVService {

    private static final Logger logger = LoggerFactory.getLogger(CVServiceImpl.class);

    private final CVRepository cvRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CertificationRepository certificationRepository;
    private final WorkExperienceRepository workExperienceRepository;
    private final JobMatchService jobMatchService;

    @Autowired
    public CVServiceImpl(CVRepository cvRepository,
                        StudentProfileRepository studentProfileRepository,
                        CertificationRepository certificationRepository,
                        WorkExperienceRepository workExperienceRepository,
                        JobMatchService jobMatchService) {
        this.cvRepository = cvRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.certificationRepository = certificationRepository;
        this.workExperienceRepository = workExperienceRepository;
        this.jobMatchService = jobMatchService;
    }

    @Override
    public List<CV> getCVsByStudent(UUID userId) {
        Optional<StudentProfile> studentOpt = studentProfileRepository.findByUserId(userId);
        if (studentOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found");
        }
        return cvRepository.findByStudent(studentOpt.get());
    }

    @Override
    public CV getCVById(UUID cvId, UUID userId) {
        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.getStudent().getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to access this CV");
        }
        
        return cv;
    }

    @Override
    public CV getCVByIdForEmployer(UUID cvId) {
        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found or not active");
        }
        
        return cv;
    }

    @Override
    public String getCVHtmlContent(UUID cvId) {
        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found");
        }
        
        CV cv = cvOpt.get();
        if (!cv.isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV not found or not active");
        }
        
        return cv.getHtmlContent();
    }

    @Override
    public CV generateCV(UUID userId, String template, String additionalInfo) {
        Optional<StudentProfile> studentOpt = studentProfileRepository.findByUserId(userId);
        if (studentOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found");
        }
        
        StudentProfile student = studentOpt.get();
        
        // Generate CV content using the student profile
        String content = generateCVContent(student);
        
        // Create new CV
        CV cv = new CV();
        cv.setStudent(student);
        cv.setHtmlContent(content);
        cv.setTemplate(template != null ? template : "standard");
        cv.setActive(false); // Not active by default
        cv.setCreatedAt(LocalDateTime.now());
        cv.setUpdatedAt(LocalDateTime.now());
        
        // Save CV
        CV savedCV = cvRepository.save(cv);
        
        logger.info("Generated CV for student {} with ID {}", student.getFirstName(), savedCV.getId());
        
        return savedCV;
    }

    @Override
    public CV updateCVContent(UUID cvId, UUID userId, String content) {
        CV cv = getCVById(cvId, userId);
        cv.setHtmlContent(content);
        cv.setUpdatedAt(LocalDateTime.now());
        return cvRepository.save(cv);
    }

    @Override
    public CV updateCVHtml(UUID cvId, UUID userId, String htmlContent) {
        CV cv = getCVById(cvId, userId);
        cv.setHtmlContent(htmlContent);
        cv.setUpdatedAt(LocalDateTime.now());
        return cvRepository.save(cv);
    }

    @Override
    public boolean deleteCV(UUID cvId, UUID userId) {
        CV cv = getCVById(cvId, userId);
        cvRepository.delete(cv);
        logger.info("Deleted CV {} for user {}", cvId, userId);
        return true;
    }

    @Override
    public CV getActiveCVByStudent(UUID userId) {
        Optional<StudentProfile> studentOpt = studentProfileRepository.findByUserId(userId);
        if (studentOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found");
        }
        
        List<CV> cvs = cvRepository.findByStudent(studentOpt.get());
        return cvs.stream()
                .filter(CV::isActive)
                .findFirst()
                .orElse(null);
    }

    @Override
    public String getActiveCVContentByStudent(UUID userId) {
        CV activeCV = getActiveCVByStudent(userId);
        return activeCV != null ? activeCV.getHtmlContent() : null;
    }

    // Certification Management
    @Override
    public List<Certification> getCertificationsByCVId(UUID cvId, UUID userId) {
        CV cv = getCVById(cvId, userId);
        return new ArrayList<>(certificationRepository.findByCvId(cvId));
    }

    @Override
    public List<Certification> getCertificationsByCVIdForEmployer(UUID cvId) {
        CV cv = getCVByIdForEmployer(cvId);
        return new ArrayList<>(certificationRepository.findByCvId(cvId));
    }

    @Override
    public Certification addCertification(UUID cvId, UUID userId, String certificationName, 
                                        String issuingOrganization, LocalDate dateObtained, String credentialId) {
        CV cv = getCVById(cvId, userId);
        
        Certification certification = new Certification();
        certification.setName(certificationName);
        certification.setIssuer(issuingOrganization);
        certification.setDateReceived(dateObtained);
        certification.setCredentialUrl(credentialId);
        certification.setCv(cv);
        
        return certificationRepository.save(certification);
    }

    @Override
    public Certification updateCertification(UUID cvId, UUID certId, UUID userId, 
                                           String certificationName, String issuingOrganization, 
                                           LocalDate dateObtained, String credentialId) {
        CV cv = getCVById(cvId, userId);
        Optional<Certification> certOpt = certificationRepository.findById(certId);
        
        if (certOpt.isEmpty() || !certOpt.get().getCv().getId().equals(cvId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Certification not found");
        }
        
        Certification certification = certOpt.get();
        certification.setName(certificationName);
        certification.setIssuer(issuingOrganization);
        certification.setDateReceived(dateObtained);
        certification.setCredentialUrl(credentialId);
        
        return certificationRepository.save(certification);
    }

    @Override
    public boolean deleteCertification(UUID cvId, UUID certId, UUID userId) {
        CV cv = getCVById(cvId, userId);
        Optional<Certification> certOpt = certificationRepository.findById(certId);
        
        if (certOpt.isEmpty() || !certOpt.get().getCv().getId().equals(cvId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Certification not found");
        }
        
        certificationRepository.delete(certOpt.get());
        return true;
    }

    // Experience Management
    @Override
    public List<WorkExperience> getExperiencesByCVId(UUID cvId, UUID userId) {
        CV cv = getCVById(cvId, userId);
        return new ArrayList<>(workExperienceRepository.findByCvId(cvId));
    }

    @Override
    public List<WorkExperience> getExperiencesByCVIdForEmployer(UUID cvId) {
        CV cv = getCVByIdForEmployer(cvId);
        return new ArrayList<>(workExperienceRepository.findByCvId(cvId));
    }

    @Override
    public WorkExperience addExperience(UUID cvId, UUID userId, String jobTitle, String company, 
                                      LocalDate startDate, LocalDate endDate, String description, 
                                      String location, String employmentType) {
        CV cv = getCVById(cvId, userId);
        
        WorkExperience experience = new WorkExperience();
        experience.setTitle(jobTitle);
        experience.setCompany(company);
        experience.setStartDate(startDate);
        experience.setEndDate(endDate);
        experience.setDescription(description);
        experience.setLocation(location);
        // Note: employmentType field doesn't exist in WorkExperience entity
        experience.setCv(cv);
        
        return workExperienceRepository.save(experience);
    }

    @Override
    public WorkExperience updateExperience(UUID cvId, UUID expId, UUID userId, String jobTitle, 
                                         String company, LocalDate startDate, LocalDate endDate, 
                                         String description, String location, String employmentType) {
        CV cv = getCVById(cvId, userId);
        Optional<WorkExperience> expOpt = workExperienceRepository.findById(expId);
        
        if (expOpt.isEmpty() || !expOpt.get().getCv().getId().equals(cvId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Work experience not found");
        }
        
        WorkExperience experience = expOpt.get();
        experience.setTitle(jobTitle);
        experience.setCompany(company);
        experience.setStartDate(startDate);
        experience.setEndDate(endDate);
        experience.setDescription(description);
        experience.setLocation(location);
        // Note: employmentType field doesn't exist in WorkExperience entity
        
        return workExperienceRepository.save(experience);
    }

    @Override
    public boolean deleteExperience(UUID cvId, UUID expId, UUID userId) {
        CV cv = getCVById(cvId, userId);
        Optional<WorkExperience> expOpt = workExperienceRepository.findById(expId);
        
        if (expOpt.isEmpty() || !expOpt.get().getCv().getId().equals(cvId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Work experience not found");
        }
        
        workExperienceRepository.delete(expOpt.get());
        return true;
    }

    // Business Logic
    @Override
    public String generateCVContent(StudentProfile studentProfile) {
        StringBuilder content = new StringBuilder();
        
        // Personal Information
        content.append("=== CURRICULUM VITAE ===\n\n");
        content.append("Name: ").append(studentProfile.getFirstName()).append(" ").append(studentProfile.getLastName()).append("\n");
        
        if (studentProfile.getEmail() != null) {
            content.append("Email: ").append(studentProfile.getEmail()).append("\n");
        }
        if (studentProfile.getPhone() != null) {
            content.append("Phone: ").append(studentProfile.getPhone()).append("\n");
        }
        if (studentProfile.getLocation() != null) {
            content.append("Location: ").append(studentProfile.getLocation()).append("\n");
        }
        
        // Bio
        if (studentProfile.getBio() != null && !studentProfile.getBio().trim().isEmpty()) {
            content.append("\n=== PROFESSIONAL SUMMARY ===\n");
            content.append(studentProfile.getBio()).append("\n");
        }
        
        // Education
        if (studentProfile.getDegree() != null) {
            content.append("\n=== EDUCATION ===\n");
            content.append("Degree: ").append(studentProfile.getDegree()).append("\n");
            if (studentProfile.getInstitution() != null) {
                content.append("Institution: ").append(studentProfile.getInstitution()).append("\n");
            }
            if (studentProfile.getFieldOfStudy() != null) {
                content.append("Field of Study: ").append(studentProfile.getFieldOfStudy()).append("\n");
            }
        }
        
        // Skills
        if (studentProfile.getSkills() != null && !studentProfile.getSkills().isEmpty()) {
            content.append("\n=== SKILLS ===\n");
            content.append(String.join(", ", studentProfile.getSkills())).append("\n");
        }
        
        // Links
        if (studentProfile.getLinkedIn() != null || studentProfile.getGithub() != null) {
            content.append("\n=== LINKS ===\n");
            if (studentProfile.getLinkedIn() != null) {
                content.append("LinkedIn: ").append(studentProfile.getLinkedIn()).append("\n");
            }
            if (studentProfile.getGithub() != null) {
                content.append("GitHub: ").append(studentProfile.getGithub()).append("\n");
            }
        }
        
        return content.toString();
    }

    @Override
    public boolean validateCVOwnership(UUID cvId, UUID userId) {
        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            return false;
        }
        return cvOpt.get().getStudent().getUser().getId().equals(userId);
    }

    @Override
    public boolean isCVActive(UUID cvId) {
        Optional<CV> cvOpt = cvRepository.findById(cvId);
        return cvOpt.isPresent() && cvOpt.get().isActive();
    }
} 