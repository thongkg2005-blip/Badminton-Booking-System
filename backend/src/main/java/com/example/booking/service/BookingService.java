package com.example.booking.service;

import com.example.booking.model.Booking;
import com.example.booking.model.BookingStatus;
import com.example.booking.model.Court;
import com.example.booking.repository.BookingRepository;
import com.example.booking.repository.CourtRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import java.util.stream.Collectors;

@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final CourtRepository courtRepository;

    public BookingService(BookingRepository bookingRepository, CourtRepository courtRepository) {
        this.bookingRepository = bookingRepository;
        this.courtRepository = courtRepository;
    }

    public boolean isAvailable(Long courtId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        return !bookingRepository.existsOverlappingBooking(courtId, date, startTime, endTime);
    }

    @Transactional(readOnly = true)
    public List<Court> getAllCourts() {
        return courtRepository.findAll();
    }

    @Transactional
    public Booking createBooking(Long courtId, LocalDate date, LocalTime startTime, LocalTime endTime, String userName, String userPhone, String notes) {
        validateBookingWindow(date, startTime, endTime);

        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Court not found: " + courtId));

        if (!isAvailable(courtId, date, startTime, endTime)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Selected slot is not available");
        }

        Booking b = new Booking();
        b.setCourt(court);
        b.setBookingDate(date);
        b.setStartTime(startTime);
        b.setEndTime(endTime);
        b.setUserName(userName);
        b.setUserPhone(userPhone);
        b.setNotes(notes);
        b.setStatus(BookingStatus.CONFIRMED);

        return bookingRepository.save(b);
    }

    @Transactional(readOnly = true)
    public Booking getBooking(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found: " + bookingId));
    }

    @Transactional
    public Booking cancelBooking(Long bookingId) {
        Booking booking = getBooking(bookingId);
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            return booking;
        }

        LocalDateTime bookingStart = LocalDateTime.of(booking.getBookingDate(), booking.getStartTime());
        if (LocalDateTime.now().isAfter(bookingStart.minusHours(2))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking can only be cancelled at least 2 hours before start time");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    @Transactional(readOnly = true)
    public List<Booking> listBookings(BookingStatus status, LocalDate date, Long courtId) {
        Stream<Booking> stream = bookingRepository.findAll().stream();

        if (status != null) {
            stream = stream.filter(booking -> booking.getStatus() == status);
        }
        if (date != null) {
            stream = stream.filter(booking -> date.equals(booking.getBookingDate()));
        }
        if (courtId != null) {
            stream = stream.filter(booking -> booking.getCourt() != null && courtId.equals(booking.getCourt().getId()));
        }

        return stream.sorted(Comparator
                        .comparing(Booking::getBookingDate)
                        .thenComparing(Booking::getStartTime))
                .toList();
    }

    @Transactional
    public Booking confirmBooking(Long bookingId) {
        Booking booking = getBooking(bookingId);
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cancelled bookings cannot be confirmed");
        }
        booking.setStatus(BookingStatus.CONFIRMED);
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking blockSlot(Long courtId, LocalDate date, LocalTime startTime, LocalTime endTime, String reason) {
        validateBookingWindow(date, startTime, endTime);

        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Court not found: " + courtId));

        if (!isAvailable(courtId, date, startTime, endTime)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Selected slot is not available");
        }

        Booking booking = new Booking();
        booking.setCourt(court);
        booking.setBookingDate(date);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setUserName("ADMIN BLOCK");
        booking.setUserPhone(null);
        booking.setNotes(reason);
        booking.setStatus(BookingStatus.BLOCKED);

        return bookingRepository.save(booking);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> bookingStats() {
        Map<BookingStatus, Long> counts = bookingRepository.findAll().stream()
                .collect(Collectors.groupingBy(Booking::getStatus, Collectors.counting()));

        return Map.of(
                "total", (long) bookingRepository.count(),
                "confirmed", counts.getOrDefault(BookingStatus.CONFIRMED, 0L),
                "cancelled", counts.getOrDefault(BookingStatus.CANCELLED, 0L),
                "blocked", counts.getOrDefault(BookingStatus.BLOCKED, 0L)
        );
    }

    private void validateBookingWindow(LocalDate date, LocalTime startTime, LocalTime endTime) {
        if (date == null || startTime == null || endTime == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date, start time and end time are required");
        }
        if (!endTime.isAfter(startTime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        LocalDateTime bookingStart = LocalDateTime.of(date, startTime);
        if (bookingStart.isBefore(LocalDateTime.now().plusHours(1))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bookings must be made at least 1 hour in advance");
        }
    }
}
