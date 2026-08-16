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
        String phone = normalizePhone(req.phone != null ? req.phone : "");

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

    public static class ChangePasswordRequest {
        public String oldPassword;
        public String newPassword;
        public String confirmNewPassword;
    }

    public static class UpdateProfileRequest {
        public String fullName;
        public String email;
        public String phone;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        if (req == null || req.username == null || req.username.isBlank()
                || req.password == null || req.password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username and password are required");
        }

        User user = userRepository.findByUsername(req.username.trim())
                .orElse(null);

        var encoder = PasswordUtil.createEncoder();
        if (user == null || !encoder.matches(req.password, user.getPassword())) {
            return unauthorized("Đăng nhập thất bại");
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

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestBody ChangePasswordRequest req
    ) {
        String username = resolveUsername(authorizationHeader);
        if (username == null || username.isBlank()) {
            return unauthorized("Unauthorized");
        }

        if (req == null || req.oldPassword == null || req.oldPassword.isBlank()
                || req.newPassword == null || req.newPassword.isBlank()
                || req.confirmNewPassword == null || req.confirmNewPassword.isBlank()) {
            return badRequest("All password fields are required");
        }

        if (req.newPassword.length() < 6) {
            return badRequest("Mật khẩu mới phải có ít nhất 6 ký tự");
        }
        if (!req.newPassword.matches(".*[A-Za-z].*") || !req.newPassword.matches(".*\\d.*")) {
            return badRequest("Mật khẩu mới phải có ít nhất 1 chữ cái và 1 chữ số");
        }
        if (!req.newPassword.equals(req.confirmNewPassword)) {
            return badRequest("Xác nhận mật khẩu mới không khớp");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        var encoder = PasswordUtil.createEncoder();
        if (!encoder.matches(req.oldPassword, user.getPassword())) {
            return badRequest("Mật khẩu cũ không đúng");
        }

        user.setPassword(encoder.encode(req.newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestBody UpdateProfileRequest req
    ) {
        String username = resolveUsername(authorizationHeader);
        if (username == null || username.isBlank()) {
            return unauthorized("Unauthorized");
        }
        if (req == null) {
            return badRequest("Request body is required");
        }

        String fullName = req.fullName != null ? req.fullName.trim() : "";
        String email = req.email != null ? req.email.trim() : "";
        String phone = normalizePhone(req.phone != null ? req.phone : "");

        if (fullName.isBlank()) {
            return badRequest("Ho ten khong duoc de trong");
        }
        if (countLetters(fullName) < 2) {
            return badRequest("Ho ten phai co it nhat 2 chu cai");
        }
        if (email.isBlank()) {
            return badRequest("Email khong duoc de trong");
        }
        if (!email.matches(EMAIL_REGEX)) {
            return badRequest("Email khong hop le");
        }
        if (phone.isBlank()) {
            return badRequest("So dien thoai khong duoc de trong");
        }
        if (!phone.matches(VIETNAM_PHONE_REGEX)) {
            return badRequest("So dien thoai phai gom 10 chu so va bat dau bang 0");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        userRepository.findByEmail(email).ifPresent(existing -> {
            if (!existing.getId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email da duoc su dung");
            }
        });

        user.setFullName(fullName);
        user.setEmail(email);
        user.setPhone(phone);

        User saved = userRepository.save(user);
        return ResponseEntity.ok(Map.of(
                "message", "Cap nhat thong tin thanh cong",
                "user", userResponse(saved)
        ));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        String username = resolveUsername(authorizationHeader);
        if (username == null || username.isBlank()) {
            return unauthorized("Unauthorized");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        return ResponseEntity.ok(Map.of("user", userResponse(user)));
    }

    private long countLetters(String value) {
        return value.codePoints().filter(Character::isLetter).count();
    }

    private String normalizePhone(String phone) {
        String normalized = phone == null ? "" : phone.replaceAll("[\\s\\-\\.\\(\\)]", "");
        if (normalized.startsWith("+84")) {
            normalized = "0" + normalized.substring(3);
        } else if (normalized.startsWith("84") && normalized.length() == 11) {
            normalized = "0" + normalized.substring(2);
        }
        return normalized;
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

    private ResponseEntity<Map<String, String>> unauthorized(String message) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", message));
    }

    private String resolveUsername(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }

        try {
            return jwtUtil().parseClaims(authorizationHeader.substring(7)).getSubject();
        } catch (Exception ignored) {
            return null;
        }
    }
}
