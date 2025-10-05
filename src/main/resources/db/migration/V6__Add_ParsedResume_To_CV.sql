-- Add parsedResume JSONB column to cvs
ALTER TABLE "cvs" ADD COLUMN parsed_resume JSONB;
 
-- Make file_name and file_url columns nullable
ALTER TABLE "cvs" ALTER COLUMN file_name DROP NOT NULL;
ALTER TABLE "cvs" ALTER COLUMN file_url DROP NOT NULL; 