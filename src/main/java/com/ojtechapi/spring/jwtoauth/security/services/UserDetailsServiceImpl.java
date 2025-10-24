package com.ojtechapi.spring.jwtoauth.security.services;

import com.ojtechapi.spring.jwtoauth.entities.User;
import com.ojtechapi.spring.jwtoauth.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        // Try to find user by email first
        Optional<User> userOptional = userRepository.findByEmail(usernameOrEmail);
        
        // If not found by email, try by username
        if (!userOptional.isPresent()) {
            userOptional = userRepository.findByUsername(usernameOrEmail);
        }
        
        // If still not found, throw exception
        User user = userOptional.orElseThrow(
                () -> new UsernameNotFoundException("User Not Found with username/email: " + usernameOrEmail));

        return UserDetailsImpl.build(user);
    }
} 
