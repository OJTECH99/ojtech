-- Add email tracking fields to job_applications table
ALTER TABLE job_applications 
ADD COLUMN email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN email_sent_at TIMESTAMP,
ADD COLUMN email_body TEXT,
ADD COLUMN email_subject VARCHAR(500);

-- Add comments for documentation
COMMENT ON COLUMN job_applications.email_sent IS 'Indicates whether application email was sent to employer';
COMMENT ON COLUMN job_applications.email_sent_at IS 'Timestamp when email was sent';
COMMENT ON COLUMN job_applications.email_body IS 'The actual email body content that was sent';
COMMENT ON COLUMN job_applications.email_subject IS 'The email subject line that was sent';

-- Create table for tracking daily email limits (rate limiting)
CREATE TABLE IF NOT EXISTS student_email_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    email_date DATE NOT NULL,
    email_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_email_tracking_student FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    CONSTRAINT unique_student_date UNIQUE (student_id, email_date)
);

COMMENT ON TABLE student_email_tracking IS 'Tracks daily email counts for rate limiting (max 10 emails per day per student)';
COMMENT ON COLUMN student_email_tracking.email_count IS 'Number of application emails sent on this date';
