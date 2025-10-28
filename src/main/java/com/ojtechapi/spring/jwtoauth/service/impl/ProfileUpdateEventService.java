package com.ojtechapi.spring.jwtoauth.service.impl;

import com.ojtechapi.spring.jwtoauth.services.JobMatchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Service to handle background processing of profile update events.
 * This service executes job match recalculation asynchronously
 * to avoid blocking the profile update HTTP request.
 * 
 * Note: CV generation is handled on the frontend using resumeHtmlGenerator.js
 */
@Service
public class ProfileUpdateEventService {

    private static final Logger logger = LoggerFactory.getLogger(ProfileUpdateEventService.class);

    @Autowired
    private JobMatchService jobMatchService;

    /**
     * Asynchronously recalculates job match scores for the student after profile update.
     * This updates existing job matches with new scores based on the updated profile.
     * 
     * @param studentId The ID of the student whose job matches should be recalculated
     */
    @Async
    public void recalculateJobMatches(UUID studentId) {
        try {
            logger.info("Starting async job match recalculation for student: {}", studentId);
            jobMatchService.recalculateMatchesForStudent(studentId);
            logger.info("Successfully recalculated job matches for student: {}", studentId);
        } catch (Exception e) {
            logger.error("Failed to recalculate job matches for student: {}. Error: {}", studentId, e.getMessage(), e);
            // Don't throw - we don't want to fail the profile update if match recalculation fails
        }
    }

    /**
     * Triggers job match recalculation for a student after profile update.
     * This is called after profile updates to ensure match scores reflect the latest data.
     * Note: CV generation is handled on the frontend, not here.
     * 
     * @param userId The user ID
     * @param studentId The student profile ID
     */
    @Async
    public void handleProfileUpdate(UUID userId, UUID studentId) {
        logger.info("Handling profile update for student: {} (user: {})", studentId, userId);
        
        // Only recalculate match scores - CV generation is done on frontend
        recalculateJobMatches(studentId);
    }
}
