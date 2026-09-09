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
