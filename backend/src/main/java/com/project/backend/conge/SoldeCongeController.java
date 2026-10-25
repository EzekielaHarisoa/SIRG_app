package com.project.backend.conge;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SoldeCongeController {
    private final SoldeCongeService soldeCongeService;

    public SoldeCongeController(SoldeCongeService soldeCongeService) {
        this.soldeCongeService = soldeCongeService;
    }

    @GetMapping("/soldeConge/{numeroMatricule}")
    public SoldeConge findByNumeroMatricule(@PathVariable long numeroMatricule) {
        return soldeCongeService.findByNumeroMatricule(numeroMatricule);
    }

    @PostMapping("/soldeconge")
    public int save(SoldeConge soldeConge) {
        return soldeCongeService.save(soldeConge);
    }
}
