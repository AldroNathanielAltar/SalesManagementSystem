
CREATE OR REPLACE VIEW sales_with_lookup AS
SELECT 
  s.transNo,
  s.salesDate,
  s.record_status,
  s.stamp,
  c.custno,
  c.custname,
  c.address,
  c.payterm,
  e.empno,
  e.firstname,
  e.lastname
FROM sales s
LEFT JOIN customer c ON s.custNo = c.custno
LEFT JOIN employee e ON s.empNo = e.empno;

CREATE OR REPLACE VIEW salesdetail_with_product AS
SELECT 
  sd.transNo,
  sd.prodCode,
  sd.quantity,
  sd.record_status,
  p.description,
  p.unit,
  ph.unitPrice,
  ph.effDate
FROM salesdetail sd
LEFT JOIN product p ON sd.prodCode = p.prodCode
LEFT JOIN pricehist ph ON sd.prodCode = ph.prodCode
  AND ph.effDate = (
    SELECT MAX(effDate) 
    FROM pricehist 
    WHERE prodCode = sd.prodCode
  );