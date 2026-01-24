-- Investment Plans System Migration
-- This migration adds investment plans, user plans, transactions, and ROI tracking

-- Add balance field to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'balance'
  ) THEN
    ALTER TABLE profiles ADD COLUMN balance DECIMAL(20, 2) DEFAULT 0.00;
  END IF;
END $$;

-- Add role field to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
END $$;

-- Investment Plans table
CREATE TABLE IF NOT EXISTS investment_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  min_amount DECIMAL(20, 2) NOT NULL,
  max_amount DECIMAL(20, 2),
  tier_rank INTEGER NOT NULL DEFAULT 0,
  roi_min DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  roi_max DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  roi_frequency TEXT NOT NULL DEFAULT 'daily' CHECK (roi_frequency IN ('daily', 'weekly')),
  lock_days INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Plans table (subscriptions)
CREATE TABLE IF NOT EXISTS user_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES investment_plans(id) ON DELETE RESTRICT,
  plan_key TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  invested_amount DECIMAL(20, 2) NOT NULL,
  current_balance DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
  total_earned DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  lock_until TIMESTAMPTZ,
  last_roi_calculation TIMESTAMPTZ,
  next_roi_calculation TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Transactions table (enhanced)
CREATE TABLE IF NOT EXISTS user_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'investment', 'roi', 'fee', 'refund')),
  amount DECIMAL(20, 2) NOT NULL,
  fee_amount DECIMAL(20, 2) DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  description TEXT,
  reference_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROI History table (track all ROI calculations)
CREATE TABLE IF NOT EXISTS roi_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_plan_id UUID NOT NULL REFERENCES user_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roi_amount DECIMAL(20, 2) NOT NULL,
  roi_percentage DECIMAL(5, 2) NOT NULL,
  balance_before DECIMAL(20, 2) NOT NULL,
  balance_after DECIMAL(20, 2) NOT NULL,
  calculation_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Withdrawals table (if not exists)
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(20, 2) NOT NULL,
  fee_amount DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
  net_amount DECIMAL(20, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  user_wallet_address TEXT NOT NULL,
  network TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'cancelled')),
  transaction_hash TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deposits table (if not exists)
CREATE TABLE IF NOT EXISTS deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(20, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  wallet_address TEXT NOT NULL,
  transaction_hash TEXT,
  proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON user_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_status ON user_plans(status);
CREATE INDEX IF NOT EXISTS idx_user_plans_next_roi ON user_plans(next_roi_calculation);
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_type ON user_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_roi_history_user_plan ON roi_history(user_plan_id);
CREATE INDEX IF NOT EXISTS idx_roi_history_user_id ON roi_history(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
CREATE INDEX IF NOT EXISTS idx_investment_plans_key ON investment_plans(plan_key);
CREATE INDEX IF NOT EXISTS idx_investment_plans_active ON investment_plans(is_active);

-- Function to enforce max 10 plans per user
CREATE OR REPLACE FUNCTION check_max_user_plans()
RETURNS TRIGGER AS $$
DECLARE
  plan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO plan_count
  FROM user_plans
  WHERE user_id = NEW.user_id AND status = 'active';
  
  IF plan_count >= 10 THEN
    RAISE EXCEPTION 'Maximum of 10 active plans allowed per user';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce max 10 plans
DROP TRIGGER IF EXISTS trigger_check_max_user_plans ON user_plans;
CREATE TRIGGER trigger_check_max_user_plans
  BEFORE INSERT ON user_plans
  FOR EACH ROW
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION check_max_user_plans();

-- Function to calculate next ROI calculation date
CREATE OR REPLACE FUNCTION calculate_next_roi_date(
  frequency TEXT,
  last_calc TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  IF frequency = 'daily' THEN
    RETURN last_calc + INTERVAL '24 hours';
  ELSIF frequency = 'weekly' THEN
    RETURN last_calc + INTERVAL '7 days';
  ELSE
    RETURN last_calc + INTERVAL '24 hours';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Updated at trigger for all tables
CREATE TRIGGER update_investment_plans_updated_at
  BEFORE UPDATE ON investment_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_plans_updated_at
  BEFORE UPDATE ON user_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_transactions_updated_at
  BEFORE UPDATE ON user_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_withdrawals_updated_at
  BEFORE UPDATE ON withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deposits_updated_at
  BEFORE UPDATE ON deposits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE investment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;

-- Investment Plans policies (public read, admin write)
CREATE POLICY "Anyone can view active investment plans"
  ON investment_plans FOR SELECT
  USING (is_active = TRUE);

-- User Plans policies
CREATE POLICY "Users can view their own plans"
  ON user_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans"
  ON user_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
  ON user_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- User Transactions policies
CREATE POLICY "Users can view their own transactions"
  ON user_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON user_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ROI History policies
CREATE POLICY "Users can view their own ROI history"
  ON roi_history FOR SELECT
  USING (auth.uid() = user_id);

-- Withdrawals policies
CREATE POLICY "Users can view their own withdrawals"
  ON withdrawals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own withdrawals"
  ON withdrawals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Deposits policies
CREATE POLICY "Users can view their own deposits"
  ON deposits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deposits"
  ON deposits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Insert default investment plans
INSERT INTO investment_plans (plan_key, name, description, min_amount, max_amount, tier_rank, roi_min, roi_max, roi_frequency, lock_days) VALUES
  ('starter', 'Starter Plan', 'Entry-level investment plan for beginners', 100, 999, 1, 1.5, 2.5, 'daily', 30),
  ('growth', 'Growth Plan', 'Moderate growth investment plan', 1000, 9999, 2, 2.0, 3.5, 'daily', 30),
  ('professional', 'Professional Plan', 'Advanced investment plan for experienced investors', 10000, 49999, 3, 2.5, 4.5, 'weekly', 7),
  ('institutional', 'Institutional Plan', 'Premium plan for institutional investors', 50000, 199999, 4, 3.0, 5.5, 'weekly', 1),
  ('premier', 'Premier Plan', 'Elite investment plan with maximum benefits', 200000, NULL, 5, 3.5, 6.5, 'weekly', 1)
ON CONFLICT (plan_key) DO NOTHING;
