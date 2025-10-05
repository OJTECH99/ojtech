package com.melardev.spring.jwtoauth.entities;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;

@Entity
@Table(name = "certifications")
public class Certification extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "issuer", nullable = false)
    private String issuer;
    
    @Column(name = "date_received", nullable = false)
    private LocalDate dateReceived;
    
    @Column(name = "expiry_date")
    private LocalDate expiryDate;
    
    @Column(name = "credential_url")
    private String credentialUrl;
    
    @ManyToOne
    @JoinColumn(name = "cv_id")
    @JsonIgnore
    private CV cv;
    
    @ManyToOne
    @JoinColumn(name = "student_id")
    @JsonIgnore
    private StudentProfile student;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }

    public LocalDate getDateReceived() {
        return dateReceived;
    }

    public void setDateReceived(LocalDate dateReceived) {
        this.dateReceived = dateReceived;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getCredentialUrl() {
        return credentialUrl;
    }

    public void setCredentialUrl(String credentialUrl) {
        this.credentialUrl = credentialUrl;
    }

    public CV getCv() {
        return cv;
    }

    public void setCv(CV cv) {
        this.cv = cv;
    }

    public StudentProfile getStudent() {
        return student;
    }

    public void setStudent(StudentProfile student) {
        this.student = student;
    }
} 