-- Add PreOJT Orientation PDF URL field to student_profiles table
ALTER TABLE student_profiles 
ADD COLUMN preojt_orientation_url VARCHAR(500);

-- Add comment for documentation
COMMENT ON COLUMN student_profiles.preojt_orientation_url IS 'URL to the uploaded PreOJT Orientation PDF document stored in Cloudinary';
