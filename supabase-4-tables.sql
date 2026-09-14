-- ============================================================
-- SQL to Create Dedicated Tables for MetaPilot Pro & Go
-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ============================================================

-- 1. PRO TRIALS
CREATE TABLE IF NOT EXISTS pro_trials (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name TEXT NOT NULL,
  mobile TEXT,
  email TEXT NOT NULL,
  job_role TEXT,
  plan_type TEXT DEFAULT '1-Day Free',
  device_uuid TEXT NOT NULL,
  submitted_on TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT,
  password TEXT,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'Trial',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pro_trials_device_uuid ON pro_trials(device_uuid);
CREATE INDEX IF NOT EXISTS idx_pro_trials_email ON pro_trials(email);
CREATE INDEX IF NOT EXISTS idx_pro_trials_user_id ON pro_trials(user_id);

-- 2. PRO SUBSCRIPTIONS (PAID)
CREATE TABLE IF NOT EXISTS pro_subscriptions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name TEXT NOT NULL,
  mobile TEXT,
  email TEXT NOT NULL,
  job_role TEXT,
  plan_type TEXT DEFAULT 'MetaPilot Pro',
  amount_paid NUMERIC(10, 2) DEFAULT 0,
  device_uuid TEXT NOT NULL,
  submitted_on TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT,
  password TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pro_subs_device_uuid ON pro_subscriptions(device_uuid);
CREATE INDEX IF NOT EXISTS idx_pro_subs_email ON pro_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_pro_subs_user_id ON pro_subscriptions(user_id);

-- 3. GO TRIALS
CREATE TABLE IF NOT EXISTS go_trials (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name TEXT NOT NULL,
  mobile TEXT,
  email TEXT NOT NULL,
  job_role TEXT,
  plan_type TEXT DEFAULT '1-Day Free',
  device_uuid TEXT NOT NULL,
  submitted_on TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT,
  password TEXT,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'Trial',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_go_trials_device_uuid ON go_trials(device_uuid);
CREATE INDEX IF NOT EXISTS idx_go_trials_email ON go_trials(email);
CREATE INDEX IF NOT EXISTS idx_go_trials_user_id ON go_trials(user_id);

-- 4. GO SUBSCRIPTIONS (PAID)
CREATE TABLE IF NOT EXISTS go_subscriptions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name TEXT NOT NULL,
  mobile TEXT,
  email TEXT NOT NULL,
  job_role TEXT,
  plan_type TEXT DEFAULT 'MetaPilot Go',
  amount_paid NUMERIC(10, 2) DEFAULT 0,
  device_uuid TEXT NOT NULL,
  submitted_on TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT,
  password TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_go_subs_device_uuid ON go_subscriptions(device_uuid);
CREATE INDEX IF NOT EXISTS idx_go_subs_email ON go_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_go_subs_user_id ON go_subscriptions(user_id);

-- Enable RLS
ALTER TABLE pro_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE go_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE go_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow Service Role Full Access
CREATE POLICY "Service role full access on pro_trials" ON pro_trials FOR ALL USING (true);
CREATE POLICY "Service role full access on pro_subscriptions" ON pro_subscriptions FOR ALL USING (true);
CREATE POLICY "Service role full access on go_trials" ON go_trials FOR ALL USING (true);
CREATE POLICY "Service role full access on go_subscriptions" ON go_subscriptions FOR ALL USING (true);
