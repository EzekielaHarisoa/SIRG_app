package com.project.backend.pointage.qrcode;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class QrPointageService {

    private static final int DUREE_VALIDITE_SECONDES = 300;

    private final QrPointageRepository repository;
    private final QrCodeGenerator qrCodeGenerator;

    private final SecureRandom secureRandom = new SecureRandom();

    public QrPointageService(
            QrPointageRepository repository,
            QrCodeGenerator qrCodeGenerator
    ) {
        this.repository = repository;
        this.qrCodeGenerator = qrCodeGenerator;
    }

    @Transactional
    public QrCodeResponse genererQrCode() {

        byte[] donnees = new byte[32];
        secureRandom.nextBytes(donnees);

        String token = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(donnees);

        LocalDateTime maintenant = LocalDateTime.now();

        LocalDateTime expiration = maintenant.plusSeconds(
                DUREE_VALIDITE_SECONDES
        );

        QrPointage qrPointage = new QrPointage();

        qrPointage.setTokenHash(calculerHash(token));
        qrPointage.setDateCreation(maintenant);
        qrPointage.setDateExpiration(expiration);
        qrPointage.setActif(1);

        repository.desactiverTous();
        repository.enregistrer(qrPointage);

        String imageBase64 = qrCodeGenerator.genererImage(token);

        return new QrCodeResponse(
                token,
                imageBase64,
                maintenant,
                expiration
        );
    }

    public boolean verifierToken(String token) {

        if (token == null || token.isBlank()) {
            return false;
        }

        return repository.estValide(calculerHash(token));
    }

    private String calculerHash(String token) {

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    token.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hash);

        } catch (Exception e) {
            throw new IllegalStateException(
                    "Impossible de calculer le hash du jeton.",
                    e
            );
        }
    }
}