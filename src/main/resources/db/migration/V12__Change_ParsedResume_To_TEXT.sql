-- Change parsed_resume column from JSONB to TEXT to fix Hibernate type mismatch
ALTER TABLE cvs ALTER COLUMN parsed_resume TYPE TEXT;

