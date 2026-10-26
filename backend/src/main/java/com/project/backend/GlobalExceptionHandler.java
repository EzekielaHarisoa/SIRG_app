
package com.project.backend;

import com.project.backend.conge.DemandeCongeNotFoundException;
import com.project.backend.employe.EmployeNotFound;
import com.project.backend.paie.BulletinPaieNotFoundException;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BulletinPaieNotFoundException.class)
    public ResponseEntity<Map<String, String>>
    gererBulletinIntrouvable(BulletinPaieNotFoundException e) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("erreur", e.getMessage()));
    }

    @ExceptionHandler(EmployeNotFound.class)
    public ResponseEntity<Map<String, String>>
    gererEmployeIntrouvable(EmployeNotFound e) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("erreur", e.getMessage()));
    }

    @ExceptionHandler(DemandeCongeNotFoundException.class)
    public ResponseEntity<Map<String, String>>
    gererDemandeCongeIntrouvable(DemandeCongeNotFoundException e) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("erreur", e.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>>
    gererDonneeInvalide(IllegalArgumentException e) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("erreur", e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>>
    gererErreurValidation(MethodArgumentNotValidException e) {

        List<String> erreurs = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(erreur -> erreur.getField()
                        + " : " + erreur.getDefaultMessage())
                .distinct()
                .toList();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "erreur", "Données invalides",
                        "details", erreurs
                ));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>>
    gererViolationIntegrite(DataIntegrityViolationException e) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "erreur",
                        "L'opération viole une contrainte de la base de données."
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>>
    gererErreurInattendue(Exception e) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "erreur",
                        "Une erreur interne est survenue."
                ));
    }
}
