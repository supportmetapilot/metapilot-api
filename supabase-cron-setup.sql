-- ============================================================
-- MetaPilot Smart Cloud Queue: Supabase pg_cron Setup
-- Run this in Supabase SQL Editor to enable 24/7 cloud scheduling
-- ============================================================

-- 1. Enable pg_net extension (allows PostgreSQL to make HTTP requests)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 2. Enable pg_cron extension (allows PostgreSQL to run scheduled cron jobs)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- 3. Remove existing job if already registered
SELECT cron.unschedule('metapilot-queue-worker') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'metapilot-queue-worker'
);

-- 4. Schedule queue worker to run every 2 minutes 24/7
-- It triggers the Next.js API queue worker which dispatches leads according to campaign delay settings
SELECT cron.schedule(
  'metapilot-queue-worker',
  '*/2 * * * *',
  $$
  SELECT net.http_get(
    url := 'https://api.metapilot.in/api/cron/queue-worker?key=metapilot2026'
  );
  $$
);

-- 5. Check scheduled jobs status
SELECT jobid, jobname, schedule, command, active FROM cron.job;
