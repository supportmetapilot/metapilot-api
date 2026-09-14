-- ============================================================
-- MetaPilot Database Schema for Supabase
-- Run this in Supabase SQL Editor after creating the project
-- ============================================================

-- 1. TRIALS TABLE (Sheet A replacement)
CREATE TABLE IF NOT EXISTS trials (
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

-- Index for fast HWID lookups
CREATE INDEX IF NOT EXISTS idx_trials_device_uuid ON trials(device_uuid);
CREATE INDEX IF NOT EXISTS idx_trials_email ON trials(email);

-- 2. SUBSCRIPTIONS TABLE (Sheet B replacement)
CREATE TABLE IF NOT EXISTS subscriptions (
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

CREATE INDEX IF NOT EXISTS idx_subs_device_uuid ON subscriptions(device_uuid);
CREATE INDEX IF NOT EXISTS idx_subs_email ON subscriptions(email);

-- 3. LEADS TABLE (MP_Marketting sheet replacement)
CREATE TABLE IF NOT EXISTS leads (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  mobile TEXT,
  job_role TEXT,
  years_of_experience TEXT,
  notice_period TEXT,

  -- Mail tracking
  mail_1_template TEXT,
  mail_1_status TEXT,
  mail_1_sent_at TIMESTAMPTZ,
  mail_2_template TEXT,
  mail_2_status TEXT,
  mail_2_sent_at TIMESTAMPTZ,
  mail_3_template TEXT,
  mail_3_status TEXT,
  mail_3_sent_at TIMESTAMPTZ,

  -- WhatsApp tracking
  wa_1_status TEXT,
  wa_1_sent_at TIMESTAMPTZ,
  wa_2_status TEXT,
  wa_2_sent_at TIMESTAMPTZ,
  wa_3_status TEXT,
  wa_3_sent_at TIMESTAMPTZ,

  error_log TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- 4. CAMPAIGNS TABLE (Campaign_Control sheet replacement)
CREATE TABLE IF NOT EXISTS campaigns (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  campaign_date DATE NOT NULL,
  leads_limit INT DEFAULT 300,
  gap_minutes INT DEFAULT 5,
  start_time TIME DEFAULT '09:00',
  followup_1_days NUMERIC(4,1) DEFAULT 3,
  followup_2_days NUMERIC(4,1) DEFAULT 7,
  status TEXT DEFAULT 'Scheduled',
  processed_count INT DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  next_lead_id BIGINT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security
ALTER TABLE trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Service role has full access (API routes use service role key)
CREATE POLICY "Service role full access on trials" ON trials FOR ALL USING (true);
CREATE POLICY "Service role full access on subscriptions" ON subscriptions FOR ALL USING (true);
CREATE POLICY "Service role full access on leads" ON leads FOR ALL USING (true);
CREATE POLICY "Service role full access on campaigns" ON campaigns FOR ALL USING (true);
