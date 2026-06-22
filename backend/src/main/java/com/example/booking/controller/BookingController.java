package com.example.booking.controller;

import com.example.booking.model.Booking;
import com.example.booking.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
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

    @GetMapping("/courts")
    public ResponseEntity<?> getCourts() {
        return ResponseEntity.ok(bookingService.getAllCourts());
    }

    @GetMapping("/availability")
    public ResponseEntity<?> availability(@RequestParam Long courtId,
                                          @RequestParam String date,
                                          @RequestParam String startTime,
                                          @RequestParam(required = false) String endTime) {
        LocalDate d = LocalDate.parse(date);
        LocalTime t = LocalTime.parse(startTime);
        LocalTime et = endTime != null ? LocalTime.parse(endTime) : t.plusHours(2);
        boolean ok = bookingService.isAvailable(courtId, d, t, et);
        return ResponseEntity.ok().body(java.util.Map.of("available", ok));
    }

    @GetMapping("/bookings/occupied")
    public ResponseEntity<?> getOccupiedCourts(@RequestParam String date,
                                               @RequestParam String startTime,
                                               @RequestParam(required = false) String endTime) {
        LocalDate d = LocalDate.parse(date);
        LocalTime t = LocalTime.parse(startTime);
        LocalTime et = endTime != null ? LocalTime.parse(endTime) : t.plusHours(2);
        return ResponseEntity.ok(bookingService.getOccupiedCourtIds(d, t, et));
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
        if (req == null || req.courtId == null || req.date == null || req.startTime == null || req.endTime == null || req.userName == null || req.userName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "courtId, date, startTime, endTime and userName are required");
        }

        LocalDate d = LocalDate.parse(req.date);
        LocalTime st = LocalTime.parse(req.startTime);
        LocalTime et = LocalTime.parse(req.endTime);
        Booking b = bookingService.createBooking(req.courtId, d, st, et, req.userName, req.userPhone, req.notes);
        return ResponseEntity.status(HttpStatus.CREATED).body(java.util.Map.of(
                "id", b.getId(),
                "status", b.getStatus().name()
        ));
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<?> getBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBooking(id));
    }

    @GetMapping("/bookings/my")
    public ResponseEntity<?> getMyBookings(@RequestParam String phone) {
        return ResponseEntity.ok(bookingService.getBookingsByPhone(phone));
    }

    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        Booking booking = bookingService.cancelBooking(id);
        return ResponseEntity.ok(java.util.Map.of(
                "id", booking.getId(),
                "status", booking.getStatus().name()
        ));
    }
}
