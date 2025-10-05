package com.melardev.spring.jwtoauth.security.oauth2;

import java.io.IOException;
import java.net.URI;
import java.util.Optional;

import com.melardev.spring.jwtoauth.security.jwt.JwtUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtils jwtUtils;
    
    @Autowired
    public OAuth2AuthenticationSuccessHandler(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, 
                                       Authentication authentication) throws IOException, ServletException {
        String targetUrl = determineTargetUrl(request, response, authentication);

        if (response.isCommitted()) {
            logger.debug("Response has already been committed. Unable to redirect to " + targetUrl);
            return;
        }

        clearAuthenticationAttributes(request, response);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        Optional<String> redirectUri = getRedirectUri(request);
        String targetUrl = redirectUri.orElse(getDefaultTargetUrl());

        String token = jwtUtils.generateJwtToken(authentication);

        return UriComponentsBuilder.fromUriString(targetUrl)
                .queryParam("token", token)
                .build().toUriString();
    }

    private Optional<String> getRedirectUri(HttpServletRequest request) {
        // In a real application, you would validate the redirectUrl against a list of allowed URLs
        // to prevent redirect attacks
        String redirectParam = request.getParameter("redirect_uri");
        if (redirectParam != null && !redirectParam.isEmpty()) {
            try {
                // Validate the URI
                URI uri = new URI(redirectParam);
                // Check if it's a valid URL (e.g., http/https)
                if (uri.getScheme() != null && (uri.getScheme().equals("http") || uri.getScheme().equals("https"))) {
                    return Optional.of(redirectParam);
                }
            } catch (Exception e) {
                // Invalid URI
            }
        }
        
        // Default fallback
        return Optional.of(getDefaultTargetUrl());
    }

    protected void clearAuthenticationAttributes(HttpServletRequest request, HttpServletResponse response) {
        super.clearAuthenticationAttributes(request);
    }
} 