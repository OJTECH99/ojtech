package com.melardev.spring.jwtoauth.entities;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_email_tracking", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "email_date"}))
public class StudentEmailTracking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "student_id", nullable = false)
    private UUID studentId;
    
    @Column(name = "email_date", nullable = false)
    private LocalDate emailDate;
    
    @Column(name = "email_count", nullable = false)
    private Integer emailCount = 0;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public StudentEmailTracking() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public StudentEmailTracking(UUID studentId, LocalDate emailDate) {
        this();
        this.studentId = studentId;
        this.emailDate = emailDate;
        this.emailCount = 0;
    }
    
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public UUID getStudentId() {
        return studentId;
    }
    
    public void setStudentId(UUID studentId) {
        this.studentId = studentId;
    }
    
    public LocalDate getEmailDate() {
        return emailDate;
    }
    
    public void setEmailDate(LocalDate emailDate) {
        this.emailDate = emailDate;
    }
    
    public Integer getEmailCount() {
        return emailCount;
    }
    
    public void setEmailCount(Integer emailCount) {
        this.emailCount = emailCount;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void incrementEmailCount() {
        this.emailCount++;
        this.updatedAt = LocalDateTime.now();
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
