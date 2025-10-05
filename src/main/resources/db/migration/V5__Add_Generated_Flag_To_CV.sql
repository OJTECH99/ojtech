-- Add 'generated' column to cvs table
ALTER TABLE cvs ADD COLUMN generated BOOLEAN DEFAULT FALSE NOT NULL; 