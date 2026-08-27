-- V13: Simplify order_status to 4 values
-- Old: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
-- New: PENDING, CONFIRMED, SHIPPING, COMPLETED

-- 1. Drop the old CHECK constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_orders_order_status;

-- 2. Migrate existing data to the nearest equivalent
UPDATE orders SET order_status = 'SHIPPING'   WHERE order_status IN ('SHIPPED', 'PROCESSING');
UPDATE orders SET order_status = 'COMPLETED'  WHERE order_status IN ('DELIVERED');
UPDATE orders SET order_status = 'PENDING'    WHERE order_status IN ('CANCELLED');

-- 3. Add the new CHECK constraint
ALTER TABLE orders
    ADD CONSTRAINT chk_orders_order_status
    CHECK (order_status IN ('PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED'));
