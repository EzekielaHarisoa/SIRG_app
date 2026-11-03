package com.project.backend.paie;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bulletins")
public class BulletinPaieController {

    private final BulletinPaieService bulletinPaieService;
    private final FichePaieService fichePaieService;

    public BulletinPaieController(BulletinPaieService bulletinPaieService,
                                 FichePaieService fichePaieService) {
        this.bulletinPaieService = bulletinPaieService;
        this.fichePaieService = fichePaieService;
    }

    @GetMapping
    public List<BulletinPaie> findAll() {
        return bulletinPaieService.findAll();
    }

    @GetMapping("/{id}")
    public BulletinPaie findById(@PathVariable long id) {
        return bulletinPaieService.findById(id);
    }

    @GetMapping("/employe/{numeroMatricule}")
    public List<BulletinPaie> findByNumeroMatricule(
            @PathVariable long numeroMatricule
    ) {
        return bulletinPaieService.findByNumeroMatricule(numeroMatricule);
    }

    /**
     * Salaire de base prévu par le poste de l'employé : sert à préremplir le
     * formulaire de génération du bulletin.
     */
    @GetMapping("/employe/{numeroMatricule}/salaire")
    public ResponseEntity<Object> salaireDuPoste(@PathVariable long numeroMatricule) {
        Map<String, Object> poste = bulletinPaieService.salaireDuPoste(numeroMatricule);
        if (poste == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Aucun poste n'est associé à l'employé " + numeroMatricule));
        }
        return ResponseEntity.ok(poste);
    }

    /** Génération du bulletin de paie d'un employé pour un mois donné. */
    @PostMapping("/generer")
    public ResponseEntity<BulletinPaie> generer(@RequestBody GenerationBulletinRequest demande) {
        if (demande == null) {
            throw new IllegalArgumentException("Les données du bulletin sont obligatoires");
        }
        BulletinPaie bulletin = bulletinPaieService.generer(demande);
        return ResponseEntity.status(HttpStatus.CREATED).body(bulletin);
    }

    @PostMapping
    public long save(@Valid @RequestBody BulletinPaie bulletin) {
        return bulletinPaieService.save(bulletin);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> update(@PathVariable long id, @Valid @RequestBody BulletinPaie bulletin) {
        bulletin.setId(id);
        int updated = bulletinPaieService.update(bulletin);
        if (updated == 0) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("message", "Bulletin mis à jour avec succès"));
    }

    @PutMapping("/{id}/toutesLesValeurs")
    public ResponseEntity<Object> recalculerToutesLesValeurs(@PathVariable long id) {
        BulletinPaie updated = bulletinPaieService.recalculerToutesLesValeurs(id);
        return ResponseEntity.ok(Map.of(
                "id", updated.getId(),
                "message", "Toutes les valeurs ont été recalculées avec succès",
                "salaireBrute", updated.getSalaireBrute(),
                "baseIrsa", updated.getBaseIrsa(),
                "irsa", updated.getIrsa(),
                "salaireNet", updated.getSalaireNet(),
                "chargePatronal", updated.getChargePatronal(),
                "coutGlobale", updated.getCoutGlobale()
        ));
    }

    @GetMapping("/{id}/totalPrimes")
    public ResponseEntity<Object> calculerTotalPrime(@PathVariable long id) {
        BigDecimal totalPrime = bulletinPaieService.calculerTotalPrime(id);
        return ResponseEntity.ok(Map.of(
                "id", id,
                "totalPrime", totalPrime,
                "message", "Total des primes calculé avec succès"
        ));
    }

    @PutMapping("/{id}/totalPrimes")
    public ResponseEntity<Object> recalculerTotalPrime(@PathVariable long id) {
        BigDecimal totalPrime = bulletinPaieService.recalculerTotalPrime(id);
        return ResponseEntity.ok(Map.of(
                "id", id,
                "totalPrime", totalPrime,
                "message", "Total des primes recalculé avec succès"
        ));
    }

    @GetMapping("/{id}/salaireBrut")
    public ResponseEntity<Object> calculerSalaireBrut(@PathVariable long id) {
        BigDecimal salaireBrute = bulletinPaieService.calculerSalaireBrut(id);
        return ResponseEntity.ok(Map.of(
                "id", id,
                "salaireBrute", salaireBrute,
                "message", "Salaire brut calculé avec succès"
        ));
    }

    @PutMapping("/{id}/salaireBrut")
    public ResponseEntity<Object> recalculerSalaireBrut(@PathVariable long id) {
        bulletinPaieService.recalculerSalaireBrut(id);
        return ResponseEntity.ok(Map.of(
                "id", id,
                "message", "Salaire brut recalculé avec succès"
        ));
    }

    @GetMapping("/{id}/fiche")
    public ResponseEntity<FichePaie> genererFiche(@PathVariable long id) {
        FichePaie fiche = fichePaieService.generer(id);
        return ResponseEntity.ok(fiche);
    }

    /** Règle métier non respectée (données invalides, bulletin déjà généré…). */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> gererDemandeInvalide(IllegalArgumentException exception) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(BulletinPaieNotFoundException.class)
    public ResponseEntity<Map<String, String>> gererBulletinIntrouvable(BulletinPaieNotFoundException exception) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> gererErreurs(
            Exception exception
    ) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("erreur", "Erreur interne : " + exception.getMessage()));
    }
}
