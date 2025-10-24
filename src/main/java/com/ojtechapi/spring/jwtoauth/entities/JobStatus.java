package com.ojtechapi.spring.jwtoauth.entities;

/**
 * Enum representing the possible statuses of a job posting.
 */
public enum JobStatus {
    DRAFT,      // Job is saved as draft, not visible to job seekers
    ACTIVE,     // Job is active and visible to job seekers
    EXPIRED,    // Job has passed its deadline
    FILLED,     // Job position has been filled
    CLOSED,     // Job posting has been manually closed by employer
    DELETED     // Job has been deleted (soft delete)
}
