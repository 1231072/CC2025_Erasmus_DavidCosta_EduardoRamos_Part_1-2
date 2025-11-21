package com.cloudcomputing.config;

import com.cloudcomputing.model.UserEntity;
import com.cloudcomputing.service.JpaUserDetailsService;
import com.cloudcomputing.config.security.JwtUtils; // Assumindo que JwtUtils está em config.security
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.cloudcomputing.controller.RegisterRequest;
import com.cloudcomputing.controller.LoginRequest;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtUtils jwtUtils;
    private final JpaUserDetailsService userService;


    public AuthController(AuthenticationManager authManager, JwtUtils jwtUtils, JpaUserDetailsService userService) {
        this.authManager = authManager;
        this.jwtUtils = jwtUtils;
        this.userService = userService;
    }


    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (req.getUsername() == null || req.getPassword() == null) {
            return ResponseEntity.badRequest().body("username and password required");
        }
        try {
            UserEntity created = userService.register(req.getUsername(), req.getPassword());
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "user created", "username", created.getUsername()));
        } catch (IllegalArgumentException ex) {
            // Conflito: Usuário já existe
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        } catch (Exception e) {
            // Erro interno (DB, etc.)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Registration failed due to server error.");
        }
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));

        UserDetails user = (UserDetails) auth.getPrincipal();
        String token = jwtUtils.generateToken(user);

        return ResponseEntity.ok(Map.of("token", token, "type", "Bearer"));
    }
}