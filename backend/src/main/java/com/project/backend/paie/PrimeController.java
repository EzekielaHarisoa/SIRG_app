package com.project.backend.paie;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/primes")
public class PrimeController {

    private final PrimeService primeService;

    public PrimeController(PrimeService primeService) {
        this.primeService = primeService;
    }

    @GetMapping
    public List<Prime> findAll() {
        return primeService.findAll();
    }

    @GetMapping("/employe/{numeroMatricule}")
    public List<Prime> findByNumeroMatricule(
            @PathVariable Long numeroMatricule
    ) {
        return primeService.findByNumeroMatricule(numeroMatricule);
    }

    @GetMapping("/bulletin/{bulletinPaieId}")
    public List<Prime> findByBulletinPaieId(
            @PathVariable Long bulletinPaieId
    ) {
        return primeService.findByBulletinPaieId(bulletinPaieId);
    }

    @GetMapping("/{id}")
    public Prime findById(@PathVariable Long id) {
        return primeService.findById(id);
    }

    @PostMapping
    public ResponseEntity<Object> save(@Valid @RequestBody Prime prime) {
        Prime created = primeService.save(prime);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "id", created.getId(),
                        "message", "La prime a été créée avec succès"
                ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> update(
            @PathVariable Long id,
            @Valid @RequestBody Prime prime
    ) {
        prime.setId(id);
        Prime updated = primeService.update(prime);
        return ResponseEntity.ok(Map.of(
                "id", updated.getId(),
                "message", "La prime a été modifiée avec succès"
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable Long id) {
        Integer deleted = primeService.delete(id);
        return ResponseEntity.ok(Map.of(
                "id", id,
                "message", "La prime a été supprimée avec succès"
        ));
    }

    @PostMapping("/{id}/associer/{bulletinPaieId}")
    public ResponseEntity<Object> associerAuBulletin(
            @PathVariable Long id,
            @PathVariable Long bulletinPaieId
    ) {
        Prime prime = primeService.findById(id);
        Prime associée = primeService.associerAuBulletin(prime, bulletinPaieId);
        return ResponseEntity.ok(Map.of(
                "id", associée.getId(),
                "message", "La prime a été associée au bulletin avec succès"
        ));
    }

    @DeleteMapping("/{id}/desassocier")
    public ResponseEntity<Object> desassocierDeBulletin(
            @PathVariable Long id
    ) {
        Prime prime = primeService.findById(id);
        Prime désassociée = primeService.desassocierDeBulletin(prime);
        return ResponseEntity.ok(Map.of(
                "id", désassociée.getId(),
                "message", "La prime a été désassociée du bulletin avec succès"
        ));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> gererErreursValidation(
            IllegalArgumentException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("erreur", exception.getMessage()));
    }

    @ExceptionHandler(PrimeNotFoundException.class)
    public ResponseEntity<Map<String, String>> gererErreurPrimeInexistante(
            PrimeNotFoundException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("erreur", exception.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> gererErreurEtat(
            IllegalStateException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of("erreur", exception.getMessage()));
    }
}
