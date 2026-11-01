
package com.project.backend;

import com.project.backend.conge.DemandeCongeNotFoundException;
import com.project.backend.employe.EmployeNotFound;
import com.project.backend.paie.BulletinPaieNotFoundException;

import jakarta.validation.ConstraintViolationException;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

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
                .body(Map.of(
                        "erreur",
                        e.getMessage() == null
                                ? "Les données fournies sont invalides."
                                : e.getMessage()
                ));
    }

    // Conflit métier : 409
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

    // Erreurs de validation des objets : 400
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> gererErreurValidation(
            MethodArgumentNotValidException e) {

        List<String> erreurs = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(erreur ->
                        erreur.getField() + " : " + erreur.getDefaultMessage()
                )
                .distinct()
                .toList();

        return ResponseEntity
                .badRequest()
                .body(Map.of(
                        "erreur", "Données invalides",
                        "details", erreurs
                ));
    }

    // JSON illisible ou mal formaté : 400
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> gererRequeteIllisible(
            HttpMessageNotReadableException e) {

        return ResponseEntity
                .badRequest()
                .body(Map.of(
                        "erreur",
                        "Le corps de la requête est invalide ou contient des valeurs mal formatées."
                ));
    }

    // Contraintes de validation des paramètres : 400
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, String>> gererViolationValidation(
            ConstraintViolationException e) {

        return ResponseEntity
                .badRequest()
                .body(Map.of(
                        "erreur",
                        "Une ou plusieurs contraintes de validation ne sont pas respectées."
                ));
    }

    // Conversion d'un paramètre invalide : 400
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, String>> gererTypeParametreInvalide(
            MethodArgumentTypeMismatchException e) {

        return ResponseEntity
                .badRequest()
                .body(Map.of(
                        "erreur",
                        "Le paramètre '" + e.getName() + "' possède un format invalide."
                ));
    }

    // Violation des contraintes de la base : 409
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> gererViolationIntegrite(
            DataIntegrityViolationException e) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "erreur",
                        "L'opération viole une contrainte de la base de données."
                ));
    }

    // Autres erreurs d'accès à la base : 500
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, String>> gererErreurBaseDonnees(
            DataAccessException e) {

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "erreur",
                        "Une erreur est survenue lors de l'accès à la base de données."
                ));
    }

    // Erreur d'authentification : 401
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, String>> gererErreurAuthentification(
            AuthenticationException e) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                        "erreur",
                        "Identifiants invalides ou session expirée."
                ));
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
