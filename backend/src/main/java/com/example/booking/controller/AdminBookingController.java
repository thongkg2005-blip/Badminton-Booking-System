package com.example.booking.controller;

import com.example.booking.model.Booking;
import com.example.booking.model.BookingStatus;
import com.example.booking.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminBookingController {
    private final BookingService bookingService;

    public AdminBookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/bookings")
    public ResponseEntity<?> listBookings(@RequestParam(required = false) BookingStatus status,
                                          @RequestParam(required = false) String date,
                                          @RequestParam(required = false) Long courtId) {
        LocalDate bookingDate = date != null ? LocalDate.parse(date) : null;
        return ResponseEntity.ok(bookingService.listBookings(status, bookingDate, courtId));
    }

    @PostMapping("/bookings/{id}/confirm")
    public ResponseEntity<?> confirmBooking(@PathVariable Long id) {
        Booking booking = bookingService.confirmBooking(id);
        return ResponseEntity.ok(Map.of(
                "id", booking.getId(),
                "status", booking.getStatus().name()
        ));
    }

    @PostMapping("/bookings/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        Booking booking = bookingService.cancelBooking(id);
        return ResponseEntity.ok(Map.of(
                "id", booking.getId(),
                "status", booking.getStatus().name()
        ));
    }

    @GetMapping("/bookings/stats")
    public ResponseEntity<?> bookingStats() {
        return ResponseEntity.ok(bookingService.bookingStats());
    }

    public static class BlockSlotRequest {
        public Long courtId;
        public String date;
        public String startTime;
        public String endTime;
        public String reason;
    }

    @PostMapping("/bookings/block")
    public ResponseEntity<?> blockSlot(@RequestBody BlockSlotRequest req) {
        if (req == null || req.courtId == null || req.date == null || req.startTime == null || req.endTime == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "courtId, date, startTime and endTime are required");
        }

        LocalDate bookingDate = LocalDate.parse(req.date);
        LocalTime startTime = LocalTime.parse(req.startTime);
        LocalTime endTime = LocalTime.parse(req.endTime);
        Booking booking = bookingService.blockSlot(req.courtId, bookingDate, startTime, endTime, req.reason);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", booking.getId(),
                "status", booking.getStatus().name()
        ));
    }
}
