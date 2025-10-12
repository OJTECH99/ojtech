package com.melardev.spring.jwtoauth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;

@Service
public class EmailService {

    @Autowired
    private BrevoEmailService brevoEmailService;

    public void sendVerificationEmail(String toEmail, String userId) throws MessagingException {
        try {
            brevoEmailService.sendVerificationEmail(toEmail, userId);
        } catch (Exception e) {
            throw new MessagingException("Failed to send verification email: " + e.getMessage());
        }
    }
    
    public void sendUserCreationEmail(String toEmail, String username, String password, String userId) throws MessagingException {
        try {
            brevoEmailService.sendUserCreationEmail(toEmail, username, password, userId);
        } catch (Exception e) {
            throw new MessagingException("Failed to send user creation email: " + e.getMessage());
        }
    }
    
    public void sendJobApplicationEmail(String recipientEmail, String recipientName, 
                                       String studentName, String studentEmail, String studentPhone,
                                       String studentUniversity, String studentMajor,
                                       String jobTitle, String companyName,
                                       String coverLetter, String cvUrl,
                                       String customEmailBody,
                                       org.springframework.web.multipart.MultipartFile[] attachments) throws MessagingException {
        try {
            // Note: File attachments are not supported via Brevo API in this implementation
            // For file attachments, consider using SMTP or implementing Brevo's attachment API
            brevoEmailService.sendJobApplicationEmail(
                recipientEmail, recipientName, studentName, studentEmail, studentPhone,
                studentUniversity, studentMajor, jobTitle, companyName,
                coverLetter, cvUrl, customEmailBody
            );
        } catch (Exception e) {
            throw new MessagingException("Failed to send job application email: " + e.getMessage());
        }
    }
}