package com.example.booking.controller;

import com.example.booking.model.Booking;
import com.example.booking.model.User;
import com.example.booking.repository.UserRepository;
import com.example.booking.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class BookingController {
    private final BookingService bookingService;
    private final UserRepository userRepository;

    public BookingController(BookingService bookingService, UserRepository userRepository) {
        this.bookingService = bookingService;
        this.userRepository = userRepository;
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
        public Long userId;
        public String notes;
    }

    @PostMapping("/bookings")
    public ResponseEntity<?> book(@RequestBody BookingRequest req, Authentication authentication) {
        if (req == null || req.courtId == null || req.date == null || req.startTime == null || req.endTime == null || req.userName == null || req.userName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "courtId, date, startTime, endTime and userName are required");
        }

        LocalDate d = LocalDate.parse(req.date);
        LocalTime st = LocalTime.parse(req.startTime);
        LocalTime et = LocalTime.parse(req.endTime);

        Long userId = req.userId;
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getName())) {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isPresent()) {
                userId = userOpt.get().getId();
            }
        }

        Booking b = bookingService.createBooking(req.courtId, d, st, et, req.userName, req.userPhone, req.notes, userId);
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
    public ResponseEntity<?> getMyBookings(Authentication authentication,
                                           @RequestParam(required = false) Long userId,
                                           @RequestParam(required = false) String phone) {
        // If the user is authenticated, resolve their userId from the JWT principal (username)
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getName())) {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isPresent()) {
                return ResponseEntity.ok(bookingService.getBookingsByUserId(userOpt.get().getId()));
            }
        }
        // Fallback: look up by userId query param
        if (userId != null) {
            return ResponseEntity.ok(bookingService.getBookingsByUserId(userId));
        }
        // Guest fallback: look up by phone number
        if (phone != null && !phone.isBlank()) {
            return ResponseEntity.ok(bookingService.getBookingsByPhone(phone));
        }
        return ResponseEntity.ok(java.util.List.of());
    }

    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        Booking booking = bookingService.cancelBooking(id);
        return ResponseEntity.ok(java.util.Map.of(
                "id", booking.getId(),
                "status", booking.getStatus().name()
        ));
    }

    @GetMapping("/debug-bookings")
    public ResponseEntity<?> debugBookings() {
        return ResponseEntity.ok(bookingService.getAllCourts().stream().flatMap(c -> 
            bookingService.listBookings(null, null, c.getId()).stream().map(b -> java.util.Map.of(
                "id", b.getId(),
                "userId", b.getUser() != null ? b.getUser().getId() : "null",
                "userName", b.getUserName(),
                "userPhone", b.getUserPhone() != null ? b.getUserPhone() : "null",
                "date", b.getBookingDate().toString(),
                "time", b.getStartTime().toString() + "-" + b.getEndTime().toString()
            ))
        ).sorted(java.util.Comparator.comparing(m -> Long.parseLong(m.get("id").toString()), java.util.Comparator.reverseOrder())).toList());
    }
}
