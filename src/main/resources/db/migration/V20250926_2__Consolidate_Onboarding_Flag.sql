-- Backfill base profiles.has_completed_onboarding from student_profiles duplicate column
UPDATE profiles p
SET has_completed_onboarding = TRUE
FROM student_profiles s
WHERE p.id = s.id
  AND s.has_completed_onboarding = TRUE
  AND (p.has_completed_onboarding IS DISTINCT FROM TRUE);

-- Drop the duplicate column from student_profiles to avoid divergence
ALTER TABLE student_profiles
DROP COLUMN IF EXISTS has_completed_onboarding;
