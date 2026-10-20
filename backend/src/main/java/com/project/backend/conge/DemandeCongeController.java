package com.project.backend.conge;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class DemandeCongeController {

    private final DemandeCongeService demandeCongeService;

    public DemandeCongeController(DemandeCongeService demandeCongeService) {
        this.demandeCongeService = demandeCongeService;
    }

    @GetMapping("/demandeConge")
    public List<DemandeConge> findAllDemandeConge() {
        return demandeCongeService.findAllDemandeConge();
    }

    @GetMapping("/demandeConge/byId/{id}")
    public List<DemandeConge> findById(@PathVariable long id) {
        return demandeCongeService.findById(id);
    }

    @GetMapping("/demandeConge/employe/{numeroMatricule}")
    public List<DemandeConge> findByNumeroMatricule(@PathVariable long numeroMatricule) {
        return demandeCongeService.findByNumeroMatricule(numeroMatricule);
    }

    @PostMapping("/demandeConge")
    public int save(@RequestBody DemandeConge demandeConge) {
        return demandeCongeService.save(demandeConge);
    }

}
