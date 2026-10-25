package com.project.backend.conge;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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
    public DemandeConge findById(@PathVariable long id) {
        return demandeCongeService.findById(id);
    }

    @GetMapping("/demandeConge/employe/{numeroMatricule}")
    public List<DemandeConge> findByNumeroMatricule(@PathVariable long numeroMatricule) {
        return demandeCongeService.findByNumeroMatricule(numeroMatricule);
    }

    @PostMapping("/demandeConge")
    @ResponseStatus(HttpStatus.CREATED)
    public int save(@Valid @RequestBody DemandeConge demandeConge) {
        return demandeCongeService.save(demandeConge);
    }

}
