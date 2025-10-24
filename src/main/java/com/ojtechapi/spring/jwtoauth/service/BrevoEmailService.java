package com.ojtechapi.spring.jwtoauth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import jakarta.annotation.PostConstruct;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class BrevoEmailService {

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${spring.mail.email}")
    private String fromEmail;

    @Value("${brevo.api.url:https://api.brevo.com/v3/smtp/email}")
    private String brevoApiUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        System.out.println("✓ Brevo Email Service initialized with API key");
    }

    /**
     * Send an email using Brevo's API
     */
    public void sendEmail(String toEmail, String toName, String subject, String htmlContent, 
                         String replyToEmail, String replyToName, List<Attachment> attachments) throws Exception {
        try {
            ObjectNode emailRequest = buildEmailRequest(toEmail, toName, subject, htmlContent, 
                                                       replyToEmail, replyToName, attachments);
            
            URL url = new URL(brevoApiUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("api-key", brevoApiKey);
            conn.setDoOutput(true);
            
            // Send request
            String jsonRequest = objectMapper.writeValueAsString(emailRequest);
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonRequest.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }
            
            // Get response
            int responseCode = conn.getResponseCode();
            StringBuilder response = new StringBuilder();
            
            try (BufferedReader br = new BufferedReader(
                    new InputStreamReader(
                        responseCode >= 200 && responseCode < 300 ? conn.getInputStream() : conn.getErrorStream(),
                        StandardCharsets.UTF_8))) {
                String responseLine;
                while ((responseLine = br.readLine()) != null) {
                    response.append(responseLine.trim());
                }
            }
            
            if (responseCode >= 200 && responseCode < 300) {
                System.out.println("✓ Email sent successfully via Brevo API to: " + toEmail);
                System.out.println("  Response: " + response.toString());
            } else {
                System.err.println("✗ Brevo API error: HTTP " + responseCode);
                System.err.println("  Response: " + response.toString());
                throw new Exception("Failed to send email via Brevo API: HTTP " + responseCode + " - " + response.toString());
            }
            
        } catch (Exception e) {
            System.err.println("✗ Failed to send email: " + e.getMessage());
            throw new Exception("Failed to send email: " + e.getMessage(), e);
        }
    }

    /**
     * Send a simple email without reply-to or attachments
     */
    public void sendSimpleEmail(String toEmail, String toName, String subject, String htmlContent) throws Exception {
        sendEmail(toEmail, toName, subject, htmlContent, null, null, null);
    }

    /**
     * Build the email request JSON for Brevo API
     */
    private ObjectNode buildEmailRequest(String toEmail, String toName, String subject, String htmlContent,
                                         String replyToEmail, String replyToName, List<Attachment> attachments) {
        ObjectNode request = objectMapper.createObjectNode();
        
        // Sender
        ObjectNode sender = objectMapper.createObjectNode();
        sender.put("email", fromEmail);
        sender.put("name", "OJTech");
        request.set("sender", sender);
        
        // Recipients
        ArrayNode to = objectMapper.createArrayNode();
        ObjectNode recipient = objectMapper.createObjectNode();
        recipient.put("email", toEmail);
        if (toName != null && !toName.isEmpty()) {
            recipient.put("name", toName);
        }
        to.add(recipient);
        request.set("to", to);
        
        // Reply-To (optional)
        if (replyToEmail != null && !replyToEmail.isEmpty()) {
            ObjectNode replyTo = objectMapper.createObjectNode();
            replyTo.put("email", replyToEmail);
            if (replyToName != null && !replyToName.isEmpty()) {
                replyTo.put("name", replyToName);
            }
            request.set("replyTo", replyTo);
        }
        
        // Subject and content
        request.put("subject", subject);
        request.put("htmlContent", htmlContent);
        
        // Attachments (optional)
        if (attachments != null && !attachments.isEmpty()) {
            ArrayNode attachmentsArray = objectMapper.createArrayNode();
            for (Attachment attachment : attachments) {
                ObjectNode attachmentNode = objectMapper.createObjectNode();
                attachmentNode.put("name", attachment.getName());
                attachmentNode.put("content", attachment.getBase64Content());
                attachmentsArray.add(attachmentNode);
            }
            request.set("attachment", attachmentsArray);
        }
        
        return request;
    }

    /**
     * Attachment class for email attachments
     */
    public static class Attachment {
        private String name;
        private String base64Content;

        public Attachment(String name, String base64Content) {
            this.name = name;
            this.base64Content = base64Content;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getBase64Content() {
            return base64Content;
        }

        public void setBase64Content(String base64Content) {
            this.base64Content = base64Content;
        }
    }
}
