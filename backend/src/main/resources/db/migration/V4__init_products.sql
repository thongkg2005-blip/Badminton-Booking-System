-- V4: Create product_categories and products tables (badminton shop)

CREATE TABLE product_categories (
    id          BIGSERIAL    PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE products (
    id           BIGSERIAL      PRIMARY KEY,
    name         VARCHAR(255)   NOT NULL,
    brand        VARCHAR(100),
    price        DECIMAL(12, 2) NOT NULL,
    discount     INTEGER        NOT NULL DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
    image        VARCHAR(10)    NOT NULL DEFAULT '🏸',
    rating       DECIMAL(3, 1)  CHECK (rating >= 0 AND rating <= 5),
    stock        INTEGER        NOT NULL DEFAULT 0 CHECK (stock >= 0),
    description  TEXT,
    category_id  BIGINT         NOT NULL REFERENCES product_categories(id),
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- Seed categories
INSERT INTO product_categories (name) VALUES
    ('Vợt cầu lông'),
    ('Giày cầu lông'),
    ('Quần áo'),
    ('Phụ kiện');

-- Seed products
INSERT INTO products (name, brand, price, discount, image, rating, stock, category_id) VALUES
    ('Vợt cầu lông Yonex Astrox 99',       'Yonex',  2500000, 10, '🏸', 4.8, 50,
        (SELECT id FROM product_categories WHERE name = 'Vợt cầu lông')),
    ('Vợt Victor Thruster K F',             'Victor', 1800000,  5, '🏸', 4.5, 30,
        (SELECT id FROM product_categories WHERE name = 'Vợt cầu lông')),
    ('Vợt Lining N99 II',                   'Li Ning',3200000,  8, '🏸', 4.9, 15,
        (SELECT id FROM product_categories WHERE name = 'Vợt cầu lông')),
    ('Giày cầu lông Li Ning Ultra IV',      'Li Ning',1200000, 15, '👟', 4.6, 40,
        (SELECT id FROM product_categories WHERE name = 'Giày cầu lông')),
    ('Giày Yonex Power Cushion 65Z3',       'Yonex',  2800000,  5, '👟', 4.9, 20,
        (SELECT id FROM product_categories WHERE name = 'Giày cầu lông')),
    ('Giày Victor SH-P9200',                'Victor', 1600000, 10, '👟', 4.7, 25,
        (SELECT id FROM product_categories WHERE name = 'Giày cầu lông')),
    ('Áo thể thao cầu lông Victor',         'Victor',  350000, 12, '👕', 4.6, 100,
        (SELECT id FROM product_categories WHERE name = 'Quần áo')),
    ('Quần cầu lông nam Yonex',             'Yonex',   450000, 10, '🩳', 4.5, 80,
        (SELECT id FROM product_categories WHERE name = 'Quần áo')),
    ('Bộ quần áo Li Ning Tournament',       'Li Ning', 780000,  8, '👕', 4.4, 60,
        (SELECT id FROM product_categories WHERE name = 'Quần áo')),
    ('Túi đựng vợt Yonex BA92026',          'Yonex',   450000,  0, '🎒', 4.3, 35,
        (SELECT id FROM product_categories WHERE name = 'Phụ kiện')),
    ('Dây cầu lông Apacs Nano Impress',     'Apacs',   180000, 20, '🧵', 4.7, 200,
        (SELECT id FROM product_categories WHERE name = 'Phụ kiện')),
    ('Lưới cầu lông chuyên dụng Dunlop',   'Dunlop',  950000,  8, '🕸️', 4.4, 15,
        (SELECT id FROM product_categories WHERE name = 'Phụ kiện')),
    ('Tất thể thao Apacs Pro',              'Apacs',   120000,  0, '🧦', 4.2, 150,
        (SELECT id FROM product_categories WHERE name = 'Phụ kiện')),
    ('Băng cổ tay Victor',                  'Victor',   95000,  5, '🤜', 4.5, 120,
        (SELECT id FROM product_categories WHERE name = 'Phụ kiện'));
