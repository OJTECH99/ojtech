-- Add last_updated column to cvs table
ALTER TABLE cvs ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP;

-- Update existing cvs to have a last_updated value
UPDATE cvs SET last_updated = upload_date WHERE last_updated IS NULL;

-- Create certifications table
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    date_received DATE NOT NULL,
    expiry_date DATE,
    credential_url VARCHAR(255),
    cv_id UUID REFERENCES cvs(id) ON DELETE CASCADE,
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create work_experiences table
CREATE TABLE IF NOT EXISTS work_experiences (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE,
    current BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT NOT NULL,
    cv_id UUID REFERENCES cvs(id) ON DELETE CASCADE,
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_certifications_student_id ON certifications(student_id);
CREATE INDEX IF NOT EXISTS idx_certifications_cv_id ON certifications(cv_id);
CREATE INDEX IF NOT EXISTS idx_work_experiences_student_id ON work_experiences(student_id);
CREATE INDEX IF NOT EXISTS idx_work_experiences_cv_id ON work_experiences(cv_id); 