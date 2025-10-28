package com.ojtechapi.spring.jwtoauth.service.impl;

import com.ojtechapi.spring.jwtoauth.entities.*;
import com.ojtechapi.spring.jwtoauth.repositories.*;
import com.ojtechapi.spring.jwtoauth.service.interfaces.CVService;
import com.ojtechapi.spring.jwtoauth.services.JobMatchService;
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

    @Override
    public CV regenerateActiveCV(UUID userId) {
        Optional<StudentProfile> studentOpt = studentProfileRepository.findByUserId(userId);
        if (studentOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found");
        }
        
        StudentProfile student = studentOpt.get();
        
        // Regenerate CV content from current profile data
        String newContent = generateCVContent(student);
        
        // Find the active CV
        CV activeCV = getActiveCVByStudent(userId);
        
        if (activeCV != null) {
            // Update existing active CV with new content
            activeCV.setHtmlContent(newContent);
            activeCV.setUpdatedAt(LocalDateTime.now());
            CV savedCV = cvRepository.save(activeCV);
            logger.info("Regenerated active CV {} for user {}", activeCV.getId(), userId);
            return savedCV;
        } else {
            // No active CV exists, create a new one and set it as active
            CV newCV = new CV();
            newCV.setStudent(student);
            newCV.setHtmlContent(newContent);
            newCV.setTemplate("standard");
            newCV.setActive(true);
            newCV.setCreatedAt(LocalDateTime.now());
            newCV.setUpdatedAt(LocalDateTime.now());
            
            CV savedCV = cvRepository.save(newCV);
            
            // Update student's active CV ID
            student.setActiveCvId(savedCV.getId());
            studentProfileRepository.save(student);
            
            logger.info("Created and activated new CV {} for user {}", savedCV.getId(), userId);
            return savedCV;
        }
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
        try {
            String fullName = studentProfile.getFirstName() + " " + studentProfile.getLastName();
            String title = getStudentTitle(studentProfile);
            
            StringBuilder html = new StringBuilder();
            html.append("<!DOCTYPE html>\n");
            html.append("<html lang=\"en\">\n");
            html.append("<head>\n");
            html.append("  <meta charset=\"UTF-8\">\n");
            html.append("  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
            html.append("  <title>Resume - ").append(escapeHtml(fullName)).append("</title>\n");
            html.append("  <style>\n");
            html.append(getCVStyles());
            html.append("  </style>\n");
            html.append("</head>\n");
            html.append("<body>\n");
            html.append("  <div class=\"resume-container\">\n");
            
            // Header
            html.append("    <header class=\"header\">\n");
            html.append("      <h1>").append(escapeHtml(fullName)).append("</h1>\n");
            html.append("      <h2>").append(escapeHtml(title)).append("</h2>\n");
            html.append("    </header>\n");
            
            // Content Area
            html.append("    <div class=\"content\">\n");
            
            // Left Column
            html.append("      <div class=\"left-column\">\n");
            html.append(renderContactSection(studentProfile));
            html.append(renderSkillsSection(studentProfile));
            html.append(renderEducationSection(studentProfile));
            html.append(renderCertificationsSection(studentProfile));
            html.append("      </div>\n");
            
            // Right Column
            html.append("      <div class=\"right-column\">\n");
            html.append(renderProfessionalSummary(studentProfile));
            html.append(renderExperienceSection(studentProfile));
            html.append(renderProjectsSection(studentProfile));
            html.append("      </div>\n");
            
            html.append("    </div>\n");
            html.append("  </div>\n");
            html.append("</body>\n");
            html.append("</html>");
            
            return html.toString();
        } catch (Exception e) {
            logger.error("Error generating CV HTML", e);
            return createErrorHtml(e);
        }
    }
    
    private String getStudentTitle(StudentProfile profile) {
        if (profile.getExperiences() != null && !profile.getExperiences().isEmpty()) {
            return profile.getExperiences().iterator().next().getTitle();
        }
        return profile.getMajor() != null ? profile.getMajor() + " Student" : "Professional";
    }
    
    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#39;");
    }
    
    private String getCVStyles() {
        return """
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
            }
            
            body {
              background-color: #fff;
              color: #333;
              line-height: 1.6;
              font-size: 10pt;
              padding: 0;
              margin: 0;
            }
            
            @media print {
              body {
                width: 100%;
                margin: 0;
                padding: 0;
                background-color: #fff;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .resume-container {
                box-shadow: none;
                border: none;
              }
            }
            
            .resume-container {
              max-width: 8.5in;
              margin: 0 auto;
              background-color: #fff;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            
            .header {
              background-color: #2a2a2a;
              color: white;
              padding: 30px;
              text-align: center;
            }
            
            .header h1 {
              font-size: 24pt;
              text-transform: uppercase;
              letter-spacing: 2px;
              margin-bottom: 5px;
              font-weight: bold;
            }
            
            .header h2 {
              font-size: 14pt;
              font-weight: normal;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .content {
              display: flex;
            }
            
            .left-column {
              width: 30%;
              padding: 20px;
              background-color: #f8f8f8;
              border-right: 1px solid #eee;
            }
            
            .right-column {
              width: 70%;
              padding: 20px;
            }
            
            .section {
              margin-bottom: 20px;
            }
            
            .section-title {
              font-size: 12pt;
              text-transform: uppercase;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
              margin-bottom: 12px;
              font-weight: bold;
              color: #333;
            }
            
            .social-item {
              display: flex;
              align-items: center;
              margin-bottom: 6px;
              font-size: 9pt;
              word-break: break-all;
            }
            
            .social-icon {
              color: #2a2a2a;
              margin-right: 8px;
              min-width: 16px;
            }
            
            ul {
              list-style-type: disc;
              padding-left: 18px;
              margin-bottom: 10px;
            }
            
            li {
              margin-bottom: 6px;
              font-size: 9pt;
            }
            
            .exp-item, .project-item, .edu-item, .cert-item {
              margin-bottom: 15px;
            }
            
            .exp-item h4, .project-item h4 {
              font-size: 11pt;
              margin-bottom: 3px;
            }
            
            .exp-meta, .project-meta {
              font-size: 9pt;
              color: #666;
              margin-bottom: 6px;
              font-style: italic;
            }
            
            .summary-text {
              font-size: 9pt;
              margin-bottom: 10px;
            }
            """;
    }
    
    private String renderContactSection(StudentProfile profile) {
        StringBuilder html = new StringBuilder();
        html.append("        <div class=\"section\">\n");
        html.append("          <h3 class=\"section-title\">Contact</h3>\n");
        html.append("          <div>\n");
        
        if (profile.getEmail() != null) {
            html.append("            <p class=\"social-item\">✉ ").append(escapeHtml(profile.getEmail())).append("</p>\n");
        }
        if (profile.getPhoneNumber() != null) {
            html.append("            <p class=\"social-item\">📞 ").append(escapeHtml(profile.getPhoneNumber())).append("</p>\n");
        }
        if (profile.getLocation() != null) {
            html.append("            <p class=\"social-item\">📍 ").append(escapeHtml(profile.getLocation())).append("</p>\n");
        }
        if (profile.getLinkedinUrl() != null) {
            html.append("            <p class=\"social-item\">💼 ").append(escapeHtml(profile.getLinkedinUrl())).append("</p>\n");
        }
        if (profile.getGithubUrl() != null) {
            html.append("            <p class=\"social-item\">💻 ").append(escapeHtml(profile.getGithubUrl())).append("</p>\n");
        }
        if (profile.getPortfolioUrl() != null) {
            html.append("            <p class=\"social-item\">🌐 ").append(escapeHtml(profile.getPortfolioUrl())).append("</p>\n");
        }
        
        html.append("          </div>\n");
        html.append("        </div>\n");
        return html.toString();
    }
    
    private String renderSkillsSection(StudentProfile profile) {
        StringBuilder html = new StringBuilder();
        html.append("        <div class=\"section\">\n");
        html.append("          <h3 class=\"section-title\">Skills</h3>\n");
        
        if (profile.getSkills() != null && !profile.getSkills().isEmpty()) {
            String[] skills = profile.getSkills().split(",");
            html.append("          <ul>\n");
            for (String skill : skills) {
                html.append("            <li>").append(escapeHtml(skill.trim())).append("</li>\n");
            }
            html.append("          </ul>\n");
        } else {
            html.append("          <p>No skills listed</p>\n");
        }
        
        html.append("        </div>\n");
        return html.toString();
    }
    
    private String renderEducationSection(StudentProfile profile) {
        StringBuilder html = new StringBuilder();
        html.append("        <div class=\"section\">\n");
        html.append("          <h3 class=\"section-title\">Education</h3>\n");
        html.append("          <div class=\"edu-item\">\n");
        html.append("            <h4>").append(escapeHtml(profile.getUniversity() != null ? profile.getUniversity() : "University")).append("</h4>\n");
        html.append("            <p>").append(escapeHtml(profile.getMajor() != null ? profile.getMajor() : "Degree")).append("</p>\n");
        if (profile.getGraduationYear() != null) {
            html.append("            <p>").append(profile.getGraduationYear()).append("</p>\n");
        }
        html.append("          </div>\n");
        html.append("        </div>\n");
        return html.toString();
    }
    
    private String renderCertificationsSection(StudentProfile profile) {
        if (profile.getCertifications() == null || profile.getCertifications().isEmpty()) {
            return "";
        }
        
        StringBuilder html = new StringBuilder();
        html.append("        <div class=\"section\">\n");
        html.append("          <h3 class=\"section-title\">Certifications</h3>\n");
        
        for (Certification cert : profile.getCertifications()) {
            html.append("          <div class=\"cert-item\">\n");
            html.append("            <h4>").append(escapeHtml(cert.getName())).append("</h4>\n");
            html.append("            <p>").append(escapeHtml(cert.getIssuer()));
            if (cert.getDateReceived() != null) {
                html.append(" (").append(cert.getDateReceived()).append(")");
            }
            html.append("</p>\n");
            html.append("          </div>\n");
        }
        
        html.append("        </div>\n");
        return html.toString();
    }
    
    private String renderProfessionalSummary(StudentProfile profile) {
        if (profile.getBio() == null || profile.getBio().trim().isEmpty()) {
            return "";
        }
        
        StringBuilder html = new StringBuilder();
        html.append("        <div class=\"section\">\n");
        html.append("          <h3 class=\"section-title\">Professional Summary</h3>\n");
        html.append("          <p class=\"summary-text\">").append(escapeHtml(profile.getBio())).append("</p>\n");
        html.append("        </div>\n");
        return html.toString();
    }
    
    private String renderExperienceSection(StudentProfile profile) {
        StringBuilder html = new StringBuilder();
        html.append("        <div class=\"section\">\n");
        html.append("          <h3 class=\"section-title\">Experience</h3>\n");
        
        if (profile.getExperiences() != null && !profile.getExperiences().isEmpty()) {
            for (WorkExperience exp : profile.getExperiences()) {
                html.append("          <div class=\"exp-item\">\n");
                html.append("            <h4>").append(escapeHtml(exp.getTitle())).append(" at ").append(escapeHtml(exp.getCompany())).append("</h4>\n");
                html.append("            <p class=\"exp-meta\">");
                
                String dateRange = "";
                if (exp.getStartDate() != null) {
                    dateRange = exp.getStartDate().toString();
                    if (exp.getEndDate() != null) {
                        dateRange += " - " + exp.getEndDate().toString();
                    } else {
                        dateRange += " - Present";
                    }
                }
                html.append(dateRange);
                
                if (exp.getLocation() != null) {
                    html.append(" | ").append(escapeHtml(exp.getLocation()));
                }
                html.append("</p>\n");
                
                if (exp.getDescription() != null && !exp.getDescription().trim().isEmpty()) {
                    html.append("            <p>").append(escapeHtml(exp.getDescription())).append("</p>\n");
                }
                html.append("          </div>\n");
            }
        } else {
            html.append("          <p>No experience listed</p>\n");
        }
        
        html.append("        </div>\n");
        return html.toString();
    }
    
    private String renderProjectsSection(StudentProfile profile) {
        // Projects section can be extended in the future if needed
        return "";
    }
    
    private String createErrorHtml(Exception error) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <title>Resume Error</title>
              <style>
                body { 
                  font-family: 'Segoe UI', Arial, sans-serif; 
                  padding: 20px; 
                  line-height: 1.6;
                  color: #333;
                }
                .error { 
                  color: #e53e3e; 
                  margin-bottom: 1rem;
                  padding: 1rem;
                  border-left: 4px solid #e53e3e;
                  background-color: #fff5f5;
                }
                h1 { color: #2d3748; }
              </style>
            </head>
            <body>
              <h1>Resume Generation Error</h1>
              <p class="error">There was an error generating your resume. Please try again or contact support.</p>
              <p>Error details: """ + escapeHtml(error.getMessage()) + """
            </p>
            </body>
            </html>
            """;
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
