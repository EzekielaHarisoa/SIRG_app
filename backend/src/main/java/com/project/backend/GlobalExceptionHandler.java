
package com.project.backend;

import com.project.backend.conge.DemandeCongeNotFoundException;
import com.project.backend.employe.EmployeNotFound;
import com.project.backend.paie.BulletinPaieNotFoundException;

import jakarta.validation.ConstraintViolationException;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Ressources introuvables : 404

    @ExceptionHandler({
            BulletinPaieNotFoundException.class,
            EmployeNotFound.class,
            DemandeCongeNotFoundException.class
    })
    public ResponseEntity<Map<String, String>> gererRessourceIntrouvable(
            RuntimeException e) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("erreur", e.getMessage()));
    }

    // Données métier invalides : 400

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> gererDonneeInvalide(
            IllegalArgumentException e) {

        return ResponseEntity
                .badRequest()
                .body(Map.of("erreur", e.getMessage()));
    }

    // Règle métier non respectée (ordre des événements de pointage,
    // chronologie, pointage déjà existant) : 409.
    // Sans ce mapping, le handler générique ci-dessous renvoie 500 et
    // masque la cause réelle à l'utilisateur.

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> gererConflitMetier(
            IllegalStateException e) {

        String message = e.getMessage();

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "erreur",
                        message == null || message.isBlank()
                                ? "Cette opération n'est pas autorisée dans l'état actuel."
                                : message
                ));
    }

    // Erreurs de validation du modèle : 400

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> gererErreurValidation(
            MethodArgumentNotValidException e) {

        List<String> erreurs = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(erreur -> erreur.getField()
                        + " : " + erreur.getDefaultMessage())
                .distinct()
                .toList();

        return ResponseEntity
                .badRequest()
                .body(Map.of(
                        "erreur", "Données invalides",
                        "details", erreurs
                ));
    }

    // JSON ou conversion de données invalide : 400

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> gererRequeteIllisible(
            HttpMessageNotReadableException e) {

        return ResponseEntity
                .badRequest()
                .body(Map.of(
                        "erreur",
                        "Le corps de la requête est invalide "
                                + "ou contient des valeurs mal formatées."
                ));
    }

    // Contraintes de validation : 400

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, String>> gererViolationValidation(
            ConstraintViolationException e) {

        return ResponseEntity
                .badRequest()
                .body(Map.of(
                        "erreur",
                        "Une ou plusieurs contraintes de validation "
                                + "ne sont pas respectées."
                ));
    }

    // Violation d'intégrité de la base de données : 409

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> gererViolationIntegrite(
            DataIntegrityViolationException e) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "erreur",
                        "L'opération viole une contrainte "
                                + "de la base de données."
                ));
    }

    // Authentification invalide ou session absente : 401

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, String>> gererErreurAuthentification(
            AuthenticationException e) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("erreur", "Identifiants invalides ou session expirée."));
    }

    // Erreur inattendue : 500

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> gererErreurInattendue(
            Exception e) {

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "erreur",
                        "Une erreur interne est survenue."
                ));
    }
}
