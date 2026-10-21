
package com.project.backend.paie;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.Map;
import java.util.stream.Collectors;
import java.util.List;

@RestController
@RequestMapping("/api/bulletins")
public class BulletinPaieController {

    private final BulletinPaieService bulletinPaieService;

    public BulletinPaieController(BulletinPaieService bulletinPaieService) {
        this.bulletinPaieService = bulletinPaieService;
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
            @PathVariable long numeroMatricule) {
        return bulletinPaieService.findByNumeroMatricule(numeroMatricule);
    }

    @PostMapping
    public int save(@RequestBody BulletinPaie bulletin) {
        return bulletinPaieService.save(bulletin);
    }

    @GetMapping("/{id}/totalPrimes")
    public java.math.BigDecimal calculerTotalPrime(@PathVariable long id) {
        return bulletinPaieService.calculerTotalPrime(id);
    }

    @PutMapping("/{id}/totalPrimes")
    public java.math.BigDecimal recalculerTotalPrime(@PathVariable long id) {
        return bulletinPaieService.recalculerTotalPrime(id);
    }

    @GetMapping("/{id}/salaireBrut")
    public java.math.BigDecimal calculerSalaireBrut(@PathVariable long id) {
        return bulletinPaieService.calculerSalaireBrut(id);
    }

    @PutMapping("/{id}/salaireBrut")
    public java.math.BigDecimal recalculerSalaireBrut(@PathVariable long id) {
        return bulletinPaieService.recalculerSalaireBrut(id);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> gererErreursValidation(MethodArgumentNotValidException exception) {

        String erreurs = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(erreur ->
                        erreur.getField() + " : " + erreur.getDefaultMessage())
                .collect(Collectors.joining("; "));

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("erreur", erreurs));
    }

}
