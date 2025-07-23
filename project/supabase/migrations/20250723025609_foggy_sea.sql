/*
  # Add email column to profiles table

  1. Changes
    - Add `email` column to `profiles` table (text, unique, not null)
    - This enables username-based login without admin API calls

  2. Security
    - Maintains existing RLS policies
*/

-- Add email column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text UNIQUE NOT NULL DEFAULT '';

-- Remove the default constraint after adding the column
ALTER TABLE profiles ALTER COLUMN email DROP DEFAULT;