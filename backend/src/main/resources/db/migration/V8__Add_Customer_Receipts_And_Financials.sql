-- V8__Add_Customer_Receipts_And_Financials.sql

-- 7. Product Order/Retail Manifests
CREATE TABLE orders (
    id            BIGSERIAL      PRIMARY KEY,
    branch_id     BIGINT         NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    user_id       BIGINT         REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(100),
    total_amount  DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    purchase_date TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- 8. Customer Detail Bill Check Items Ledger
CREATE TABLE order_items (
    id           BIGSERIAL      PRIMARY KEY,
    order_id     BIGINT         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id   BIGINT         NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity     INTEGER        NOT NULL CHECK (quantity > 0),
    unit_price   DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0), -- Snapshot historical freeze price
    subtotal     DECIMAL(12, 2) NOT NULL CHECK (subtotal >= 0)
);

-- 9. Court Billing Ledger Link
CREATE TABLE booking_payments (
    id             BIGSERIAL      PRIMARY KEY,
    booking_id     BIGINT         NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    amount_charged DECIMAL(12, 2) NOT NULL CHECK (amount_charged >= 0),
    payment_status VARCHAR(20)    NOT NULL DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PAID', 'REFUNDED')),
    created_at     TIMESTAMPTZ    NOT NULL DEFAULT now()
);