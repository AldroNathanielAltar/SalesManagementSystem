
ALTER TABLE customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee ENABLE ROW LEVEL SECURITY;
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricehist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view customers"
ON customer FOR SELECT
USING (
  auth.uid()::text IN (
    SELECT userId FROM public.user 
    WHERE record_status = 'ACTIVE'
  )
);

CREATE POLICY "Authenticated users can view employees"
ON employee FOR SELECT
USING (
  auth.uid()::text IN (
    SELECT userId FROM public.user 
    WHERE record_status = 'ACTIVE'
  )
);

CREATE POLICY "Authenticated users can view products"
ON product FOR SELECT
USING (
  auth.uid()::text IN (
    SELECT userId FROM public.user 
    WHERE record_status = 'ACTIVE'
  )
);

CREATE POLICY "Authenticated users can view pricehist"
ON pricehist FOR SELECT
USING (
  auth.uid()::text IN (
    SELECT userId FROM public.user 
    WHERE record_status = 'ACTIVE'
  )
);