-- Change parsed_resume column from text to jsonb type
ALTER TABLE cvs 
  ALTER COLUMN parsed_resume TYPE jsonb USING 
    CASE 
      WHEN parsed_resume IS NULL THEN NULL
      WHEN parsed_resume ~ '^\s*[\{\[]' THEN parsed_resume::jsonb
      ELSE jsonb_build_object('htmlContent', parsed_resume)
    END; 