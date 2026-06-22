package com.example.booking.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class PasswordUtil {
    public static PasswordEncoder createEncoder() {
        return new BCryptPasswordEncoder();
    }
}


