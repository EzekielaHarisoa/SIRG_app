package com.project.backend.conge;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class SoldeCongeController {
    private final SoldeCongeService soldeCongeService;

    public SoldeCongeController(SoldeCongeService soldeCongeService) {
        this.soldeCongeService = soldeCongeService;
    }

    @GetMapping("/soldeConge/{numeroMatricule}")
    public List<SoldeConge> findByNumeroMatricule(@PathVariable long numeroMatricule){
        return soldeCongeService.findSoldeByNumeroMatricule(numeroMatricule);
    }

    @GetMapping("/soldeConge/{numeroMatricule}/{anne}")
    public SoldeConge findByNumeroMatricule(@PathVariable long numeroMatricule, @PathVariable int anne) {
        return soldeCongeService.findByNumeroMatriculeAndAnnee(numeroMatricule,anne);
    }

    @PostMapping("/soldeConge")
    public int save(@Valid @RequestBody SoldeConge soldeConge) {
        return soldeCongeService.save(soldeConge);
    }

    @PutMapping("/soldeConge")
    public int update(@Valid @RequestBody SoldeConge soldeConge) {
        return soldeCongeService.update(soldeConge);
    }
}
