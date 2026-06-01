package com.example.booking.controller;

import com.example.booking.model.Booking;
import com.example.booking.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;

@RestController
@RequestMapping("/api")
public class BookingController {
    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/availability")
    public ResponseEntity<?> availability(@RequestParam Long courtId, @RequestParam String date, @RequestParam String startTime) {
        LocalDate d = LocalDate.parse(date);
        LocalTime t = LocalTime.parse(startTime);
        boolean ok = bookingService.isAvailable(courtId, d, t);
        return ResponseEntity.ok().body(java.util.Map.of("available", ok));
    }

    public static class BookingRequest {
        public Long courtId;
        public String date;
        public String startTime;
        public String endTime;
        public String userName;
        public String userPhone;
        public String notes;
    }

    @PostMapping("/bookings")
    public ResponseEntity<?> book(@RequestBody BookingRequest req) {
        LocalDate d = LocalDate.parse(req.date);
        LocalTime st = LocalTime.parse(req.startTime);
        LocalTime et = LocalTime.parse(req.endTime);
        Booking b = bookingService.createBooking(req.courtId, d, st, et, req.userName, req.userPhone, req.notes);
        return ResponseEntity.ok().body(java.util.Map.of("id", b.getId()));
    }
}
