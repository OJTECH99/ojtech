package com.melardev.spring.jwtoauth.service;

import java.util.concurrent.atomic.AtomicBoolean;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender emailSender;

    @Value("${spring.mail.email}")
    private String fromEmail;

    @Value("${backend.base-url}")
    private String baseUrl;

    @Value("${email.enabled:true}")
    private boolean emailEnabled;
    
    @Value("${spring.mail.username}")
    private String smtpUsername;
    
    @Value("${spring.mail.password}")
    private String smtpPassword;
    
    @Value("${spring.mail.host}")
    private String smtpHost;
    
    @Value("${spring.mail.port}")
    private int smtpPort;
    
    private static final int MAX_RETRY_ATTEMPTS = 3; // Initial attempt + 2 retries
    private static final long RETRY_DELAY_MS = 1000; // 1 second delay between retries
    private static final long WARMUP_DELAY_MS = 2000; // 2 second delay for warmup
    
    private final AtomicBoolean isWarmedUp = new AtomicBoolean(false);
    private volatile boolean warmupInProgress = false;

    /**
     * Verify SMTP connection to Brevo is established and ready
     * @return true if connection is successful, false otherwise
     */
    private boolean verifyBrevoConnection() {
        try {
            System.out.println("Verifying Brevo SMTP connection...");
            MimeMessage testMessage = emailSender.createMimeMessage();
            Session session = testMessage.getSession();
            
            if (session != null) {
                Transport transport = session.getTransport("smtp");
                if (transport != null) {
                    // Test the connection to Brevo with credentials
                    transport.connect(smtpHost, smtpPort, smtpUsername, smtpPassword);
                    boolean isConnected = transport.isConnected();
                    
                    if (isConnected) {
                        System.out.println("✓ Brevo SMTP connection established successfully");
                        System.out.println("  Host: " + smtpHost + ":" + smtpPort);
                        System.out.println("  User: " + smtpUsername);
                        transport.close();
                        return true;
                    } else {
                        System.err.println("✗ Brevo SMTP connection failed - transport not connected");
                        transport.close();
                        return false;
                    }
                }
            }
            System.err.println("✗ Brevo SMTP connection failed - session or transport is null");
            return false;
        } catch (Exception e) {
            System.err.println("✗ Brevo SMTP connection verification failed: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Wait for Brevo SMTP connection to be established with timeout
     * @param timeoutMs Maximum time to wait in milliseconds
     * @return true if connection established within timeout, false otherwise
     */
    private boolean waitForBrevoConnection(long timeoutMs) {
        long startTime = System.currentTimeMillis();
        int attemptCount = 0;
        
        System.out.println("Waiting for Brevo SMTP connection (timeout: " + timeoutMs + "ms)...");
        
        while (System.currentTimeMillis() - startTime < timeoutMs) {
            attemptCount++;
            
            if (verifyBrevoConnection()) {
                System.out.println("Brevo connection ready after " + attemptCount + " verification attempt(s)");
                return true;
            }
            
            // Wait before next verification attempt
            try {
                Thread.sleep(500); // Check every 500ms
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                System.err.println("Connection wait interrupted");
                return false;
            }
        }
        
        System.err.println("Brevo connection timeout after " + attemptCount + " attempts");
        return false;
    }

    /**
     * Executes an email sending operation with retry logic and Brevo connection verification
     * @param emailOperation The email operation to execute
     * @param operationDescription Description of the operation for logging
     * @throws MessagingException if all retry attempts fail
     */
    private void executeWithRetry(Runnable emailOperation, String operationDescription) throws MessagingException {
        Exception lastException = null;
        
        for (int attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
            try {
                // Before each attempt, verify Brevo connection is ready
                if (attempt > 1) {
                    System.out.println("\n=== Retry Attempt " + attempt + "/" + MAX_RETRY_ATTEMPTS + " ===");
                    System.out.println("Waiting for Brevo SMTP connection before retry...");
                    
                    // Wait for Brevo connection with 5 second timeout
                    boolean connectionReady = waitForBrevoConnection(5000);
                    
                    if (!connectionReady) {
                        System.err.println("Warning: Proceeding with retry despite connection verification failure");
                    }
                    
                    // Additional delay after connection verification
                    System.out.println("Connection check complete, waiting " + RETRY_DELAY_MS + "ms before retry...");
                    Thread.sleep(RETRY_DELAY_MS);
                }
                
                // Execute the email operation
                emailOperation.run();
                
                if (attempt > 1) {
                    System.out.println("✓ Successfully sent " + operationDescription + " on attempt " + attempt);
                } else {
                    System.out.println("✓ Successfully sent " + operationDescription + " on first attempt");
                }
                return; // Success, exit the retry loop
                
            } catch (Exception e) {
                lastException = e;
                System.err.println("✗ Attempt " + attempt + " failed to send " + operationDescription);
                System.err.println("   Error: " + e.getMessage());
                
                if (attempt < MAX_RETRY_ATTEMPTS) {
                    System.out.println("   Preparing for retry " + (attempt + 1) + "/" + MAX_RETRY_ATTEMPTS + "...");
                } else {
                    System.err.println("   All retry attempts exhausted");
                }
            }
        }
        
        // All attempts failed
        String errorMessage = "Failed to send " + operationDescription + " after " + MAX_RETRY_ATTEMPTS + " attempts";
        System.err.println("\n" + errorMessage);
        System.err.println("Last error: " + (lastException != null ? lastException.getMessage() : "Unknown error"));
        throw new MessagingException(errorMessage, lastException);
    }

    /**
     * Initialize and warm up the email service on application startup
     */
    @EventListener(ContextRefreshedEvent.class)
    @Async
    public void initializeEmailService() {
        if (!emailEnabled) {
            System.out.println("Email service is disabled, skipping warmup");
            return;
        }
        
        if (warmupInProgress) {
            System.out.println("Email service warmup already in progress");
            return;
        }
        
        warmupInProgress = true;
        System.out.println("Starting email service warmup...");
        
        try {
            // Wait a bit for the application to fully start
            Thread.sleep(WARMUP_DELAY_MS);
            
            // Attempt to warm up the email service
            warmupEmailService();
            
            isWarmedUp.set(true);
            System.out.println("Email service warmup completed successfully");
        } catch (Exception e) {
            System.err.println("Email service warmup failed: " + e.getMessage());
            // Don't set warmed up flag, but don't fail the application startup
        } finally {
            warmupInProgress = false;
        }
    }
    
    /**
     * Warm up the email service by creating a test connection
     */
    private void warmupEmailService() throws MessagingException {
        try {
            // Create a test message to establish connection
            MimeMessage testMessage = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(testMessage, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(fromEmail); // Send to self for warmup
            helper.setSubject("Email Service Warmup - Test Connection");
            helper.setText("This is a warmup message to initialize the email service connection.", false);
            
            // Get the underlying session to test connection without actually sending
            Session session = testMessage.getSession();
            if (session != null) {
                // Try to connect to the transport to warm up the connection
                Transport transport = session.getTransport("smtp");
                if (transport != null) {
                    // This establishes the connection with proper credentials
                    transport.connect(smtpHost, smtpPort, smtpUsername, smtpPassword);
                    System.out.println("SMTP connection established successfully during warmup");
                    System.out.println("  Connected to: " + smtpHost + ":" + smtpPort);
                    transport.close();
                }
            }
        } catch (Exception e) {
            System.err.println("Warmup connection test failed: " + e.getMessage());
            // Try a simple message creation as fallback warmup
            MimeMessage fallbackMessage = emailSender.createMimeMessage();
            System.out.println("Fallback warmup completed - message creation successful");
        }
    }
    
    /**
     * Enhanced executeWithRetry that includes warmup logic
     */
    private void executeWithRetryAndWarmup(Runnable emailOperation, String operationDescription) throws MessagingException {
        // If not warmed up and not in progress, try a quick warmup
        if (!isWarmedUp.get() && !warmupInProgress) {
            System.out.println("Email service not warmed up, attempting quick warmup before " + operationDescription);
            try {
                warmupEmailService();
                isWarmedUp.set(true);
                System.out.println("Quick warmup successful");
            } catch (Exception e) {
                System.err.println("Quick warmup failed, proceeding with retry logic: " + e.getMessage());
            }
        }
        
        // Use the existing retry logic
        executeWithRetry(emailOperation, operationDescription);
    }

    public void sendVerificationEmail(String toEmail, String userId) throws MessagingException {
        if (!emailEnabled) {
            System.out.println("Email is disabled. Skipping verification email to: " + toEmail);
            return;
        }
        
        executeWithRetryAndWarmup(() -> {
            try {
                MimeMessage message = emailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setFrom(fromEmail);
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
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }, "verification email to " + toEmail);
    }
    
    public void sendUserCreationEmail(String toEmail, String username, String password, String userId) throws MessagingException {
        if (!emailEnabled) {
            System.out.println("Email is disabled. Skipping user creation email to: " + toEmail);
            return;
        }
        
        executeWithRetryAndWarmup(() -> {
            try {
                MimeMessage message = emailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setFrom(fromEmail);
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
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }, "user creation email to " + toEmail);
    }
    
    public void sendJobApplicationEmail(String recipientEmail, String recipientName, 
                                       String studentName, String studentEmail, String studentPhone,
                                       String studentUniversity, String studentMajor,
                                       String jobTitle, String companyName,
                                       String coverLetter, String cvUrl,
                                       String customEmailBody,
                                       org.springframework.web.multipart.MultipartFile[] attachments) throws MessagingException {
        if (!emailEnabled) {
            System.out.println("Email is disabled. Skipping job application email to: " + recipientEmail);
            return;
        }
        
        executeWithRetryAndWarmup(() -> {
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
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }, "job application email to " + recipientEmail);
    }
    
    private String generateDefaultEmailBody(String studentName, String jobTitle, String coverLetter) {
        return String.format(
            "I am writing to express my interest in the %s position.\n\n%s\n\n" +
            "I have attached my CV for your review. I would welcome the opportunity to discuss how my skills align with your needs.\n\n" +
            "Thank you for considering my application.\n\nBest regards,\n%s",
            jobTitle, coverLetter != null ? coverLetter : "Please find my application materials attached.", studentName
        );
    }
    
    public void sendTestEmail(String toEmail, String subject, String body) throws MessagingException {
        if (!emailEnabled) {
            System.out.println("Email is disabled. Skipping test email to: " + toEmail);
            System.out.println("Subject: " + (subject != null ? subject : "OJTech - Test Email"));
            System.out.println("Body: " + (body != null ? body : "This is a test email to verify that the email service is configured correctly and working as expected."));
            return;
        }
        
        executeWithRetryAndWarmup(() -> {
            try {
                MimeMessage message = emailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setFrom(fromEmail, "OJTech Test");
                helper.setTo(toEmail);
                helper.setSubject(subject != null ? subject : "OJTech - Test Email");

                String emailContent = String.format("""
                    <html>
                        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
                            <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <!-- Email Icon -->
                                <div style="background-color:rgb(0, 0, 0); width: 64px; height: 64px; border-radius: 50%%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                    <img src="https://res.cloudinary.com/df7wrezta/image/upload/v1748160270/dbe6m8ajpudgn6veyopz.png" style="width: 64px; height: 64px;"/>
                                </div>
                                
                                <h2 style="color: #333333; margin: 0 0 10px; font-size: 24px;">Test Email</h2>
                                <p style="color: #666666; margin: 0 0 5px; font-size: 14px;">✉️ Email Configuration Test</p>
                                
                                <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: left;">
                                    <p style="color: #333333; margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">%s</p>
                                </div>
                                
                                <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #eee;">
                                    <p style="color: #28a745; font-size: 14px; margin: 0; font-weight: 500;">✓ Email service is working correctly!</p>
                                </div>
                                
                                <div style="margin-top: 32px; color: #999999; font-size: 12px;">
                                    <p style="margin: 0 0 8px;">This is a test message from OJTech.</p>
                                    <p style="margin: 0; color: #999999;">Powered by <span style="color: #666666;">OJTech</span></p>
                                </div>
                            </div>
                        </body>
                    </html>
                    """, body != null ? body : "This is a test email to verify that the email service is configured correctly and working as expected.");

                helper.setText(emailContent, true);
                emailSender.send(message);
                System.out.println("Test email sent successfully to: " + toEmail);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }, "test email to " + toEmail);
    }
}