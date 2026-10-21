package com.project.backend;

import com.project.backend.paie.BulletinPaieNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BulletinPaieNotFoundException.class)
    public ResponseEntity<Map<String, String>> gererBulletinIntrouvable(BulletinPaieNotFoundException exception) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("erreur",exception.getMessage()));

    }

    @ExceptionHandler(IllegalArgumentException.class)
    public  ResponseEntity<Map<String,String>> gererDonneInvalide(IllegalArgumentException exception) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("erreur", exception.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public  ResponseEntity<Map<String,String>> gererErreurInatendue(Exception exception) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("erreur", "erreur interne est survenue"));
    }


}
