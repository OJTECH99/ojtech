package com.melardev.spring.jwtoauth.dtos;

public class EmailDraftDTO {
    private String to;
    private String toName;
    private String subject;
    private String body;
    private String cvUrl;
    private String studentName;
    private String studentEmail;
    private String studentPhone;
    private String studentUniversity;
    private String studentMajor;
    
    public EmailDraftDTO() {
    }
    
    public EmailDraftDTO(String to, String toName, String subject, String body, String cvUrl,
                        String studentName, String studentEmail, String studentPhone, 
                        String studentUniversity, String studentMajor) {
        this.to = to;
        this.toName = toName;
        this.subject = subject;
        this.body = body;
        this.cvUrl = cvUrl;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.studentPhone = studentPhone;
        this.studentUniversity = studentUniversity;
        this.studentMajor = studentMajor;
    }
    
    // Getters and Setters
    public String getTo() {
        return to;
    }
    
    public void setTo(String to) {
        this.to = to;
    }
    
    public String getToName() {
        return toName;
    }
    
    public void setToName(String toName) {
        this.toName = toName;
    }
    
    public String getSubject() {
        return subject;
    }
    
    public void setSubject(String subject) {
        this.subject = subject;
    }
    
    public String getBody() {
        return body;
    }
    
    public void setBody(String body) {
        this.body = body;
    }
    
    public String getCvUrl() {
        return cvUrl;
    }
    
    public void setCvUrl(String cvUrl) {
        this.cvUrl = cvUrl;
    }
    
    public String getStudentName() {
        return studentName;
    }
    
    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }
    
    public String getStudentEmail() {
        return studentEmail;
    }
    
    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }
    
    public String getStudentPhone() {
        return studentPhone;
    }
    
    public void setStudentPhone(String studentPhone) {
        this.studentPhone = studentPhone;
    }
    
    public String getStudentUniversity() {
        return studentUniversity;
    }
    
    public void setStudentUniversity(String studentUniversity) {
        this.studentUniversity = studentUniversity;
    }
    
    public String getStudentMajor() {
        return studentMajor;
    }
    
    public void setStudentMajor(String studentMajor) {
        this.studentMajor = studentMajor;
    }
}
