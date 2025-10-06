package com.melardev.spring.jwtoauth.config;

import com.melardev.spring.jwtoauth.service.CloudinaryService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Configuration
@Profile("test")
public class TestConfig {

    @Bean
    public CloudinaryService cloudinaryService() {
        return new CloudinaryService() {
            @Override
            public Map<String, Object> upload(MultipartFile file, String folder) throws IOException {
                Map<String, Object> result = new HashMap<>();
                result.put("public_id", "test-public-id");
                result.put("secure_url", "https://example.com/test-image.jpg");
                return result;
            }

            @Override
            public Map<String, Object> uploadWithPreset(MultipartFile file, String folder, String preset) throws IOException {
                Map<String, Object> result = new HashMap<>();
                result.put("public_id", "test-public-id-preset");
                result.put("secure_url", "https://example.com/test-file-preset.jpg");
                return result;
            }

            @Override
            public String uploadImage(MultipartFile file) throws IOException {
                return "https://example.com/test-image.jpg";
            }

            @Override
            public String uploadPdf(MultipartFile file, String preset) throws IOException {
                return "https://example.com/test-pdf.pdf";
            }

            @Override
            public void delete(String publicId) throws IOException {
                // Do nothing in test environment
            }
        };
    }
}