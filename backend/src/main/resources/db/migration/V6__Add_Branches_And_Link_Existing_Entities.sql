-- V6__Add_Branches_And_Link_Existing_Entities.sql

-- 1. Create Branches reference table
CREATE TABLE branches (
    id          BIGSERIAL    PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    location    VARCHAR(255) NOT NULL,
    phone       VARCHAR(20),
    email       VARCHAR(100),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Seed a default corporate branch location so existing rows aren't orphaned
INSERT INTO branches (name, location, phone, email) 
VALUES ('Chi Nhánh Trung Tâm', '123 Đường Ba Tháng Hai, Cần Thơ', '02923123456', 'trungtam@badminton.com');

-- 2. Modify courts to attach to specific branches
ALTER TABLE courts ADD COLUMN branch_id BIGINT REFERENCES branches(id) ON DELETE CASCADE;
UPDATE courts SET branch_id = (SELECT id FROM branches LIMIT 1);
ALTER TABLE courts ALTER COLUMN branch_id SET NOT NULL;

-- Drop original code constraint to make code uniqueness scoped per branch
ALTER TABLE courts DROP CONSTRAINT courts_code_key;
ALTER TABLE courts ADD CONSTRAINT uidx_branch_court_code UNIQUE (branch_id, code);

-- 3. Modify products to associate with a specific branch location shop inventory
ALTER TABLE products ADD COLUMN branch_id BIGINT REFERENCES branches(id) ON DELETE CASCADE;
UPDATE products SET branch_id = (SELECT id FROM branches LIMIT 1);
ALTER TABLE products ALTER COLUMN branch_id SET NOT NULL;