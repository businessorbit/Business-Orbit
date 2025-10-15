-- Add profession column to users table
-- This migration adds the profession column that was missing from the production database

-- Check if the column already exists before adding it
DO $$ 
BEGIN
    -- Add profession column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'profession'
    ) THEN
        ALTER TABLE users ADD COLUMN profession VARCHAR(255);
        RAISE NOTICE 'Added profession column to users table';
    ELSE
        RAISE NOTICE 'Profession column already exists in users table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'profession';
