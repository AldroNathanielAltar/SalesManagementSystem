ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;

-- ADMIN can UPDATE record_status only WHERE user_type != 'SUPERADMIN'
CREATE POLICY "Admin can update user record_status"
ON public.user FOR UPDATE
USING (
  auth.uid()::text IN (
    SELECT userId FROM public.user 
    WHERE user_type = 'ADMIN'
  )
  AND user_type != 'SUPERADMIN'
);

-- SUPERADMIN can do anything on user table
CREATE POLICY "Superadmin full access on user"
ON public.user FOR ALL
USING (
  auth.uid()::text IN (
    SELECT userId FROM public.user 
    WHERE user_type = 'SUPERADMIN'
  )
);

-- SELECT for all active users
CREATE POLICY "Active users can view user table"
ON public.user FOR SELECT
USING (
  auth.uid()::text IN (
    SELECT userId FROM public.user 
    WHERE record_status = 'ACTIVE'
  )
);

-- Enable RLS on UserModule_Rights
ALTER TABLE public.UserModule_Rights ENABLE ROW LEVEL SECURITY;

-- ADMIN cannot INSERT/UPDATE/DELETE rows where userId belongs to SUPERADMIN
CREATE POLICY "Admin cannot modify SUPERADMIN rights"
ON public.UserModule_Rights FOR ALL
USING (
  NOT (
    auth.uid()::text IN (
      SELECT userId FROM public.user WHERE user_type = 'ADMIN'
    )
    AND userId IN (
      SELECT userId FROM public.user WHERE user_type = 'SUPERADMIN'
    )
  )
);

-- SUPERADMIN full access
CREATE POLICY "Superadmin full access on UserModule_Rights"
ON public.UserModule_Rights FOR ALL
USING (
  auth.uid()::text IN (
    SELECT userId FROM public.user 
    WHERE user_type = 'SUPERADMIN'
  )
);