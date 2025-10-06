package com.repairhub.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackages = "com.repairhub.repository")
public class DatabaseConfig {
    // Database configuration is handled by Spring Boot auto-configuration
    // based on application.properties
}


