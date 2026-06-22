package com.example.booking.controller;

import com.example.booking.model.User;
import com.example.booking.repository.UserRepository;
import com.example.booking.security.JwtUtil;
import com.example.booking.security.PasswordUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordUtil passwordUtil;
    private static final String VIETNAM_PHONE_REGEX = "^0\\d{9}$";
    private static final String EMAIL_REGEX = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordUtil = new PasswordUtil();
    }

    // Note: for a real system, move secret + ttl to application properties.
    private JwtUtil jwtUtil() {
        String secret = System.getenv().getOrDefault("JWT_SECRET", "dev-secret-change-me-please-dev-secret-change-me");
        long ttlMillis = Long.parseLong(System.getenv().getOrDefault("JWT_TTL_MILLIS", "86400000")); // 24h
        return new JwtUtil(secret, ttlMillis);
    }

    public static class RegisterRequest {
        public String fullName;
        public String username;
        public String password;
        public String email;
        public String phone;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (req == null) {
            return badRequest("Request body is required");
        }

        String fullName = req.fullName != null ? req.fullName.trim() : "";
        String username = req.username != null ? req.username.trim() : "";
        String email = req.email != null ? req.email.trim() : "";
        String phone = req.phone != null ? req.phone.trim() : "";

        if (fullName.isBlank()) {
            return badRequest("Full name is required");
        }
        if (fullName.split("\\s+").length < 2) {
            return badRequest("Full name must contain at least 2 words");
        }
        if (username.isBlank()) {
            return badRequest("Username is required");
        }
        if (!email.isBlank() && !email.matches(EMAIL_REGEX)) {
            return badRequest("Email is invalid");
        }
        if (phone.isBlank()) {
            return badRequest("Phone number is required");
        }
        if (!phone.matches(VIETNAM_PHONE_REGEX)) {
            return badRequest("Phone number must be 10 digits and start with 0");
        }
        if (req.password == null || req.password.length() < 6) {
            return badRequest("Password must be at least 6 characters");
        }
        if (!req.password.matches(".*[A-Za-z].*") || !req.password.matches(".*\\d.*")) {
            return badRequest("Password must contain at least one letter and one number");
        }

        if (userRepository.existsByUsername(username)) {
            return badRequest("Username already exists");
        }
        if (!email.isBlank() && userRepository.existsByEmail(email)) {
            return badRequest("Email already exists");
        }

        var encoder = PasswordUtil.createEncoder();
        User user = new User();
        user.setFullName(fullName);
        user.setUsername(username);
        user.setPassword(encoder.encode(req.password));
        user.setEmail(!email.isBlank() ? email : null);
        user.setPhone(!phone.isBlank() ? phone : null);
        user.setRole("CUSTOMER");

        User saved = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Đăng ký tài khoản thành công",
                "user", userResponse(saved)
        ));
    }

    public static class LoginRequest {
        public String username;
        public String password;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        if (req == null || req.username == null || req.username.isBlank()
                || req.password == null || req.password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username and password are required");
        }

        User user = userRepository.findByUsername(req.username.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Username or password is incorrect"));

        var encoder = PasswordUtil.createEncoder();
        if (!encoder.matches(req.password, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Username or password is incorrect");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole());
        claims.put("userId", user.getId());

        String token = jwtUtil().generateToken(user.getUsername(), claims);
        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", userResponse(user)
        ));
    }

    private Map<String, Object> userResponse(User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("fullName", user.getFullName());
        response.put("email", user.getEmail());
        response.put("phone", user.getPhone());
        response.put("role", user.getRole());
        return response;
    }

    private ResponseEntity<Map<String, String>> badRequest(String message) {
        return ResponseEntity.badRequest().body(Map.of("message", message));
    }
}

