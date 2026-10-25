package com.project.backend.conge;

public class SoldeCongeService {
    private final SoldeCongeRepository soldeCongeRepository;

    public SoldeCongeService(SoldeCongeRepository soldeCongeRepository) {
        this.soldeCongeRepository = soldeCongeRepository;
    }

    public SoldeConge findByNumeroMatricule(long numeroMatricule) {
        return soldeCongeRepository.getSoldeByNumeroMatricule(numeroMatricule);
    }

    public int save(SoldeConge soldeConge) {
        return soldeCongeRepository.calculeSoldeConge(soldeConge);
    }

}
