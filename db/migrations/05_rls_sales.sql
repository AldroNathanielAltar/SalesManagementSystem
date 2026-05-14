-- ============================================================
-- PR    : db/rls-sales
-- Sprint: 2
-- Author: cydencenteno-byte
-- ============================================================
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see active sales only"
ON sales FOR SELECT
USING (
  record_status = 'ACTIVE'
  AND auth.uid()::text IN (
    SELECT userId FROM public.user 
    WHERE record_status = 'ACTIVE'
  )
);

CREATE POLICY "Admin sees all sales"
ON sales FOR SELECT
USING (
  auth.uid()::text IN (
    SELECT userId FROM public.user 
    WHERE user_type IN ('ADMIN', 'SUPERADMIN')
  )
);

CREATE POLICY "Sales add policy"
ON sales FOR INSERT
WITH CHECK (
  auth.uid()::text IN (
    SELECT userId FROM public.UserModule_Rights
    WHERE rightId = 'SALES_ADD' AND right_value = 1
  )
);

CREATE POLICY "Sales edit policy"
ON sales FOR UPDATE
USING (
  auth.uid()::text IN (
    SELECT userId FROM public.UserModule_Rights
    WHERE rightId = 'SALES_EDIT' AND right_value = 1
  )
);

CREATE POLICY "Sales deactivate policy"
ON sales FOR UPDATE
USING (
  auth.uid()::text IN (
    SELECT userId FROM public.UserModule_Rights
    WHERE rightId = 'SALES_DEL' AND right_value = 1
  )
);

CREATE POLICY "Sales recovery policy"
ON sales FOR UPDATE
USING (
  auth.uid()::text IN (
    SELECT userId FROM public.user
    WHERE user_type IN ('ADMIN', 'SUPERADMIN')
  )
);