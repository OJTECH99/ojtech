package com.melardev.spring.jwtoauth.entities;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.NaturalId;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "cvs")
public class CV extends BaseEntity {

    @Column(name = "parsed_resume", columnDefinition = "text")
    private String parsedResume;
    
    @Column(name = "html_content", columnDefinition = "text")
    private String htmlContent;

    @Column(name = "template")
    private String template;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @Column(name = "active")
    private boolean active = false;
    
    @Column(name = "generated")
    private boolean generated = false;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private StudentProfile student;

    @OneToMany(mappedBy = "cv", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<JobApplication> applications = new ArrayList<>();

    @OneToMany(mappedBy = "cv", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Certification> certifications = new HashSet<>();

    @OneToMany(mappedBy = "cv", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<WorkExperience> experiences = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        lastUpdated = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }

    public String getParsedResume() {
        return parsedResume;
    }

    public void setParsedResume(String parsedResume) {
        this.parsedResume = parsedResume;
    }
    
    public String getHtmlContent() {
        return htmlContent;
    }
    
    public void setHtmlContent(String htmlContent) {
        this.htmlContent = htmlContent;
    }
    
    public String getTemplate() {
        return template;
    }
    
    public void setTemplate(String template) {
        this.template = template;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
    
    public boolean isGenerated() {
        return generated;
    }
    
    public void setGenerated(boolean generated) {
        this.generated = generated;
    }

    public StudentProfile getStudent() {
        return student;
    }

    public void setStudent(StudentProfile student) {
        this.student = student;
    }

    public List<JobApplication> getApplications() {
        return applications;
    }

    public void setApplications(List<JobApplication> applications) {
        this.applications = applications;
    }
    
    public Set<Certification> getCertifications() {
        return certifications;
    }

    public void setCertifications(Set<Certification> certifications) {
        this.certifications = certifications;
    }
    
    public void addCertification(Certification certification) {
        certifications.add(certification);
        certification.setCv(this);
    }
    
    public void removeCertification(Certification certification) {
        certifications.remove(certification);
        certification.setCv(null);
    }
    
    public Set<WorkExperience> getExperiences() {
        return experiences;
    }

    public void setExperiences(Set<WorkExperience> experiences) {
        this.experiences = experiences;
    }
    
    public void addExperience(WorkExperience experience) {
        experiences.add(experience);
        experience.setCv(this);
    }
    
    public void removeExperience(WorkExperience experience) {
        experiences.remove(experience);
        experience.setCv(null);
    }

    public void addApplication(JobApplication application) {
        applications.add(application);
        application.setCv(this);
    }

    public void removeApplication(JobApplication application) {
        applications.remove(application);
        application.setCv(null);
    }
} 