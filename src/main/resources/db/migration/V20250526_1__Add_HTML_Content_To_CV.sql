-- Add html_content column to cvs table
ALTER TABLE cvs ADD COLUMN IF NOT EXISTS html_content TEXT; 