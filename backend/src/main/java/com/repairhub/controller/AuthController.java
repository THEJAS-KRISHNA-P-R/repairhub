package com.repairhub.controller;

import com.repairhub.entity.User;
import com.repairhub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
        }
        
        User user = userOpt.get();
        // In a real app, you'd hash and compare passwords
        // For now, we'll just check if password is provided
        if (password == null || password.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password required"));
        }
        
        // Generate a simple token (in production, use JWT)
        String token = "token_" + user.getId() + "_" + System.currentTimeMillis();
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "email", user.getEmail(),
            "bio", user.getBio() != null ? user.getBio() : "",
            "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : ""
        ));
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String username = request.get("username");
        String password = request.get("password");
        
        if (email == null || username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email, username, and password are required"));
        }
        
        // Check if user already exists
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }
        
        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }
        
        // Create new user
        User user = new User();
        user.setEmail(email);
        user.setUsername(username);
        user.setPassword(password); // In production, hash this
        user.setBio("");
        user.setAvatarUrl("/placeholder-user.jpg");
        
        User savedUser = userRepository.save(user);
        
        // Generate token
        String token = "token_" + savedUser.getId() + "_" + System.currentTimeMillis();
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", Map.of(
            "id", savedUser.getId(),
            "username", savedUser.getUsername(),
            "email", savedUser.getEmail(),
            "bio", savedUser.getBio() != null ? savedUser.getBio() : "",
            "avatarUrl", savedUser.getAvatarUrl() != null ? savedUser.getAvatarUrl() : ""
        ));
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
    
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(Map.of("error", "No token provided"));
        }
        
        String token = authHeader.substring(7);
        // Extract user ID from token (simple implementation)
        try {
            String[] parts = token.split("_");
            if (parts.length >= 2) {
                Long userId = Long.parseLong(parts[1]);
                Optional<User> userOpt = userRepository.findById(userId);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    return ResponseEntity.ok(Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "bio", user.getBio() != null ? user.getBio() : "",
                        "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : ""
                    ));
                }
            }
        } catch (Exception e) {
            // Invalid token format
        }
        
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid token"));
    }
}
