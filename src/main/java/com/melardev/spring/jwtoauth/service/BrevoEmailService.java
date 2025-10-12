package com.melardev.spring.jwtoauth.service;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class BrevoEmailService {

    private static final Logger logger = LoggerFactory.getLogger(BrevoEmailService.class);

    @Autowired
    private JavaMailSender emailSender;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${backend.base-url}")
    private String baseUrl;

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.api.url}")
    private String brevoApiUrl;

    /**
     * Send email using Brevo REST API (recommended for advanced features)
     */
    public void sendEmailViaAPI(String toEmail, String toName, String subject, String htmlContent, String textContent) {
        try {
            Map<String, Object> emailData = new HashMap<>();
            
            // Sender information
            Map<String, String> sender = new HashMap<>();
            sender.put("name", "OJTech");
            sender.put("email", fromEmail);
            emailData.put("sender", sender);
            
            // Recipients
            List<Map<String, String>> to = new ArrayList<>();
            Map<String, String> recipient = new HashMap<>();
            recipient.put("email", toEmail);
            if (toName != null && !toName.trim().isEmpty()) {
                recipient.put("name", toName);
            }
            to.add(recipient);
            emailData.put("to", to);
            
            // Email content
            emailData.put("subject", subject);
            emailData.put("htmlContent", htmlContent);
            if (textContent != null && !textContent.trim().isEmpty()) {
                emailData.put("textContent", textContent);
            }
            
            // Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", brevoApiKey);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(emailData, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                brevoApiUrl + "/smtp/email",
                HttpMethod.POST,
                request,
                String.class
            );
            
            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("Email sent successfully via Brevo API to: {}", toEmail);
            } else {
                logger.error("Failed to send email via Brevo API. Status: {}, Response: {}", 
                    response.getStatusCode(), response.getBody());
                throw new RuntimeException("Failed to send email via Brevo API");
            }
            
        } catch (Exception e) {
            logger.error("Error sending email via Brevo API to {}: {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("Failed to send email via Brevo API: " + e.getMessage());
        }
    }

    /**
     * Send email using traditional SMTP (fallback method)
     */
    public void sendEmailViaSMTP(String toEmail, String toName, String subject, String htmlContent) throws MessagingException {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "OJTech");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            emailSender.send(message);
            logger.info("Email sent successfully via SMTP to: {}", toEmail);
        } catch (MessagingException | UnsupportedEncodingException e) {
            logger.error("Failed to send email via SMTP to {}: {}", toEmail, e.getMessage(), e);
            throw new MessagingException("Failed to send email via SMTP: " + e.getMessage());
        }
    }

    /**
     * Send verification email using Brevo API
     */
    public void sendVerificationEmail(String toEmail, String userId) {
        try {
            String verificationUrl = baseUrl + "/api/auth/verifyEmail/" + userId;
            String subject = "Welcome to OJTech - Verify Your Email";
            String htmlContent = generateVerificationEmailHtml(verificationUrl);
            String textContent = generateVerificationEmailText(verificationUrl);
            
            sendEmailViaAPI(toEmail, null, subject, htmlContent, textContent);
            logger.info("Verification email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send verification email to {}: {}", toEmail, e.getMessage());
            // Fallback to SMTP if API fails
            try {
                String verificationUrl = baseUrl + "/api/auth/verifyEmail/" + userId;
                String subject = "Welcome to OJTech - Verify Your Email";
                String htmlContent = generateVerificationEmailHtml(verificationUrl);
                sendEmailViaSMTP(toEmail, null, subject, htmlContent);
                logger.info("Verification email sent via SMTP fallback to: {}", toEmail);
            } catch (MessagingException smtpException) {
                logger.error("Both API and SMTP failed for verification email to {}", toEmail);
                throw new RuntimeException("Failed to send verification email: " + e.getMessage());
            }
        }
    }

    /**
     * Send user creation email using Brevo API
     */
    public void sendUserCreationEmail(String toEmail, String username, String password, String userId) {
        try {
            String verificationUrl = baseUrl + "/api/auth/verifyEmail/" + userId;
            String subject = "Your OJTech Account Has Been Created";
            String htmlContent = generateUserCreationEmailHtml(toEmail, password, verificationUrl);
            String textContent = generateUserCreationEmailText(toEmail, password, verificationUrl);
            
            sendEmailViaAPI(toEmail, username, subject, htmlContent, textContent);
            logger.info("User creation email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send user creation email to {}: {}", toEmail, e.getMessage());
            // Fallback to SMTP if API fails
            try {
                String verificationUrl = baseUrl + "/api/auth/verifyEmail/" + userId;
                String subject = "Your OJTech Account Has Been Created";
                String htmlContent = generateUserCreationEmailHtml(toEmail, password, verificationUrl);
                sendEmailViaSMTP(toEmail, username, subject, htmlContent);
                logger.info("User creation email sent via SMTP fallback to: {}", toEmail);
            } catch (MessagingException smtpException) {
                logger.error("Both API and SMTP failed for user creation email to {}", toEmail);
                throw new RuntimeException("Failed to send user creation email: " + e.getMessage());
            }
        }
    }

    /**
     * Send job application email using Brevo API
     */
    public void sendJobApplicationEmail(String recipientEmail, String recipientName, 
                                       String studentName, String studentEmail, String studentPhone,
                                       String studentUniversity, String studentMajor,
                                       String jobTitle, String companyName,
                                       String coverLetter, String cvUrl,
                                       String customEmailBody) {
        try {
            String subject = "Job Application for " + jobTitle + " - " + studentName;
            String emailBodyContent = customEmailBody != null && !customEmailBody.trim().isEmpty() 
                ? customEmailBody 
                : generateDefaultEmailBody(studentName, jobTitle, coverLetter);
            
            String htmlContent = generateJobApplicationEmailHtml(
                recipientName, emailBodyContent, studentName, studentEmail, studentPhone,
                studentUniversity, studentMajor, cvUrl
            );
            String textContent = generateJobApplicationEmailText(
                recipientName, emailBodyContent, studentName, studentEmail, studentPhone,
                studentUniversity, studentMajor, cvUrl
            );
            
            sendEmailViaAPI(recipientEmail, recipientName, subject, htmlContent, textContent);
            logger.info("Job application email sent successfully to: {}", recipientEmail);
        } catch (Exception e) {
            logger.error("Failed to send job application email to {}: {}", recipientEmail, e.getMessage());
            // Fallback to SMTP if API fails
            try {
                String subject = "Job Application for " + jobTitle + " - " + studentName;
                String emailBodyContent = customEmailBody != null && !customEmailBody.trim().isEmpty() 
                    ? customEmailBody 
                    : generateDefaultEmailBody(studentName, jobTitle, coverLetter);
                
                String htmlContent = generateJobApplicationEmailHtml(
                    recipientName, emailBodyContent, studentName, studentEmail, studentPhone,
                    studentUniversity, studentMajor, cvUrl
                );
                sendEmailViaSMTP(recipientEmail, recipientName, subject, htmlContent);
                logger.info("Job application email sent via SMTP fallback to: {}", recipientEmail);
            } catch (MessagingException smtpException) {
                logger.error("Both API and SMTP failed for job application email to {}", recipientEmail);
                throw new RuntimeException("Failed to send job application email: " + e.getMessage());
            }
        }
    }

    private String generateVerificationEmailHtml(String verificationUrl) {
        return String.format("""
            <html>
                <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
                    <div style="max-width: 400px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Email Icon -->
                        <div style="background-color:rgb(0, 0, 0); width: 64px; height: 64px; border-radius: 50%%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                            <img src="https://res.cloudinary.com/df7wrezta/image/upload/v1748160270/dbe6m8ajpudgn6veyopz.png" style="width: 64px; height: 64px;"/>
                        </div>
                        
                        <h2 style="color: #333333; margin: 0 0 10px; font-size: 24px;">Welcome to OJTech!</h2>
                        <p style="color: #666666; margin: 0 0 5px; font-size: 14px;">🔒 Secure Email Verification</p>
                        
                        <p style="color: #666666; margin: 24px 0; font-size: 14px; line-height: 1.5;">
                            Please click the button below to verify your account<br/>
                            and get started.
                        </p>
                        
                        <a href="%s" style="background-color:rgb(0, 0, 0); color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 500; margin: 20px 0;">
                            <span style="display: inline-flex; align-items: center;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                Verify Email Address
                            </span>
                        </a>
                        
                        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #eee;">
                            <p style="color: #666666; font-size: 13px; margin: 0 0 8px;">Didn't create an account?</p>
                            <p style="color: #666666; font-size: 13px; margin: 0;">You can safely ignore this email. No account will be created.</p>
                        </div>
                        
                        <div style="margin-top: 32px; color: #999999; font-size: 12px;">
                            <p style="margin: 0 0 8px;">This is an automated message. Please do not reply to this email.</p>
                            <p style="margin: 0; color: #999999;">Powered by <span style="color: #666666;">OJTech</span></p>
                        </div>
                    </div>
                </body>
            </html>
            """, verificationUrl);
    }

    private String generateVerificationEmailText(String verificationUrl) {
        return String.format("""
            Welcome to OJTech!
            
            Please verify your email address by clicking the following link:
            %s
            
            If you didn't create an account, you can safely ignore this email.
            
            This is an automated message. Please do not reply to this email.
            Powered by OJTech
            """, verificationUrl);
    }

    private String generateUserCreationEmailHtml(String email, String password, String verificationUrl) {
        return String.format("""
            <html>
                <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
                    <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Email Icon -->
                        <div style="background-color:rgb(0, 0, 0); width: 64px; height: 64px; border-radius: 50%%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                            <img src="https://res.cloudinary.com/df7wrezta/image/upload/v1748160270/dbe6m8ajpudgn6veyopz.png" style="width: 64px; height: 64px;"/>
                        </div>
                        
                        <h2 style="color: #333333; margin: 0 0 10px; font-size: 24px;">Welcome to OJTech!</h2>
                        <p style="color: #666666; margin: 0 0 5px; font-size: 14px;">Your account has been created by an administrator</p>
                        
                        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: left;">
                            <p style="margin: 0 0 8px; color: #666666; font-size: 14px;"><strong>Email:</strong> %s</p>
                            <p style="margin: 0; color: #666666; font-size: 14px;"><strong>Password:</strong> %s</p>
                            <p style="margin: 16px 0 0; color: #666666; font-size: 13px; font-style: italic;">Please change your password after logging in.</p>
                        </div>
                        
                        <p style="color: #666666; margin: 24px 0; font-size: 14px; line-height: 1.5;">
                            Please click the button below to verify your account<br/>
                            and get started.
                        </p>
                        
                        <a href="%s" style="background-color:rgb(0, 0, 0); color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 500; margin: 20px 0;">
                            <span style="display: inline-flex; align-items: center;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                Verify Email Address
                            </span>
                        </a>
                        
                        <div style="margin-top: 32px; color: #999999; font-size: 12px;">
                            <p style="margin: 0 0 8px;">This is an automated message. Please do not reply to this email.</p>
                            <p style="margin: 0; color: #999999;">Powered by <span style="color: #666666;">OJTech</span></p>
                        </div>
                    </div>
                </body>
            </html>
            """, email, password, verificationUrl);
    }

    private String generateUserCreationEmailText(String email, String password, String verificationUrl) {
        return String.format("""
            Welcome to OJTech!
            
            Your account has been created by an administrator.
            
            Login Details:
            Email: %s
            Password: %s
            
            Please change your password after logging in.
            
            Verify your account by clicking the following link:
            %s
            
            This is an automated message. Please do not reply to this email.
            Powered by OJTech
            """, email, password, verificationUrl);
    }

    private String generateJobApplicationEmailHtml(String recipientName, String emailBodyContent,
                                                   String studentName, String studentEmail, String studentPhone,
                                                   String studentUniversity, String studentMajor, String cvUrl) {
        return String.format("""
            <html>
                <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
                    <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="background-color:rgb(0, 0, 0); width: 64px; height: 64px; border-radius: 50%%; margin: 0 auto 20px;">
                                <img src="https://res.cloudinary.com/df7wrezta/image/upload/v1748160270/dbe6m8ajpudgn6veyopz.png" style="width: 64px; height: 64px;"/>
                            </div>
                            <h2 style="color: #333333; margin: 0;">New Job Application</h2>
                            <p style="color: #666666; margin: 5px 0;">via OJTech Platform</p>
                        </div>
                        <p style="color: #333333; font-size: 16px; margin-bottom: 20px;">Dear %s,</p>
                        <div style="color: #333333; font-size: 14px; line-height: 1.6; margin-bottom: 25px; white-space: pre-wrap;">%s</div>
                        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
                            <h3 style="color: #333333; margin: 0 0 15px; font-size: 16px;">Applicant Information</h3>
                            <table style="width: 100%%; border-collapse: collapse;">
                                <tr><td style="padding: 8px 0; color: #666666; font-weight: 500;">Name:</td><td style="padding: 8px 0; color: #333333;">%s</td></tr>
                                <tr><td style="padding: 8px 0; color: #666666; font-weight: 500;">Email:</td><td style="padding: 8px 0;"><a href="mailto:%s" style="color: #007bff;">%s</a></td></tr>
                                <tr><td style="padding: 8px 0; color: #666666; font-weight: 500;">Phone:</td><td style="padding: 8px 0; color: #333333;">%s</td></tr>
                                <tr><td style="padding: 8px 0; color: #666666; font-weight: 500;">University:</td><td style="padding: 8px 0; color: #333333;">%s</td></tr>
                                <tr><td style="padding: 8px 0; color: #666666; font-weight: 500;">Major:</td><td style="padding: 8px 0; color: #333333;">%s</td></tr>
                            </table>
                        </div>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s" style="background-color:rgb(0, 0, 0); color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 500;">Download CV/Resume</a>
                        </div>
                        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999999; font-size: 12px; text-align: center;">
                            <p style="margin: 0 0 8px;">This application was submitted through OJTech.</p>
                            <p style="margin: 0 0 8px;"><strong style="color: #666666;">Click "Reply" to respond directly to %s (%s)</strong></p>
                            <p style="margin: 0;">Your reply will automatically go to the applicant's email address.</p>
                        </div>
                    </div>
                </body>
            </html>
            """, 
            recipientName != null ? recipientName : "Hiring Manager",
            emailBodyContent, studentName, studentEmail, studentEmail,
            studentPhone != null ? studentPhone : "Not provided",
            studentUniversity != null ? studentUniversity : "Not provided",
            studentMajor != null ? studentMajor : "Not provided",
            cvUrl != null ? cvUrl : "#",
            studentName, studentEmail);
    }

    private String generateJobApplicationEmailText(String recipientName, String emailBodyContent,
                                                   String studentName, String studentEmail, String studentPhone,
                                                   String studentUniversity, String studentMajor, String cvUrl) {
        return String.format("""
            New Job Application via OJTech Platform
            
            Dear %s,
            
            %s
            
            Applicant Information:
            Name: %s
            Email: %s
            Phone: %s
            University: %s
            Major: %s
            
            CV/Resume: %s
            
            This application was submitted through OJTech.
            Reply to this email to respond directly to the applicant.
            """,
            recipientName != null ? recipientName : "Hiring Manager",
            emailBodyContent, studentName, studentEmail,
            studentPhone != null ? studentPhone : "Not provided",
            studentUniversity != null ? studentUniversity : "Not provided",
            studentMajor != null ? studentMajor : "Not provided",
            cvUrl != null ? cvUrl : "Not provided");
    }

    private String generateDefaultEmailBody(String studentName, String jobTitle, String coverLetter) {
        return String.format(
            "I am writing to express my interest in the %s position.\n\n%s\n\n" +
            "I have attached my CV for your review. I would welcome the opportunity to discuss how my skills align with your needs.\n\n" +
            "Thank you for considering my application.\n\nBest regards,\n%s",
            jobTitle, coverLetter != null ? coverLetter : "Please find my application materials attached.", studentName
        );
    }
}
