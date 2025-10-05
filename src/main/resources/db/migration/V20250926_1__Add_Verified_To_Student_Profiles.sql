-- Add verification fields to student_profiles
ALTER TABLE student_profiles
    ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS verified_at DATE,
    ADD COLUMN IF NOT EXISTS verification_notes TEXT;
