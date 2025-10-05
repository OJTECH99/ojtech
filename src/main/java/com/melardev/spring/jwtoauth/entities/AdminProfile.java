package com.melardev.spring.jwtoauth.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "admin_profiles")
public class AdminProfile extends Profile {
    
    public AdminProfile() {
        super();
        setRole(UserRole.ADMIN);
    }
} 