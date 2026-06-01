package com.example.booking.service;

import com.example.booking.model.Booking;
import com.example.booking.model.Court;
import com.example.booking.repository.BookingRepository;
import com.example.booking.repository.CourtRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final CourtRepository courtRepository;

    public BookingService(BookingRepository bookingRepository, CourtRepository courtRepository) {
        this.bookingRepository = bookingRepository;
        this.courtRepository = courtRepository;
    }

    public boolean isAvailable(Long courtId, LocalDate date, LocalTime startTime) {
        return !bookingRepository.existsByCourtIdAndBookingDateAndStartTime(courtId, date, startTime);
    }

    @Transactional
    public Booking createBooking(Long courtId, LocalDate date, LocalTime startTime, LocalTime endTime, String userName, String userPhone, String notes) {
        // Basic checks
        Optional<Court> courtOpt = courtRepository.findById(courtId);
        if (courtOpt.isEmpty()) throw new IllegalArgumentException("Court not found: " + courtId);

        if (!isAvailable(courtId, date, startTime)) {
            throw new IllegalStateException("Selected slot is not available");
        }

        Booking b = new Booking();
        b.setCourt(courtOpt.get());
        b.setBookingDate(date);
        b.setStartTime(startTime);
        b.setEndTime(endTime);
        b.setUserName(userName);
        b.setUserPhone(userPhone);
        b.setNotes(notes);

        return bookingRepository.save(b);
    }
}
