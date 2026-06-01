-- Flyway V2: seed initial courts
INSERT INTO courts (name, code) VALUES
  ('Sân 1', 'SAN1') ON CONFLICT DO NOTHING,
  ('Sân 2', 'SAN2') ON CONFLICT DO NOTHING,
  ('Sân 3', 'SAN3') ON CONFLICT DO NOTHING;
