-- Rename columns to match TypeScript interface
ALTER TABLE invoices
  RENAME COLUMN tip_amount TO "tipAmount";

ALTER TABLE invoices
  RENAME COLUMN signing_data TO "signingData";

ALTER TABLE invoices
  RENAME COLUMN pdf_url TO "pdfUrl";

ALTER TABLE invoices
  RENAME COLUMN created_at TO "createdAt";

ALTER TABLE invoices
  RENAME COLUMN updated_at TO "updatedAt";

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
DROP POLICY IF EXISTS "Allow authenticated users to read invoices" ON invoices;
DROP POLICY IF EXISTS "Allow authenticated users to insert invoices" ON invoices;
DROP POLICY IF EXISTS "Allow authenticated users to update invoices" ON invoices;

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies with proper auth checks
CREATE POLICY "Enable read access for all users"
  ON invoices FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON invoices FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
  ON invoices FOR UPDATE
  USING (true);

-- Update storage policies
DROP POLICY IF EXISTS "Allow authenticated users to upload PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view PDFs" ON storage.objects;

-- Make sure the storage bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Enable read access for all users"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'invoices');

CREATE POLICY "Enable insert access for authenticated users"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'invoices' 
    AND (LOWER(storage.extension(name)) = '.pdf')
  ); 