-- Flyway V1: create core booking schema
CREATE TABLE IF NOT EXISTS courts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS time_slots (
  id BIGSERIAL PRIMARY KEY,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  court_id BIGINT NOT NULL REFERENCES courts(id) ON DELETE RESTRICT,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  user_name TEXT NOT NULL,
  user_phone TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'CONFIRMED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Prevent overlapping bookings at the same court for the same start time
CREATE UNIQUE INDEX IF NOT EXISTS ux_bookings_court_date_start ON bookings(court_id, booking_date, start_time);

-- Optional: index for looking up availability quickly
CREATE INDEX IF NOT EXISTS idx_bookings_court_date ON bookings(court_id, booking_date);
