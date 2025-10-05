package com.melardev.spring.jwtoauth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender emailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${backend.base-url}")
    private String baseUrl;

    public void sendVerificationEmail(String toEmail, String userId) throws MessagingException {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "OJTech");
            helper.setTo(toEmail);
            helper.setSubject("Welcome to OJTech!");

            String verificationUrl = baseUrl + "/api/auth/verifyEmail/" + userId;
            String emailContent = String.format("""
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

            helper.setText(emailContent, true);
            emailSender.send(message);
            System.out.println("Verification email sent successfully to: " + toEmail);
        } catch (MessagingException | UnsupportedEncodingException e) {
            System.err.println("Failed to send verification email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
            throw new MessagingException("Failed to send verification email: " + e.getMessage());
        }
    }
    
    public void sendUserCreationEmail(String toEmail, String username, String password, String userId) throws MessagingException {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "OJTech");
            helper.setTo(toEmail);
            helper.setSubject("Your OJTech Account Has Been Created");

            String verificationUrl = baseUrl + "/api/auth/verifyEmail/" + userId;
            String emailContent = String.format("""
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
                """, toEmail, password, verificationUrl);

            helper.setText(emailContent, true);
            emailSender.send(message);
            System.out.println("User creation email sent successfully to: " + toEmail);
        } catch (MessagingException | UnsupportedEncodingException e) {
            System.err.println("Failed to send user creation email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
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
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, "OJTech - Student Applications");
            helper.setTo(recipientEmail);
            helper.setReplyTo(studentEmail, studentName); // HR replies go directly to student
            helper.setSubject("Job Application for " + jobTitle + " - " + studentName);
            
            String emailBodyContent = customEmailBody != null && !customEmailBody.trim().isEmpty() 
                ? customEmailBody 
                : generateDefaultEmailBody(studentName, jobTitle, coverLetter);
            
            String emailContent = String.format("""
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
            
            helper.setText(emailContent, true);
            
            // Attach additional files if provided
            if (attachments != null && attachments.length > 0) {
                for (org.springframework.web.multipart.MultipartFile file : attachments) {
                    if (file != null && !file.isEmpty()) {
                        helper.addAttachment(file.getOriginalFilename(), file);
                    }
                }
            }
            
            emailSender.send(message);
            System.out.println("Job application email sent to: " + recipientEmail + 
                             (attachments != null ? " with " + attachments.length + " attachment(s)" : ""));
        } catch (MessagingException | UnsupportedEncodingException e) {
            System.err.println("Failed to send job application email: " + e.getMessage());
            e.printStackTrace();
            throw new MessagingException("Failed to send job application email: " + e.getMessage());
        }
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