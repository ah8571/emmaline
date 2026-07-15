-- Migration: drop legacy seconds-based billing columns in favor of credit system
-- Run AFTER 20260715_credit_system.sql has been applied and verified.

ALTER TABLE public.users
  DROP COLUMN IF EXISTS free_trial_seconds_granted;

ALTER TABLE public.users
  DROP COLUMN IF EXISTS prepaid_seconds_balance;

ALTER TABLE public.users
  DROP COLUMN IF EXISTS auto_recharge_enabled;

ALTER TABLE public.users
  DROP COLUMN IF EXISTS auto_recharge_threshold_seconds;

ALTER TABLE public.users
  DROP COLUMN IF EXISTS auto_recharge_amount_seconds;
