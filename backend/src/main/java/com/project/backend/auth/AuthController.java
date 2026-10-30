
package com.project.backend.auth;

import com.project.backend.auth.dto.LoginRequest;
import com.project.backend.auth.dto.LoginResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        System.out.println("========== AUTHENTIFICATION ==========");
        System.out.println(">>> AuthController.login() appelé");

        try {
            System.out.println(">>> Appel du AuthService");

            LoginResponse response = authService.connecter(
                    request.getLogin(),
                    request.getMotDePasse()
            );

            System.out.println(">>> Authentification réussie");

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {

            System.out.println(">>> Erreur : " + e.getMessage());

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("message", e.getMessage()));
        }
    }}
