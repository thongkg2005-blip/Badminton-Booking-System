ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS customer_email VARCHAR(100) NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20) NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS shipping_address VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS shipping_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
    ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'PAID',
    ADD COLUMN IF NOT EXISTS order_status VARCHAR(20) NOT NULL DEFAULT 'PENDING';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_orders_payment_method'
    ) THEN
        ALTER TABLE orders
            ADD CONSTRAINT chk_orders_payment_method
            CHECK (payment_method IN ('ONLINE', 'COD'));
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_orders_payment_status'
    ) THEN
        ALTER TABLE orders
            ADD CONSTRAINT chk_orders_payment_status
            CHECK (payment_status IN ('PAID', 'PENDING'));
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_orders_order_status'
    ) THEN
        ALTER TABLE orders
            ADD CONSTRAINT chk_orders_order_status
            CHECK (order_status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'));
    END IF;
END $$;