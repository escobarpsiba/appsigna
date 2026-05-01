-- Migration: Add due_date to payments and payment_day to patients
-- Run in Supabase SQL Editor

ALTER TABLE payments ADD COLUMN IF NOT EXISTS due_date DATE DEFAULT NULL;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS payment_day INTEGER DEFAULT NULL;
