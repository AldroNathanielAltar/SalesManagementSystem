
ALTER TABLE salesdetail ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see active salesdetail only"
ON salesdetail FOR SELECT
USING (
  record_status = 'ACTIVE'
  AND auth.uid()::text IN (
    SELECT userId FROM public.user 
    WHERE record_status = 'ACTIVE'
  )
);

CREATE POLICY "Admin sees all salesdetail"
ON salesdetail FOR SELECT
USING (
  auth.uid()::text IN (
    SELECT userId FROM public.user 
    WHERE user_type IN ('ADMIN', 'SUPERADMIN')
  )
);

CREATE POLICY "SalesDetail add policy"
ON salesdetail FOR INSERT
WITH CHECK (
  auth.uid()::text IN (
    SELECT userId FROM public.UserModule_Rights
    WHERE rightId = 'SD_ADD' AND right_value = 1
  )
);

CREATE POLICY "SalesDetail edit policy"
ON salesdetail FOR UPDATE
USING (
  auth.uid()::text IN (
    SELECT userId FROM public.UserModule_Rights
    WHERE rightId = 'SD_EDIT' AND right_value = 1
  )
);

CREATE POLICY "SalesDetail deactivate policy"
ON salesdetail FOR UPDATE
USING (
  auth.uid()::text IN (
    SELECT userId FROM public.UserModule_Rights
    WHERE rightId = 'SD_DEL' AND right_value = 1
  )
);

CREATE POLICY "SalesDetail recovery policy"
ON salesdetail FOR UPDATE
USING (
  auth.uid()::text IN (
    SELECT userId FROM public.user
    WHERE user_type IN ('ADMIN', 'SUPERADMIN')
  )
);