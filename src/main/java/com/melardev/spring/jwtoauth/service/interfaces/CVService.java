package com.melardev.spring.jwtoauth.service.interfaces;

import com.melardev.spring.jwtoauth.entities.CV;
import com.melardev.spring.jwtoauth.entities.Certification;
import com.melardev.spring.jwtoauth.entities.StudentProfile;
import com.melardev.spring.jwtoauth.entities.WorkExperience;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface CVService {
    
    // CV Management
    List<CV> getCVsByStudent(UUID userId);
    CV getCVById(UUID cvId, UUID userId);
    CV getCVByIdForEmployer(UUID cvId);
    String getCVHtmlContent(UUID cvId);
    CV generateCV(UUID userId, String template, String additionalInfo);
    CV updateCVContent(UUID cvId, UUID userId, String content);
    CV updateCVHtml(UUID cvId, UUID userId, String htmlContent);
    boolean deleteCV(UUID cvId, UUID userId);
    CV getActiveCVByStudent(UUID userId);
    String getActiveCVContentByStudent(UUID userId);
    
    // Certification Management
    List<Certification> getCertificationsByCVId(UUID cvId, UUID userId);
    List<Certification> getCertificationsByCVIdForEmployer(UUID cvId);
    Certification addCertification(UUID cvId, UUID userId, String certificationName, 
                                 String issuingOrganization, LocalDate dateObtained, String credentialId);
    Certification updateCertification(UUID cvId, UUID certId, UUID userId, 
                                    String certificationName, String issuingOrganization, 
                                    LocalDate dateObtained, String credentialId);
    boolean deleteCertification(UUID cvId, UUID certId, UUID userId);
    
    // Experience Management
    List<WorkExperience> getExperiencesByCVId(UUID cvId, UUID userId);
    List<WorkExperience> getExperiencesByCVIdForEmployer(UUID cvId);
    WorkExperience addExperience(UUID cvId, UUID userId, String jobTitle, String company, 
                               LocalDate startDate, LocalDate endDate, String description, 
                               String location, String employmentType);
    WorkExperience updateExperience(UUID cvId, UUID expId, UUID userId, String jobTitle, 
                                  String company, LocalDate startDate, LocalDate endDate, 
                                  String description, String location, String employmentType);
    boolean deleteExperience(UUID cvId, UUID expId, UUID userId);
    
    // Business Logic
    String generateCVContent(StudentProfile studentProfile);
    boolean validateCVOwnership(UUID cvId, UUID userId);
    boolean isCVActive(UUID cvId);
} 