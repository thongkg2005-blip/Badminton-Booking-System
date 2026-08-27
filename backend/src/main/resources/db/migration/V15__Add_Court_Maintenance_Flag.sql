-- V15: Add admin maintenance flag to courts

ALTER TABLE courts
    ADD COLUMN IF NOT EXISTS is_maintenance BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE courts
SET is_maintenance = FALSE
WHERE is_maintenance IS NULL;
