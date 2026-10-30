
package com.project.backend.pointage.evenement;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/pointages/evenements")
public class PointageEvenementController {

    private final PointageEvenementService evenementService;

    public PointageEvenementController(PointageEvenementService evenementService) {
        this.evenementService = evenementService;
    }

    @PostMapping("/{numeroMatricule}")
    public ResponseEntity<PointageEvenement> enregistrerEvenement(@PathVariable Long numeroMatricule, @RequestParam TypeEvenement type) {
        PointageEvenement evenement = evenementService.enregistrerEvenement(numeroMatricule, type);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(evenement);
    }

    @GetMapping("/{numeroMatricule}/date/{date}")
    public ResponseEntity<List<PointageEvenement>> consulterHistorique(
            @PathVariable Long numeroMatricule,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date
    ) {
        List<PointageEvenement> historique =
                evenementService.consulterHistorique(
                        numeroMatricule,
                        date
                );

        return ResponseEntity.ok(historique);
    }
}
