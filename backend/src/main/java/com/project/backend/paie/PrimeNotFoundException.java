package com.project.backend.paie;

public class PrimeNotFoundException extends RuntimeException {

    public PrimeNotFoundException(Long id) {
        super("La prime introuvable avec l'identifiant : " + id);
    }
}
