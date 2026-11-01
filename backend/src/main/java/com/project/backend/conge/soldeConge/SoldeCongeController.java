package com.project.backend.conge.soldeConge;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/soldeConge")
public class SoldeCongeController {

    private final SoldeCongeService soldeCongeService;

    public SoldeCongeController(SoldeCongeService soldeCongeService) {
        this.soldeCongeService = soldeCongeService;
    }

    @GetMapping("/{numeroMatricule}")
    public SoldeConge findByNumeroMatricule(@PathVariable long numeroMatricule){
        return soldeCongeService.findSoldeByNumeroMatricule(numeroMatricule);
    }
}