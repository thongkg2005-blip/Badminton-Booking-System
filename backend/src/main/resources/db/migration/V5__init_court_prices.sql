-- V5: Store court prices by time slot and day type

CREATE TABLE court_prices (
    id          BIGSERIAL    PRIMARY KEY,
    start_time  TIME         NOT NULL,
    end_time    TIME         NOT NULL,
    day_type    VARCHAR(20)  NOT NULL,
    price_vnd   INTEGER      NOT NULL CHECK (price_vnd >= 0),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT chk_court_prices_day_type
        CHECK (day_type IN ('WEEKDAY', 'WEEKEND', 'SPECIAL_DAY')),
    CONSTRAINT chk_court_prices_time_range
        CHECK (end_time > start_time),
    CONSTRAINT uidx_court_prices_slot_day_type
        UNIQUE (start_time, end_time, day_type)
);

INSERT INTO court_prices (start_time, end_time, day_type, price_vnd) VALUES
    ('05:00', '07:00', 'WEEKDAY', 40000),
    ('05:00', '07:00', 'WEEKEND', 50000),
    ('05:00', '07:00', 'SPECIAL_DAY', 60000),
    ('07:00', '09:00', 'WEEKDAY', 40000),
    ('07:00', '09:00', 'WEEKEND', 50000),
    ('07:00', '09:00', 'SPECIAL_DAY', 60000),
    ('09:00', '11:00', 'WEEKDAY', 40000),
    ('09:00', '11:00', 'WEEKEND', 50000),
    ('09:00', '11:00', 'SPECIAL_DAY', 60000),
    ('11:00', '13:00', 'WEEKDAY', 40000),
    ('11:00', '13:00', 'WEEKEND', 50000),
    ('11:00', '13:00', 'SPECIAL_DAY', 60000),
    ('13:00', '15:00', 'WEEKDAY', 40000),
    ('13:00', '15:00', 'WEEKEND', 50000),
    ('13:00', '15:00', 'SPECIAL_DAY', 60000),
    ('15:00', '17:00', 'WEEKDAY', 40000),
    ('15:00', '17:00', 'WEEKEND', 50000),
    ('15:00', '17:00', 'SPECIAL_DAY', 60000),
    ('17:00', '19:00', 'WEEKDAY', 69000),
    ('17:00', '19:00', 'WEEKEND', 85000),
    ('17:00', '19:00', 'SPECIAL_DAY', 100000),
    ('19:00', '21:00', 'WEEKDAY', 69000),
    ('19:00', '21:00', 'WEEKEND', 85000),
    ('19:00', '21:00', 'SPECIAL_DAY', 100000),
    ('21:00', '23:00', 'WEEKDAY', 69000),
    ('21:00', '23:00', 'WEEKEND', 85000),
    ('21:00', '23:00', 'SPECIAL_DAY', 100000);
