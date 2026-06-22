-- V9__Enforce_Stock_And_Pricing_Automation.sql

-- A. Auto-increment Warehouse Stock Volumes on Supplier Consignments
CREATE OR REPLACE FUNCTION fn_track_stock_replenishment()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products 
    SET stock = stock + NEW.quantity
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stock_replenishment
AFTER INSERT ON product_import_details
FOR EACH ROW EXECUTE FUNCTION fn_track_stock_replenishment();


-- B. Real-time Inventory Depletion Engine
CREATE OR REPLACE FUNCTION fn_process_retail_deduction()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT stock FROM products WHERE id = NEW.product_id) < NEW.quantity THEN
        RAISE EXCEPTION 'Transaction Rejected: Insufficient product stock available.';
    END IF;

    UPDATE products 
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_retail_stock_deduction
BEFORE INSERT ON order_items
FOR EACH ROW EXECUTE FUNCTION fn_process_retail_deduction();


-- C. Context-Aware Dependent Price Generation Engine
CREATE OR REPLACE FUNCTION fn_calculate_court_rate()
RETURNS TRIGGER AS $$
DECLARE
    v_day_type   VARCHAR(20);
    v_price_vnd  INTEGER;
BEGIN
    -- Evaluate current calendar configuration (Saturday=6, Sunday=7)
    IF EXTRACT(ISODOW FROM NEW.booking_date) IN (6, 7) THEN
        v_day_type := 'WEEKEND';
    ELSE
        v_day_type := 'WEEKDAY';
    END IF;

    -- Match strict time slot rules
    SELECT price_vnd INTO v_price_vnd
    FROM court_prices
    WHERE start_time = NEW.start_time AND end_time = NEW.end_time AND day_type = v_day_type;

    IF v_price_vnd IS NULL THEN
        RAISE EXCEPTION 'Booking Blocked: No configured pricing structure matches slot %-% on %.', 
            NEW.start_time, NEW.end_time, v_day_type;
    END IF;

    -- Generate settlement document records implicitly
    INSERT INTO booking_payments (booking_id, amount_charged, payment_status)
    VALUES (NEW.id, v_price_vnd, 'UNPAID');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_court_billing
AFTER INSERT ON bookings
FOR EACH ROW EXECUTE FUNCTION fn_calculate_court_rate();