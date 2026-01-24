-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  country TEXT,
  residency_region TEXT,
  investor_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_frozen BOOLEAN DEFAULT FALSE
);

-- Allocation Requests table
CREATE TABLE IF NOT EXISTS allocation_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_type TEXT NOT NULL,
  requested_amount DECIMAL(20, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ
);

-- Allocations table
CREATE TABLE IF NOT EXISTS allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_type TEXT NOT NULL,
  allocated_amount DECIMAL(20, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, strategy_type)
);

-- Portfolio Valuations table
CREATE TABLE IF NOT EXISTS portfolio_valuations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  valuation_date DATE NOT NULL,
  portfolio_value DECIMAL(20, 2) NOT NULL,
  strategy_exposure JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, valuation_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_allocation_requests_user_id ON allocation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_allocation_requests_status ON allocation_requests(status);
CREATE INDEX IF NOT EXISTS idx_allocations_user_id ON allocations(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_valuations_user_id ON portfolio_valuations(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_valuations_valuation_date ON portfolio_valuations(valuation_date);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_valuations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allocation requests policies
CREATE POLICY "Users can view their own allocation requests"
  ON allocation_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own allocation requests"
  ON allocation_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allocations policies
CREATE POLICY "Users can view their own allocations"
  ON allocations FOR SELECT
  USING (auth.uid() = user_id);

-- Portfolio valuations policies
CREATE POLICY "Users can view their own portfolio valuations"
  ON portfolio_valuations FOR SELECT
  USING (auth.uid() = user_id);

-- Admin policies (for service role or admin users)
-- Note: These would need to be implemented based on your admin authentication method
-- For now, we'll create policies that allow admins to manage all data
-- You would need to add a function to check if a user is an admin

-- Function to check if user is admin (you would need to implement this based on your admin system)
-- CREATE OR REPLACE FUNCTION is_admin()
-- RETURNS BOOLEAN AS $$
-- BEGIN
--   RETURN EXISTS (
--     SELECT 1 FROM auth.users
--     WHERE id = auth.uid()
--     AND raw_user_meta_data->>'is_admin' = 'true'
--   );
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_allocation_requests_updated_at
  BEFORE UPDATE ON allocation_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_allocations_updated_at
  BEFORE UPDATE ON allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
