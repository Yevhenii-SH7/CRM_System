-- Migration: Add hourly_rate column to projects table
-- Date: 2025-09-24
-- Description: Add hourly_rate column to support project billing features

ALTER TABLE projects ADD COLUMN hourly_rate DECIMAL(10,2) DEFAULT NULL;

-- Update init.sql to match current schema
-- This ensures new installations will have the correct schema