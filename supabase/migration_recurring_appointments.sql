-- Migration: Add recurring appointment support
-- Run this in Supabase SQL Editor if the columns don't exist yet

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS recurrence_group_id UUID DEFAULT NULL;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
