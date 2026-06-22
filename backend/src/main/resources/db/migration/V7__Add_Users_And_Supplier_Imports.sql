-- V7__Add_Users_And_Supplier_Imports.sql

-- 4. Unified Users and Authorization Accounts
CREATE TABLE users (
    id          BIGSERIAL    PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(100) UNIQUE,
    phone       VARCHAR(20),
    role        VARCHAR(20)  NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN', 'STAFF')),
    branch_id   BIGINT       REFERENCES branches(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Link existing bookings metadata layer gracefully (adds audit capability)
ALTER TABLE bookings ADD COLUMN user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;

-- 5. Product Stock Import Manifest Sheets
CREATE TABLE product_imports (
    id              BIGSERIAL      PRIMARY KEY,
    branch_id       BIGINT         NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    import_date     TIMESTAMPTZ    NOT NULL DEFAULT now(),
    total_cost      DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (total_cost >= 0),
    supplier_name   VARCHAR(150)
);

-- 6. Detail items component tracking matrix
CREATE TABLE product_import_details (
    id              BIGSERIAL      PRIMARY KEY,
    import_id       BIGINT         NOT NULL REFERENCES product_imports(id) ON DELETE CASCADE,
    product_id      BIGINT         NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity        INTEGER        NOT NULL CHECK (quantity > 0),
    purchase_price  DECIMAL(12, 2) NOT NULL CHECK (purchase_price >= 0)
);