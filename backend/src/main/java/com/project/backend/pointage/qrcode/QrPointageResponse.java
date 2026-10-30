package com.project.backend.pointage.qrcode;

import java.time.LocalDateTime;

public record QrPointageResponse(
        String token,
        LocalDateTime dateCreation,
        LocalDateTime dateExpiration
) { }