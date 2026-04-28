CREATE OR REPLACE VIEW sales_by_customer AS
SELECT 
  c.custno,
  c.custname,
  c.payterm,
  COUNT(s.transNo) AS totalTransactions,
  SUM(sd.quantity * ph.unitPrice) AS totalRevenue
FROM sales s
LEFT JOIN customer c ON s.custNo = c.custno
LEFT JOIN salesdetail sd ON s.transNo = sd.transNo
LEFT JOIN pricehist ph ON sd.prodCode = ph.prodCode
  AND ph.effDate = (
    SELECT MAX(effDate) FROM pricehist 
    WHERE prodCode = sd.prodCode
  )
WHERE s.record_status = 'ACTIVE'
GROUP BY c.custno, c.custname, c.payterm
ORDER BY totalRevenue DESC;

-- View 2: Top products sold
CREATE OR REPLACE VIEW top_products_sold AS
SELECT 
  p.prodCode,
  p.description,
  p.unit,
  SUM(sd.quantity) AS totalQuantity,
  ph.unitPrice AS latestPrice,
  SUM(sd.quantity * ph.unitPrice) AS totalRevenue
FROM salesdetail sd
LEFT JOIN product p ON sd.prodCode = p.prodCode
LEFT JOIN pricehist ph ON sd.prodCode = ph.prodCode
  AND ph.effDate = (
    SELECT MAX(effDate) FROM pricehist 
    WHERE prodCode = sd.prodCode
  )
WHERE sd.record_status = 'ACTIVE'
GROUP BY p.prodCode, p.description, p.unit, ph.unitPrice
ORDER BY totalRevenue DESC;

-- View 3: Monthly sales trend
CREATE OR REPLACE VIEW monthly_sales_trend AS
SELECT 
  TO_CHAR(s.salesDate, 'YYYY-MM') AS saleMonth,
  COUNT(s.transNo) AS totalTransactions,
  SUM(sd.quantity * ph.unitPrice) AS totalRevenue
FROM sales s
LEFT JOIN salesdetail sd ON s.transNo = sd.transNo
LEFT JOIN pricehist ph ON sd.prodCode = ph.prodCode
  AND ph.effDate = (
    SELECT MAX(effDate) FROM pricehist 
    WHERE prodCode = sd.prodCode
  )
WHERE s.record_status = 'ACTIVE'
GROUP BY TO_CHAR(s.salesDate, 'YYYY-MM')
ORDER BY saleMonth ASC;