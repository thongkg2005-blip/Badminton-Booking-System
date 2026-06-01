package com.example.booking.repository;

import com.example.booking.model.Booking;
import com.example.booking.model.Court;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    boolean existsByCourtIdAndBookingDateAndStartTime(Long courtId, LocalDate bookingDate, LocalTime startTime);

    @Query("select b from Booking b where b.court.id = :courtId and b.bookingDate = :date and b.startTime = :startTime")
    List<Booking> findExact(@Param("courtId") Long courtId, @Param("date") LocalDate date, @Param("startTime") LocalTime startTime);
}
