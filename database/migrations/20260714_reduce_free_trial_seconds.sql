-- Migration: reduce default free trial voice seconds from 300 (5 min) to 120 (2 min)
-- Also set existing users with the old default to 120 if they still have exactly 300 (unused trial)

ALTER TABLE public.users ALTER COLUMN free_trial_seconds_granted SET DEFAULT 120;

-- For users who never used their trial, set them to the new 2-minute cap
UPDATE public.users
SET free_trial_seconds_granted = 120
WHERE free_trial_seconds_granted = 300;
