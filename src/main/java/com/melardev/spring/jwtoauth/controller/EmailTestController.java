package com.melardev.spring.jwtoauth.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.melardev.spring.jwtoauth.service.EmailService;

@RestController
@RequestMapping("/api/email")
public class EmailTestController {

    @Autowired
    private EmailService emailService;
    
    @Value("${email.enabled:true}")
    private boolean emailEnabled;

    @PostMapping("/test")
    public ResponseEntity<?> sendTestEmail(@RequestBody TestEmailRequest request) {
        try {
            emailService.sendTestEmail(
                request.getToEmail(),
                request.getSubject(),
                request.getBody()
            );
            String message = emailEnabled 
                ? "Test email sent successfully to " + request.getToEmail()
                : "Email is disabled. Check console logs for details. To enable, set email.enabled=true in application.properties";
            return ResponseEntity.ok(new MessageResponse(message));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Failed to send test email: " + e.getMessage()));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> sendTestEmailGet(
            @RequestParam String toEmail,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String body) {
        try {
            emailService.sendTestEmail(toEmail, subject, body);
            String message = emailEnabled 
                ? "Test email sent successfully to " + toEmail
                : "Email is disabled. Check console logs for details. To enable, set email.enabled=true in application.properties";
            return ResponseEntity.ok(new MessageResponse(message));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Failed to send test email: " + e.getMessage()));
        }
    }

    // Inner classes for request/response
    public static class TestEmailRequest {
        private String toEmail;
        private String subject;
        private String body;

        public String getToEmail() {
            return toEmail;
        }

        public void setToEmail(String toEmail) {
            this.toEmail = toEmail;
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
    }

    public static class MessageResponse {
        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
