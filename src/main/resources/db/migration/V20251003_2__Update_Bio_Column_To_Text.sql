-- Migration to update bio column to TEXT type for longer bios
-- This fixes the issue where bio field was duplicated in StudentProfile and Profile classes

ALTER TABLE profiles MODIFY COLUMN bio TEXT;
