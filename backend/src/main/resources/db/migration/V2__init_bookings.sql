-- V2: Create bookings table

CREATE TABLE bookings (
    id           BIGSERIAL    PRIMARY KEY,
    court_id     BIGINT       NOT NULL REFERENCES courts(id),
    booking_date DATE         NOT NULL,
    start_time   TIME         NOT NULL,
    end_time     TIME         NOT NULL,
    user_name    VARCHAR(255) NOT NULL,
    user_phone   VARCHAR(50),
    notes        TEXT,
    status       VARCHAR(20)  NOT NULL DEFAULT 'CONFIRMED',
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT chk_time_order CHECK (end_time > start_time)
);

-- Index for overlap detection queries (used by BookingRepository)
CREATE INDEX idx_bookings_court_date ON bookings (court_id, booking_date);
