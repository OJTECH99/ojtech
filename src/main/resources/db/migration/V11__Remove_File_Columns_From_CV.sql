-- Remove file-related columns from cvs as they're no longer needed
ALTER TABLE "cvs" DROP COLUMN IF EXISTS file_name;
ALTER TABLE "cvs" DROP COLUMN IF EXISTS file_url;
ALTER TABLE "cvs" DROP COLUMN IF EXISTS file_type;
ALTER TABLE "cvs" DROP COLUMN IF EXISTS upload_date; 