package com.project.backend.pointage.qrcode;

import java.time.LocalDateTime;

public record QrCodeResponse (
        String token,
        String imageBase64,
        LocalDateTime dateCreation,
        LocalDateTime dateExpiration){
}
