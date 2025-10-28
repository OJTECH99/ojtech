-- Remove unique constraint from jobs.company_id to allow multiple jobs per company
-- This migration changes the relationship from one-to-one to many-to-one

-- Drop the unique constraint if it exists
-- PostgreSQL automatically creates a unique index with the constraint
DO $$ 
BEGIN
    -- Try to drop the constraint if it exists
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'uk_jobs_company_id' 
        AND conrelid = 'jobs'::regclass
    ) THEN
        ALTER TABLE jobs DROP CONSTRAINT uk_jobs_company_id;
    END IF;
    
    -- Also check for any unique index on company_id
    IF EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'jobs' 
        AND indexname LIKE '%company_id%' 
        AND indexdef LIKE '%UNIQUE%'
    ) THEN
        DROP INDEX IF EXISTS jobs_company_id_key;
        DROP INDEX IF EXISTS uk_jobs_company_id;
    END IF;
END $$;

-- Create a regular index for performance (non-unique)
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
