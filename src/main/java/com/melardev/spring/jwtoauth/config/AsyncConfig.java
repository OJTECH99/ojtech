package com.melardev.spring.jwtoauth.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync
public class AsyncConfig {
    // This configuration enables @Async annotation support for the EmailService
}
