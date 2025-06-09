-- Make location field optional
ALTER TABLE invoices
  ALTER COLUMN location DROP NOT NULL;

-- Drop the existing trigger
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;

-- Update the trigger function to use the new column name
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate the trigger with the updated function
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Enable read access for own invoices" ON invoices;
DROP POLICY IF EXISTS "Enable insert access for own invoices" ON invoices;
DROP POLICY IF EXISTS "Enable update access for own invoices" ON invoices;

-- First, disable RLS to make changes
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;

-- Add user_id to invoices table to track ownership if it doesn't exist
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create basic policies that don't require user_id match for testing
CREATE POLICY "Enable read access for authenticated users"
  ON invoices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
  ON invoices FOR UPDATE
  TO authenticated
  USING (true);

-- Make sure the storage bucket exists and is public for now
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON storage.objects;

-- Create more permissive storage policies for testing
CREATE POLICY "Enable read access for all users"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'invoices');

CREATE POLICY "Enable insert access for authenticated users"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'invoices'); 