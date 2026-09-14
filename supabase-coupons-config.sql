-- ============================================================
-- MetaPilot Supabase SQL Migration: Coupons & App Model Config
-- Paste & Run in Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ============================================================

-- 1. Create Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  discount_percent INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert/Sync All Coupons from Google Sheet
INSERT INTO coupons (code, discount_percent) VALUES
  ('WELCOME25', 25),
  ('KEFKQ30', 30),
  ('NCLAW40', 40),
  ('LXNQI50', 50),
  ('LWIDL60', 60),
  ('KXKSX80', 80),
  ('KCKSH90', 19),
  ('FLSPF99', 99),
  ('LDJRV100', 100),
  ('LLKO85', 85)
ON CONFLICT (code) DO UPDATE SET discount_percent = EXCLUDED.discount_percent;

-- 2. Create App & Remote Model Config Table
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Remote Models and Download URL
INSERT INTO app_config (key, value, description) VALUES
  ('groq_text_model', 'openai/gpt-oss-20b', 'Text generation model via Groq'),
  ('gemini_model', 'gemini-3.5-flash-lite', 'Gemini AI model'),
  ('gemini_version', 'v1beta', 'Gemini API version'),
  ('download_url', 'https://drive.google.com/file/d/1zYSrNRMw4DzabIYP7N0n0Ob5cbycQp-E/view?usp=sharing', 'Direct app update download link')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 3. Add Payment Link column to Subscription Tables (if not present)
ALTER TABLE pro_subscriptions ADD COLUMN IF NOT EXISTS payment_link TEXT;
ALTER TABLE pro_subscriptions ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE go_subscriptions ADD COLUMN IF NOT EXISTS payment_link TEXT;
ALTER TABLE go_subscriptions ADD COLUMN IF NOT EXISTS coupon_code TEXT;

-- 4. Enable Public Read Permissions
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on coupons" ON coupons;
CREATE POLICY "Allow public read on coupons" ON coupons FOR SELECT USING (true);

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on app_config" ON app_config;
CREATE POLICY "Allow public read on app_config" ON app_config FOR SELECT USING (true);
