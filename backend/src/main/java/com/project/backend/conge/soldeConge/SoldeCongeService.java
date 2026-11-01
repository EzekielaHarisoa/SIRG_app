package com.project.backend.conge.soldeConge;

import org.springframework.stereotype.Service;

@Service
public class SoldeCongeService {

    private final SoldeCongeRepository soldeCongeRepository;

    public SoldeCongeService(SoldeCongeRepository soldeCongeRepository) {
        this.soldeCongeRepository = soldeCongeRepository;
    }


    public SoldeConge findSoldeByNumeroMatricule(long numeroMatricule) {

        if (numeroMatricule <= 0) {
            throw new IllegalArgumentException(
                    "Le numéro de matricule doit être positif."
            );
        }

        return soldeCongeRepository
                .findByNumeroMatricule(numeroMatricule)
                .orElseThrow(
                        () -> new SoldeCongeNotFound(numeroMatricule)
                );
    }
}