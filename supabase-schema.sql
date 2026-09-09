-- Run this SQL in your Supabase SQL Editor

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receiver_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  branch_name TEXT NOT NULL,
  routing_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for the sake of simplicity in this Next.js app
-- (If you add auth later, change these policies)
CREATE POLICY "Allow anonymous read access" ON vendors FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON vendors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON vendors FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access" ON vendors FOR DELETE USING (true);

-- =========================================================
-- Debit Accounts Table (Funding source for SCB transfers)
-- =========================================================
CREATE TABLE IF NOT EXISTS debit_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_number TEXT NOT NULL,
  account_label TEXT DEFAULT 'Main SCB Account',
  bank_name TEXT DEFAULT 'Standard Chartered Bank',
  is_default BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE debit_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access on debit_accounts" ON debit_accounts FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access on debit_accounts" ON debit_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access on debit_accounts" ON debit_accounts FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access on debit_accounts" ON debit_accounts FOR DELETE USING (true);

-- Optional: Seed default SCB debit account
INSERT INTO debit_accounts (account_number, account_label, bank_name, is_default)
VALUES ('YOUR_SCB_DEBIT_ACCOUNT', 'Main SCB Account', 'Standard Chartered Bank', true)
ON CONFLICT DO NOTHING;

