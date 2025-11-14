-- Create company table
CREATE TABLE company (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  company_name TEXT NOT NULL,
  company_address TEXT,
  email_address TEXT,
  contact_number VARCHAR,
  gst_number VARCHAR,
  pan_number VARCHAR,
  cin_number VARCHAR,
  contact_person_name TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- Create project table
CREATE TABLE project (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  total_area NUMERIC,
  estimated_land_cost NUMERIC,
  estimated_construction_cost NUMERIC,
  total_estimated_cost NUMERIC,
  report_date TIMESTAMPTZ,
  actual_land_cost NUMERIC,
  actual_construction_cost NUMERIC,
  total_actual_cost NUMERIC,
  project_completion_percentage VARCHAR,
  construction_percentage VARCHAR,
  revenue_recognized BOOLEAN,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create wing table
CREATE TABLE wing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wing_name TEXT NOT NULL,
  project_id UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  project_name TEXT,
  company_name TEXT,
  construction_area NUMERIC
);

-- Create flat table
CREATE TABLE flat (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flat_number VARCHAR NOT NULL,
  wing_id UUID NOT NULL REFERENCES wing(id) ON DELETE CASCADE,
  carpet_area NUMERIC,
  status VARCHAR,
  agreement_value NUMERIC
);

-- Create customer table
CREATE TABLE customer (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT,
  flat_id UUID REFERENCES flat(id) ON DELETE RESTRICT,
  contact_number NUMERIC,
  email TEXT,
  aadhar_number TEXT,
  address TEXT,
  pin_code NUMERIC
);

-- Create bookings table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
  flat_id UUID NOT NULL REFERENCES flat(id) ON DELETE CASCADE,
  payment_date TIMESTAMPTZ,
  payer_name TEXT,
  mode_of_payment TEXT,
  amount_paid NUMERIC,
  customer_bank_name TEXT,
  customer_account_no VARCHAR,
  company_bank_name TEXT,
  company_account_no VARCHAR,
  agreement_value NUMERIC,
  booking_amount NUMERIC,
  outstanding_amount NUMERIC
);

-- Create cancellations table
CREATE TABLE cancellations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
  flat_id UUID NOT NULL REFERENCES flat(id) ON DELETE CASCADE,
  refund_date TIMESTAMPTZ,
  payee_name TEXT,
  mode_of_payment TEXT,
  amount_refunded NUMERIC,
  customer_bank_name TEXT,
  customer_account_no VARCHAR,
  company_bank_name TEXT,
  company_account_no VARCHAR,
  remarks TEXT
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_company_updated_at
  BEFORE UPDATE ON company
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_updated_at
  BEFORE UPDATE ON project
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE company ENABLE ROW LEVEL SECURITY;
ALTER TABLE project ENABLE ROW LEVEL SECURITY;
ALTER TABLE wing ENABLE ROW LEVEL SECURITY;
ALTER TABLE flat ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancellations ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for development
-- TODO: Replace with proper RLS policies for production
CREATE POLICY "Allow all operations for company" ON company
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for project" ON project
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for wing" ON wing
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for flat" ON flat
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for customer" ON customer
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for bookings" ON bookings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for cancellations" ON cancellations
  FOR ALL USING (true) WITH CHECK (true);

