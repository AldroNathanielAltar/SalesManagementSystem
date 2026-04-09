

CREATE OR REPLACE FUNCTION cascade_sales_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.record_status != OLD.record_status THEN
    UPDATE salesdetail
    SET record_status = NEW.record_status
    WHERE transNo = NEW.transNo;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_sales_status_change
  AFTER UPDATE OF record_status ON sales
  FOR EACH ROW EXECUTE FUNCTION cascade_sales_status();