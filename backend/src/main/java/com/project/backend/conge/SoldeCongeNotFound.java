package com.project.backend.conge;

public class SoldeCongeNotFound extends RuntimeException {
    public SoldeCongeNotFound(long numeroMatricule) {
        super("Aucun solde associe a cette numero matricule " + numeroMatricule);
    }
}
