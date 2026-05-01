-- Migration: Add AI knowledge base to tenants
-- Run in Supabase SQL Editor

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS ai_knowledge_base TEXT DEFAULT '';
