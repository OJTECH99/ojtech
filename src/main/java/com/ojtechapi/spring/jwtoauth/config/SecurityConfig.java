package com.ojtechapi.spring.jwtoauth.config;

import java.util.Arrays;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.AbstractUserDetailsAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.ojtechapi.spring.jwtoauth.entities.User;
import com.ojtechapi.spring.jwtoauth.repositories.UserRepository;
import com.ojtechapi.spring.jwtoauth.security.jwt.AuthEntryPointJwt;
import com.ojtechapi.spring.jwtoauth.security.jwt.AuthTokenFilter;
import com.ojtechapi.spring.jwtoauth.security.oauth2.CustomOAuth2UserService;
import com.ojtechapi.spring.jwtoauth.security.oauth2.OAuth2AuthenticationSuccessHandler;
import com.ojtechapi.spring.jwtoauth.security.services.UserDetailsServiceImpl;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    UserRepository userRepository;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;
    
    @Autowired
    private CustomOAuth2UserService customOAuth2UserService;
    
    @Autowired
    private OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider customAuthenticationProvider() {
        return new AbstractUserDetailsAuthenticationProvider() {
            @Override
            protected void additionalAuthenticationChecks(UserDetails userDetails, 
                                                        UsernamePasswordAuthenticationToken authentication) 
                                                        throws AuthenticationException {
                if (authentication.getCredentials() == null) {
                    throw new BadCredentialsException("No credentials provided");
                }

                String presentedPassword = authentication.getCredentials().toString();
                
                // For OAuth users with placeholder password
                if ("placeholder".equals(presentedPassword)) {
                    Optional<User> userOpt = userRepository.findByUsername(userDetails.getUsername());
                    if (userOpt.isPresent() && userOpt.get().getProvider() != null && 
                        !userOpt.get().getProvider().isEmpty()) {
                        // OAuth user, allow authentication
                        return;
                    }
                }
                
                // For regular users, check password
                if (!passwordEncoder().matches(presentedPassword, userDetails.getPassword())) {
                    throw new BadCredentialsException("Invalid credentials");
                }
            }

            @Override
            protected UserDetails retrieveUser(String username, UsernamePasswordAuthenticationToken authentication) 
                                              throws AuthenticationException {
                try {
                    return userDetailsService.loadUserByUsername(username);
                } catch (UsernameNotFoundException e) {
                    throw new BadCredentialsException("Invalid username or password");
                }
            }
        };
    }

    @Bean
    @Primary
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth ->
                        auth.requestMatchers("/api/auth/**").permitAll()
                                .requestMatchers("/auth/api/auth/**").permitAll()
                                .requestMatchers("/oauth2/**").permitAll()
                                .requestMatchers("/login/**").permitAll()
                                .requestMatchers("/v3/api-docs/**").permitAll()
                                .requestMatchers("/api-docs/**").permitAll()
                                .requestMatchers("/swagger-ui/index.html").permitAll()
                                .requestMatchers("/swagger-ui/**").permitAll()
                                .requestMatchers("/swagger-resources/**").permitAll()
                                .requestMatchers("/webjars/**").permitAll()
                                .requestMatchers("/h2-console/**").permitAll()
                                .requestMatchers("/uploads/**").permitAll()
                                .requestMatchers("/api/public/cloudinary/**").permitAll()
                                .requestMatchers("/api/public/**").permitAll()
                                .requestMatchers("/api/cvs/*/view").permitAll()
                                .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                        .successHandler(oAuth2AuthenticationSuccessHandler)
                );

        // Configure security headers
        http.headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.disable())
                .xssProtection(xss -> xss.disable())
                .contentSecurityPolicy(csp -> csp
                        .policyDirectives("frame-ancestors 'self'; " +
                                "script-src 'self' https://accounts.google.com/gsi/client; " +
                                "frame-src 'self' https://accounts.google.com/gsi/; " +
                                "connect-src 'self' https://accounts.google.com/gsi/; " +
                                "style-src 'self' https://accounts.google.com/gsi/style;"))
                .addHeaderWriter((request, response) -> {
                    response.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
                    response.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
                    response.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
                }));

        // Use our single custom authentication provider
        http.authenticationProvider(customAuthenticationProvider());

        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000", 
            "https://ojtech-pinger.netlify.app", 
            "https://ojtech-testing.netlify.app", 
            "http://localhost:8081",
            "https://ojtech.aetherrflare.org"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList(
            "authorization", 
            "content-type", 
            "x-auth-token",
            "x-requested-with",
            "x-xsrf-token",
            "x-google-oauth-token",
            "accept"
        ));
        configuration.setExposedHeaders(Arrays.asList("x-auth-token", "authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        source.registerCorsConfiguration("/oauth2/**", configuration);
        source.registerCorsConfiguration("/login/**", configuration);
         source.registerCorsConfiguration("/swagger-ui/index.html", configuration);
        return source;
    }
}
