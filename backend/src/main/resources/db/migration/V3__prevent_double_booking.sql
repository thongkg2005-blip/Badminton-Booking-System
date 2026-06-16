-- V3: Prevent duplicate bookings for the same court, date, and start time
CREATE UNIQUE INDEX uidx_bookings_court_datetime 
ON bookings (court_id, booking_date, start_time) 
WHERE status <> 'CANCELLED';
