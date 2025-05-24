-- Enable the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(10,2) NOT NULL,
  "tipAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  -- Location as JSONB
  location JSONB NOT NULL,
  reason TEXT NOT NULL,
  participants TEXT[] NOT NULL,
  -- Signing data as JSONB
  "signingData" JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'cancelled')),
  "pdfUrl" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read all invoices
CREATE POLICY "Allow authenticated users to read invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert invoices
CREATE POLICY "Allow authenticated users to insert invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update invoice status and signing data
CREATE POLICY "Allow authenticated users to update invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('invoices', 'invoices', true);

-- Set up storage policy to allow authenticated users to upload PDFs
CREATE POLICY "Allow authenticated users to upload PDFs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'invoices' 
    AND (LOWER(storage.extension(name)) = '.pdf')
  );

-- Allow public access to view PDFs
CREATE POLICY "Allow public to view PDFs"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'invoices'); 