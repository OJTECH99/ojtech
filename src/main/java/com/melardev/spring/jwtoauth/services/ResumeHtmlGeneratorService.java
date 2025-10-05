package com.melardev.spring.jwtoauth.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

@Service
public class ResumeHtmlGeneratorService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateResumeHtml(String jsonContent) {
        try {
            JsonNode resumeData = objectMapper.readTree(jsonContent);
            return buildHtmlFromJson(resumeData);
        } catch (Exception e) {
            return generateErrorHtml("Error parsing resume data: " + e.getMessage());
        }
    }

    private String buildHtmlFromJson(JsonNode data) {
        StringBuilder html = new StringBuilder();
        
        html.append("<!DOCTYPE html>");
        html.append("<html lang=\"en\">");
        html.append("<head>");
        html.append("<meta charset=\"UTF-8\">");
        html.append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
        html.append("<title>Resume</title>");
        html.append(getStyles());
        html.append("</head>");
        html.append("<body>");
        html.append("<div class=\"resume-container\">");
        
        // Header with contact info
        html.append(buildHeader(data));
        
        html.append("<div class=\"content\">");
        
        // Left column
        html.append("<div class=\"left-column\">");
        html.append(buildContactSection(data));
        html.append(buildSkillsSection(data));
        html.append(buildEducationSection(data));
        html.append(buildCertificationsSection(data));
        html.append("</div>");
        
        // Right column
        html.append("<div class=\"right-column\">");
        html.append(buildProfessionalSummarySection(data));
        html.append(buildExperienceSection(data));
        html.append(buildProjectsSection(data));
        html.append("</div>");
        
        html.append("</div>"); // content
        html.append("</div>"); // resume-container
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }

    private String buildHeader(JsonNode data) {
        StringBuilder html = new StringBuilder();
        JsonNode contactInfo = data.has("contactInfo") ? data.get("contactInfo") : data.get("personalInfo");
        
        html.append("<header class=\"header\">");
        if (contactInfo != null && contactInfo.has("name")) {
            html.append("<h1>").append(escapeHtml(contactInfo.get("name").asText())).append("</h1>");
        }
        html.append("<h2>PROFESSIONAL</h2>");
        html.append("</header>");
        
        return html.toString();
    }

    private String buildContactSection(JsonNode data) {
        StringBuilder html = new StringBuilder();
        JsonNode contactInfo = data.has("contactInfo") ? data.get("contactInfo") : data.get("personalInfo");
        
        if (contactInfo == null) return "";
        
        html.append("<div class=\"section\">");
        html.append("<h3 class=\"section-title\">Contact</h3>");
        html.append("<div>");
        
        if (contactInfo.has("email")) {
            html.append("<p class=\"social-item\">");
            html.append("<svg class=\"social-icon\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\">");
            html.append("<path d=\"M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z\"/>");
            html.append("</svg>");
            html.append(escapeHtml(contactInfo.get("email").asText()));
            html.append("</p>");
        }
        if (contactInfo.has("phone") && !contactInfo.get("phone").asText().isEmpty()) {
            html.append("<p class=\"social-item\">");
            html.append("<svg class=\"social-icon\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\">");
            html.append("<path d=\"M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z\"/>");
            html.append("</svg>");
            html.append(escapeHtml(contactInfo.get("phone").asText()));
            html.append("</p>");
        }
        if (contactInfo.has("location") && !contactInfo.get("location").asText().isEmpty()) {
            html.append("<p class=\"social-item\">");
            html.append("<svg class=\"social-icon\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\">");
            html.append("<path d=\"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z\"/>");
            html.append("</svg>");
            html.append(escapeHtml(contactInfo.get("location").asText()));
            html.append("</p>");
        }
        if (contactInfo.has("linkedin") && !contactInfo.get("linkedin").asText().isEmpty()) {
            html.append("<p class=\"social-item\">");
            html.append("<svg class=\"social-icon\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\">");
            html.append("<path d=\"M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z\"/>");
            html.append("</svg>");
            html.append(escapeHtml(contactInfo.get("linkedin").asText()));
            html.append("</p>");
        }
        if (contactInfo.has("github") && !contactInfo.get("github").asText().isEmpty()) {
            html.append("<p class=\"social-item\">");
            html.append("<svg class=\"social-icon\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\">");
            html.append("<path d=\"M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.335-1.725-1.335-1.725-1.087-.731.084-.716.084-.716 1.205.082 1.838 1.215 1.838 1.215 1.07 1.803 2.809 1.282 3.495.981.108-.763.417-1.282.76-1.577-2.665-.295-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.54-1.497.105-3.121 0 0 1.005-.316 3.3 1.209.96-.262 1.98-.392 3-.398 1.02.006 2.04.136 3 .398 2.28-1.525 3.285-1.209 3.285-1.209.645 1.624.24 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .309.21.678.825.56C20.565 21.917 24 17.495 24 12.292 24 5.78 18.627.5 12 .5z\"/>");
            html.append("</svg>");
            html.append(escapeHtml(contactInfo.get("github").asText()));
            html.append("</p>");
        }
        if (contactInfo.has("portfolio") && !contactInfo.get("portfolio").asText().isEmpty()) {
            html.append("<p class=\"social-item\">");
            html.append("<svg class=\"social-icon\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\">");
            html.append("<path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z\"/>");
            html.append("</svg>");
            html.append(escapeHtml(contactInfo.get("portfolio").asText()));
            html.append("</p>");
        }
        
        html.append("</div>");
        html.append("</div>");
        
        return html.toString();
    }

    private String buildSkillsSection(JsonNode data) {
        if (!data.has("skills")) return "";
        
        JsonNode skills = data.get("skills");
        JsonNode skillsList = skills.has("skillsList") ? skills.get("skillsList") : skills;
        
        if (skillsList == null || !skillsList.isArray() || skillsList.size() == 0) return "";
        
        StringBuilder html = new StringBuilder();
        html.append("<section class=\"section\">");
        html.append("<h2 class=\"section-title\">SKILLS</h2>");
        html.append("<div class=\"section-content\">");
        html.append("<ul class=\"skills-list\">");
        
        for (JsonNode skill : skillsList) {
            html.append("<li>").append(escapeHtml(skill.asText())).append("</li>");
        }
        
        html.append("</ul>");
        html.append("</div>");
        html.append("</section>");
        
        return html.toString();
    }

    private String buildEducationSection(JsonNode data) {
        if (!data.has("education")) return "";
        
        JsonNode education = data.get("education");
        
        StringBuilder html = new StringBuilder();
        html.append("<section class=\"section\">");
        html.append("<h2 class=\"section-title\">EDUCATION</h2>");
        html.append("<div class=\"section-content\">");
        
        if (education.has("university")) {
            html.append("<p class=\"education-item\"><strong>").append(escapeHtml(education.get("university").asText())).append("</strong></p>");
        }
        if (education.has("major")) {
            html.append("<p class=\"education-item\">").append(escapeHtml(education.get("major").asText())).append("</p>");
        }
        if (education.has("graduationYear") && !education.get("graduationYear").asText().isEmpty()) {
            html.append("<p class=\"education-item\">Class of ").append(escapeHtml(education.get("graduationYear").asText())).append("</p>");
        }
        if (education.has("location") && !education.get("location").asText().isEmpty()) {
            html.append("<p class=\"education-item text-gray\">").append(escapeHtml(education.get("location").asText())).append("</p>");
        }
        
        html.append("</div>");
        html.append("</section>");
        
        return html.toString();
    }

    private String buildCertificationsSection(JsonNode data) {
        if (!data.has("certifications")) return "";
        
        JsonNode certifications = data.get("certifications");
        JsonNode certList = certifications.has("certificationsList") ? certifications.get("certificationsList") : certifications;
        
        if (certList == null || !certList.isArray() || certList.size() == 0) return "";
        
        StringBuilder html = new StringBuilder();
        html.append("<section class=\"section\">");
        html.append("<h2 class=\"section-title\">CERTIFICATIONS</h2>");
        html.append("<div class=\"section-content\">");
        
        for (JsonNode cert : certList) {
            if (cert.has("name")) {
                html.append("<div class=\"cert-item\">");
                html.append("<p><strong>").append(escapeHtml(cert.get("name").asText())).append("</strong></p>");
                if (cert.has("issuer")) {
                    html.append("<p>").append(escapeHtml(cert.get("issuer").asText())).append("</p>");
                }
                if (cert.has("dateReceived") && !cert.get("dateReceived").asText().isEmpty()) {
                    html.append("<p class=\"text-gray\">").append(escapeHtml(cert.get("dateReceived").asText())).append("</p>");
                }
                html.append("</div>");
            }
        }
        
        html.append("</div>");
        html.append("</section>");
        
        return html.toString();
    }

    private String buildProfessionalSummarySection(JsonNode data) {
        if (!data.has("professionalSummary")) return "";
        
        JsonNode summary = data.get("professionalSummary");
        JsonNode summaryPoints = summary.has("summaryPoints") ? summary.get("summaryPoints") : summary;
        
        if (summaryPoints == null || !summaryPoints.isArray() || summaryPoints.size() == 0) return "";
        
        StringBuilder html = new StringBuilder();
        html.append("<section class=\"section\">");
        html.append("<h2 class=\"section-title\">PROFESSIONAL SUMMARY</h2>");
        html.append("<div class=\"section-content\">");
        html.append("<ul class=\"summary-list\">");
        
        for (JsonNode point : summaryPoints) {
            html.append("<li>").append(escapeHtml(point.asText())).append("</li>");
        }
        
        html.append("</ul>");
        html.append("</div>");
        html.append("</section>");
        
        return html.toString();
    }

    private String buildExperienceSection(JsonNode data) {
        if (!data.has("experience")) return "";
        
        JsonNode experience = data.get("experience");
        JsonNode experiences = experience.has("experiences") ? experience.get("experiences") : experience;
        
        if (experiences == null || !experiences.isArray() || experiences.size() == 0) return "";
        
        StringBuilder html = new StringBuilder();
        html.append("<section class=\"section\">");
        html.append("<h2 class=\"section-title\">EXPERIENCE</h2>");
        html.append("<div class=\"section-content\">");
        
        for (JsonNode exp : experiences) {
            html.append("<div class=\"experience-item\">");
            
            if (exp.has("title")) {
                html.append("<h3 class=\"exp-title\">").append(escapeHtml(exp.get("title").asText())).append("</h3>");
            }
            if (exp.has("company")) {
                html.append("<p class=\"exp-company\">").append(escapeHtml(exp.get("company").asText()));
                if (exp.has("location") && !exp.get("location").asText().isEmpty()) {
                    html.append(" | ").append(escapeHtml(exp.get("location").asText()));
                }
                html.append("</p>");
            }
            if (exp.has("dateRange")) {
                html.append("<p class=\"exp-date\">").append(escapeHtml(exp.get("dateRange").asText())).append("</p>");
            }
            
            if (exp.has("achievements") && exp.get("achievements").isArray() && exp.get("achievements").size() > 0) {
                html.append("<ul class=\"achievements-list\">");
                for (JsonNode achievement : exp.get("achievements")) {
                    html.append("<li>").append(escapeHtml(achievement.asText())).append("</li>");
                }
                html.append("</ul>");
            }
            
            html.append("</div>");
        }
        
        html.append("</div>");
        html.append("</section>");
        
        return html.toString();
    }

    private String buildProjectsSection(JsonNode data) {
        if (!data.has("projects")) return "";
        
        JsonNode projects = data.get("projects");
        JsonNode projectsList = projects.has("projectsList") ? projects.get("projectsList") : projects;
        
        if (projectsList == null || !projectsList.isArray() || projectsList.size() == 0) return "";
        
        StringBuilder html = new StringBuilder();
        html.append("<section class=\"section\">");
        html.append("<h2 class=\"section-title\">PROJECTS</h2>");
        html.append("<div class=\"section-content\">");
        
        for (JsonNode project : projectsList) {
            html.append("<div class=\"project-item\">");
            
            if (project.has("name")) {
                html.append("<h3 class=\"project-title\">").append(escapeHtml(project.get("name").asText())).append("</h3>");
            }
            if (project.has("technologies") && !project.get("technologies").asText().isEmpty()) {
                html.append("<p class=\"project-tech\">").append(escapeHtml(project.get("technologies").asText())).append("</p>");
            }
            
            if (project.has("highlights") && project.get("highlights").isArray() && project.get("highlights").size() > 0) {
                html.append("<ul class=\"highlights-list\">");
                for (JsonNode highlight : project.get("highlights")) {
                    html.append("<li>").append(escapeHtml(highlight.asText())).append("</li>");
                }
                html.append("</ul>");
            }
            
            html.append("</div>");
        }
        
        html.append("</div>");
        html.append("</section>");
        
        return html.toString();
    }

    private String getStyles() {
        return "<style>" +
            "* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Arial, Helvetica, sans-serif; }" +
            "body { background-color: #fff; color: #333; line-height: 1.6; font-size: 10pt; padding: 0; margin: 0; }" +
            "@media print { body { width: 100%; margin: 0; padding: 0; background-color: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; } .resume-container { box-shadow: none; border: none; } }" +
            ".resume-container { max-width: 8.5in; margin: 0 auto; background-color: #fff; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }" +
            ".header { background-color: #2a2a2a; color: white; padding: 30px; text-align: center; }" +
            ".header h1 { font-size: 24pt; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; font-weight: bold; }" +
            ".header h2 { font-size: 14pt; font-weight: normal; text-transform: uppercase; letter-spacing: 1px; }" +
            ".content { display: flex; }" +
            ".left-column { width: 30%; padding: 20px; background-color: #f8f8f8; border-right: 1px solid #eee; }" +
            ".right-column { width: 70%; padding: 20px; }" +
            ".section { margin-bottom: 20px; }" +
            ".section-title { font-size: 12pt; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 12px; font-weight: bold; color: #333; }" +
            ".social-item { display: flex; align-items: center; margin-bottom: 6px; font-size: 9pt; }" +
            ".social-icon { color: #2a2a2a; margin-right: 8px; min-width: 16px; }" +
            "ul { list-style-type: disc; padding-left: 18px; margin-bottom: 10px; }" +
            "li { margin-bottom: 6px; font-size: 9pt; }" +
            ".exp-item, .project-item, .edu-item, .cert-item { margin-bottom: 15px; }" +
            ".exp-item h4, .project-item h4 { font-size: 11pt; margin-bottom: 3px; }" +
            ".exp-meta, .project-meta { font-size: 9pt; color: #666; margin-bottom: 6px; font-style: italic; }" +
            ".summary-list li { margin-bottom: 8px; }" +
            "</style>";
    }

    private String generateErrorHtml(String errorMessage) {
        return "<!DOCTYPE html>" +
            "<html lang=\"en\">" +
            "<head>" +
            "<meta charset=\"UTF-8\">" +
            "<title>Resume Error</title>" +
            "<style>body { font-family: Arial, sans-serif; padding: 40px; text-align: center; } .error { color: #e53e3e; border: 2px solid #e53e3e; padding: 20px; border-radius: 8px; background-color: #fff5f5; }</style>" +
            "</head>" +
            "<body>" +
            "<div class=\"error\">" +
            "<h1>Error Loading Resume</h1>" +
            "<p>" + escapeHtml(errorMessage) + "</p>" +
            "</div>" +
            "</body>" +
            "</html>";
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#39;");
    }
}
