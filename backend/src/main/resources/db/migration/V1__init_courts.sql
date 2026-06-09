-- V1: Create courts table and seed 10 courts

CREATE TABLE courts (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    code       VARCHAR(20)  NOT NULL UNIQUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Seed 10 courts
INSERT INTO courts (name, code) VALUES
    ('Sân 1',  'C01'),
    ('Sân 2',  'C02'),
    ('Sân 3',  'C03'),
    ('Sân 4',  'C04'),
    ('Sân 5',  'C05'),
    ('Sân 6',  'C06'),
    ('Sân 7',  'C07'),
    ('Sân 8',  'C08'),
    ('Sân 9',  'C09'),
    ('Sân 10', 'C10');
