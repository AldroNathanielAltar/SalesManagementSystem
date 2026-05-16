-- ============================================================
-- PR    : db/verify-seed
-- Sprint: 1
-- Author: cydencenteno-byte
-- ============================================================

-- Row Count Checks
SELECT 'employee' AS table_name, COUNT(*) AS row_count FROM employee
UNION ALL
SELECT 'customer', COUNT(*) FROM customer
UNION ALL
SELECT 'product', COUNT(*) FROM product
UNION ALL
SELECT 'priceHist', COUNT(*) FROM "priceHist"
UNION ALL
SELECT 'sales', COUNT(*) FROM sales
UNION ALL
SELECT 'salesDetail', COUNT(*) FROM "salesDetail"
UNION ALL
SELECT 'payment', COUNT(*) FROM payment;

-- FK Integrity Checks
SELECT 'Orphan salesDetail (no sales)' AS check_name, COUNT(*) 
FROM "salesDetail" sd
LEFT JOIN sales s ON sd."transNo" = s."transNo"
WHERE s."transNo" IS NULL;

SELECT 'Orphan sales (no customer)' AS check_name, COUNT(*) 
FROM sales s
LEFT JOIN customer c ON s."custNo" = c."custno"
WHERE c."custno" IS NULL;

SELECT 'Orphan sales (no employee)' AS check_name, COUNT(*) 
FROM sales s
LEFT JOIN employee e ON s."empNo" = e."empno"
WHERE e."empno" IS NULL;

SELECT 'Orphan payment (no sales)' AS check_name, COUNT(*) 
FROM payment p
LEFT JOIN sales s ON p."transno" = s."transNo"
WHERE s."transNo" IS NULL;

-- SUPERADMIN Check
SELECT userId, username, user_type, record_status 
FROM public.user 
WHERE userId = 'superadmin-001'; 
