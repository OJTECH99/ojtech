-- Add NLO verification tracking fields to student_profiles
ALTER TABLE student_profiles
    ADD COLUMN IF NOT EXISTS verified_by_user_id UUID,
    ADD COLUMN IF NOT EXISTS verified_by_role VARCHAR(50),
    ADD COLUMN IF NOT EXISTS verification_source VARCHAR(20) DEFAULT 'ADMIN';

-- Add foreign key constraint for verified_by_user_id
ALTER TABLE student_profiles
    ADD CONSTRAINT fk_student_profiles_verified_by_user
    FOREIGN KEY (verified_by_user_id) REFERENCES users(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_student_profiles_verified_by_user_id 
    ON student_profiles(verified_by_user_id);

CREATE INDEX IF NOT EXISTS idx_student_profiles_verification_source 
    ON student_profiles(verification_source);

-- Update existing verified records to mark them as ADMIN verified
UPDATE student_profiles 
SET verification_source = 'ADMIN', 
    verified_by_role = 'ADMIN'
WHERE verified = true AND verification_source IS NULL;
