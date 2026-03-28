-- ============================================================
-- FILE   : 02_rights_seed.sql
-- PURPOSE: Seed modules, rights, UserModule_Rights tables
--          + SUPERADMIN seed for jcesperanza@neu.edu.ph
-- ============================================================

-- Create user table
CREATE TABLE public.user (
  userId TEXT NOT NULL PRIMARY KEY,
  username TEXT,
  user_type VARCHAR(20) DEFAULT 'USER',
  record_status VARCHAR(10) DEFAULT 'INACTIVE',
  stamp TEXT
);

-- Create module table
CREATE TABLE public.module (
  moduleId VARCHAR(20) NOT NULL PRIMARY KEY,
  moduleDesc VARCHAR(50)
);

-- Create rights table
CREATE TABLE public.rights (
  rightId VARCHAR(20) NOT NULL PRIMARY KEY,
  rightDesc VARCHAR(50)
);

-- Create user_module table
CREATE TABLE public.user_module (
  userId TEXT NOT NULL REFERENCES public.user,
  moduleId VARCHAR(20) NOT NULL REFERENCES public.module,
  rights_value INT DEFAULT 0,
  PRIMARY KEY (userId, moduleId)
);

-- Create UserModule_Rights table
CREATE TABLE public.UserModule_Rights (
  userId TEXT NOT NULL REFERENCES public.user,
  rightId VARCHAR(20) NOT NULL REFERENCES public.rights,
  right_value INT DEFAULT 0,
  PRIMARY KEY (userId, rightId)
);

-- Seed 4 modules
INSERT INTO public.module VALUES ('Sales_Mod',  'Sales Module');
INSERT INTO public.module VALUES ('SD_Mod',     'Sales Detail Module');
INSERT INTO public.module VALUES ('Lookup_Mod', 'Lookup Module');
INSERT INTO public.module VALUES ('Adm_Mod',    'Admin Module');

-- Seed 13 rights
INSERT INTO public.rights VALUES ('SALES_VIEW',   'View Sales');
INSERT INTO public.rights VALUES ('SALES_ADD',    'Add Sales');
INSERT INTO public.rights VALUES ('SALES_EDIT',   'Edit Sales');
INSERT INTO public.rights VALUES ('SALES_DEL',    'Delete Sales');
INSERT INTO public.rights VALUES ('SD_VIEW',      'View Sales Detail');
INSERT INTO public.rights VALUES ('SD_ADD',       'Add Sales Detail');
INSERT INTO public.rights VALUES ('SD_EDIT',      'Edit Sales Detail');
INSERT INTO public.rights VALUES ('SD_DEL',       'Delete Sales Detail');
INSERT INTO public.rights VALUES ('CUST_LOOKUP',  'Customer Lookup');
INSERT INTO public.rights VALUES ('EMP_LOOKUP',   'Employee Lookup');
INSERT INTO public.rights VALUES ('PROD_LOOKUP',  'Product Lookup');
INSERT INTO public.rights VALUES ('PRICE_LOOKUP', 'Price Lookup');
INSERT INTO public.rights VALUES ('ADM_USER',     'Admin User Management');

-- Seed SUPERADMIN user
INSERT INTO public.user (userId, username, user_type, record_status, stamp)
VALUES (
  'superadmin-001',
  'jcesperanza@neu.edu.ph',
  'SUPERADMIN',
  'ACTIVE',
  'SEEDED ' || NOW()::text
);

-- Give SUPERADMIN all 4 modules
INSERT INTO public.user_module VALUES ('superadmin-001', 'Sales_Mod',  1);
INSERT INTO public.user_module VALUES ('superadmin-001', 'SD_Mod',     1);
INSERT INTO public.user_module VALUES ('superadmin-001', 'Lookup_Mod', 1);
INSERT INTO public.user_module VALUES ('superadmin-001', 'Adm_Mod',    1);

-- Give SUPERADMIN all 13 rights = 1
INSERT INTO public.UserModule_Rights VALUES ('superadmin-001', 'SALES_VIEW',   1);
INSERT INTO public.UserModule_Rights VALUES ('superadmin-001', 'SALES_ADD',    1);
INSERT INTO public.UserModule_Rights VALUES ('superadmin-001', 'SALES_EDIT',   1);
INSERT INTO public.UserModule_Rights VALUES ('superadmin-001', 'SALES_DEL',    1);
INSERT INTO public.UserModule_Rights VALUES ('superadmin-001', 'SD_VIEW',      1);
INSERT INTO public.UserModule_Rights VALUES ('superadmin-001', 'SD_ADD',       1);
INSERT INTO public.UserModule_Rights VALUES ('superadmin-001', 'SD_EDIT',      1);
INSERT INTO public.UserModule_Rights VALUES ('superadmin-001', 'SD_DEL',       1);
INSERT INTO public.UserModule_Rights VALUES ('superadmin-001', 'CUST_LOOKUP',  1);
INSERT INTO public.UserModule_Rights VALUES ('superadmin-001', 'EMP_LOOKUP',   1);
INSERT INTO public.UserModule_Rights VALUES ('superadmin-001', 'PROD_LOOKUP',  1);
INSERT INTO public.UserModule_Rights VALUES ('superadmin-001', 'PRICE_LOOKUP', 1);
INSERT INTO public.UserModule_Rights VALUES ('superadmin-001', 'ADM_USER',     1);
