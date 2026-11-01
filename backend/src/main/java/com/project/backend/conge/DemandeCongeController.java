
package com.project.backend.conge;

import com.project.backend.conge.DTO.DecisionDemandeCongeDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/demandeConge")
@Validated
public class DemandeCongeController {

    private final DemandeCongeService demandeCongeService;

    public DemandeCongeController(
            DemandeCongeService demandeCongeService
    ) {
        this.demandeCongeService = demandeCongeService;
    }


    //Récupérer toutes les demandes de congé.

    @GetMapping
    public List<DemandeConge> findAllDemandeConge() {
        return demandeCongeService.findAllDemandeConge();
    }


    // récupérer une demande par son identifiant.
    @GetMapping("/byId/{id}")
    public DemandeConge findById(
            @PathVariable @Positive(message = "L'identifiant doit être positif.") long id
    ) {
        return demandeCongeService.findById(id);
    }

    //recuperer les demandes par matricule
    @GetMapping("/employe/{numeroMatricule}")
    public List<DemandeConge> findByNumeroMatricule(
            @PathVariable
            @Positive(message = "Le numéro matricule doit être positif.")
            long numeroMatricule
    ) {
        return demandeCongeService.findByNumeroMatricule(
                numeroMatricule
        );
    }

    //creer une nouvelle demande
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public int save(@Valid @RequestBody DemandeConge demandeConge) {
        return demandeCongeService.save(demandeConge);
    }

    //refuser une demand
    @PatchMapping("/{id}/refus")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void refuserDemande(
            @PathVariable
            @Positive(message = "L'identifiant doit être positif.")
            long id,

            @Valid @RequestBody
            DecisionDemandeCongeDTO decision
    ) {
        demandeCongeService.refuserDemande(
                id,
                decision.motifRefus()
        );
    }

    @PatchMapping("/{id}/acceptation")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void accepterDemande(
            @PathVariable
            @Positive(message = "L'identifiant doit être positif.")
            long id
    ) {
        demandeCongeService.accepterDemande(id);
    }
}
