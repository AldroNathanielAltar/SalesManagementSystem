-- ============================================================
-- FILE   : 04_trigger_provision_new_user.sql
-- PURPOSE: Auto-provision new users as USER / INACTIVE with
--          default VIEW + LOOKUP rights only
-- RUN ON : Supabase SQL Editor by M3 (DB Engineer)
-- AUTHOR : M4 – Rights & Auth Specialist
-- ============================================================

CREATE OR REPLACE FUNCTION provision_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_userId TEXT := NEW.id::text;
BEGIN
  -- 1. Insert user row as USER / INACTIVE
  INSERT INTO public.user (userId, username, user_type, record_status, stamp)
  VALUES (
    v_userId,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->>'full_name',
      NEW.email
    ),
    'USER',
    'INACTIVE',
    'PROVISIONED ' || NOW()::text
  );
  -- 2. Insert module access rows
  INSERT INTO public.user_module (userId, moduleId, rights_value) VALUES
    (v_userId, 'Sales_Mod',  1),
    (v_userId, 'SD_Mod',     1),
    (v_userId, 'Lookup_Mod', 1),
    (v_userId, 'Adm_Mod',    0);
  -- 3. Insert default rights (VIEW + LOOKUP only)
  INSERT INTO public.UserModule_Rights (userId, rightId, right_value) VALUES
    (v_userId, 'SALES_VIEW',   1),
    (v_userId, 'SALES_ADD',    0),
    (v_userId, 'SALES_EDIT',   0),
    (v_userId, 'SALES_DEL',    0),
    (v_userId, 'SD_VIEW',      1),
    (v_userId, 'SD_ADD',       0),
    (v_userId, 'SD_EDIT',      0),
    (v_userId, 'SD_DEL',       0),
    (v_userId, 'CUST_LOOKUP',  1),
    (v_userId, 'EMP_LOOKUP',   1),
    (v_userId, 'PROD_LOOKUP',  1),
    (v_userId, 'PRICE_LOOKUP', 1),
    (v_userId, 'ADM_USER',     0);
  RETURN NEW;
END;
$$;

-- Attach trigger to Supabase auth.users table
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION provision_new_user();
