package com.melardev.spring.jwtoauth.controller;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public/cloudinary")
public class CloudinaryPublicController {

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    // Using existing property name used in the codebase
    @Value("${cloudinary.api-secret-preset:OJTECH}")
    private String uploadPreset;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Autowired
    private Cloudinary cloudinary;

    @GetMapping("/unsigned-params")
    public ResponseEntity<?> getUnsignedParams() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("cloudName", cloudName);
        payload.put("uploadPreset", uploadPreset);
        payload.put("folder", "preojt_orientations");
        return ResponseEntity.ok(payload);
    }

    @GetMapping("/company-logo-params")
    public ResponseEntity<?> getCompanyLogoParams() {
        long timestamp = System.currentTimeMillis() / 1000L;

        // Only include parameters that will be sent in the upload request
        // Cloudinary only signs: folder, timestamp (and any transformation params)
        Map<String, Object> paramsToSign = new HashMap<>();
        paramsToSign.put("folder", "company_logos");
        paramsToSign.put("timestamp", timestamp);

        String signature = cloudinary.apiSignRequest(paramsToSign, cloudinary.config.apiSecret);

        Map<String, Object> payload = new HashMap<>();
        payload.put("cloudName", cloudName);
        payload.put("apiKey", apiKey);
        payload.put("timestamp", timestamp);
        payload.put("signature", signature);
        payload.put("folder", "company_logos");
        return ResponseEntity.ok(payload);
    }

    @GetMapping("/signed-params")
    public ResponseEntity<?> getSignedParams() {
        long timestamp = System.currentTimeMillis() / 1000L;

        // Params to sign for a direct signed upload (exclude file, cloud_name, api_key, resource_type)
        Map<String, Object> paramsToSign = new HashMap<>();
        paramsToSign.put("timestamp", timestamp);
        paramsToSign.put("folder", "preojt_orientations");
        paramsToSign.put("use_filename", true);
        paramsToSign.put("unique_filename", true);
        paramsToSign.put("access_mode", "public");

        String signature = cloudinary.apiSignRequest(paramsToSign, cloudinary.config.apiSecret);

        Map<String, Object> payload = new HashMap<>();
        payload.put("cloudName", cloudName);
        payload.put("apiKey", apiKey);
        payload.put("timestamp", timestamp);
        payload.put("signature", signature);
        payload.put("folder", paramsToSign.get("folder"));
        payload.put("resourceType", "raw");
        payload.put("useFilename", paramsToSign.get("use_filename"));
        payload.put("uniqueFilename", paramsToSign.get("unique_filename"));
        return ResponseEntity.ok(payload);
    }
}


