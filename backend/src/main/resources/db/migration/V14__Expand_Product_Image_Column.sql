-- V14: Expand image column in products table to TEXT to support Data URLs / Image URLs
ALTER TABLE products ALTER COLUMN image TYPE TEXT;
