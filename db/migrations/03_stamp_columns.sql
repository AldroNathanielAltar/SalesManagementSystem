-- ============================================================
-- FILE   : 03_stamp_columns.sql
-- PURPOSE: Add record_status + stamp columns to sales
--          and salesDetail ONLY
-- NOTE   : customer, employee, product, priceHist unchanged
-- ============================================================

ALTER TABLE sales 
  ADD COLUMN IF NOT EXISTS record_status VARCHAR(10) DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS stamp TEXT;

ALTER TABLE salesDetail 
  ADD COLUMN IF NOT EXISTS record_status VARCHAR(10) DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS stamp TEXT;
