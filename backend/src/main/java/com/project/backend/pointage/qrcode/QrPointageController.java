package com.project.backend.pointage.qrcode;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pointages/qrcode")
public class QrPointageController {

    private final QrPointageService qrPointageService;

    public QrPointageController(QrPointageService qrPointageService) {
        this.qrPointageService = qrPointageService;
    }

    @GetMapping("/actuel")
    public ResponseEntity<QrCodeResponse> genererQrCode() {

        QrCodeResponse response = qrPointageService.genererQrCode();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verifier")
    public ResponseEntity<Boolean> verifierToken(@RequestBody QrTokenRequest request) {

        boolean valide = qrPointageService.verifierToken(request.token());

        return ResponseEntity.ok(valide);
    }
}