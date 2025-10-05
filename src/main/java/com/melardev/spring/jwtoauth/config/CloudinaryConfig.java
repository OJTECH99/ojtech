package com.melardev.spring.jwtoauth.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.HashMap;
import java.util.Map;

@Configuration
@Profile("!test") // Don't load this configuration in test profile
@ConditionalOnProperty(prefix = "cloudinary", name = {"cloud-name", "api-key", "api-secret"}, matchIfMissing = false)
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name:placeholder}")
    private String cloudName;

    @Value("${cloudinary.api-key:placeholder}")
    private String apiKey;

    @Value("${cloudinary.api-secret:placeholder}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudName);
        config.put("api_key", apiKey);
        config.put("api_secret", apiSecret);
        config.put("secure", "true");
        return new Cloudinary(config);
    }
} 
 