ALTER TABLE orders
    ADD COLUMN customer_email VARCHAR(100) NOT NULL DEFAULT '',
    ADD COLUMN customer_phone VARCHAR(20) NOT NULL DEFAULT '',
    ADD COLUMN shipping_address VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN shipping_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN payment_method VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
    ADD COLUMN payment_status VARCHAR(20) NOT NULL DEFAULT 'PAID',
    ADD COLUMN order_status VARCHAR(20) NOT NULL DEFAULT 'PENDING';

ALTER TABLE orders
    ADD CONSTRAINT chk_orders_payment_method
    CHECK (payment_method IN ('ONLINE', 'COD'));

ALTER TABLE orders
    ADD CONSTRAINT chk_orders_payment_status
    CHECK (payment_status IN ('PAID', 'PENDING'));

ALTER TABLE orders
    ADD CONSTRAINT chk_orders_order_status
    CHECK (order_status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'));