package com.ojtechapi.spring.jwtoauth.dtos;

public class SendEmailRequest {
    private String subject;
    private String emailBody;
    
    public SendEmailRequest() {
    }
    
    public SendEmailRequest(String subject, String emailBody) {
        this.subject = subject;
        this.emailBody = emailBody;
    }
    
    public String getSubject() {
        return subject;
    }
    
    public void setSubject(String subject) {
        this.subject = subject;
    }
    
    public String getEmailBody() {
        return emailBody;
    }
    
    public void setEmailBody(String emailBody) {
        this.emailBody = emailBody;
    }
}
