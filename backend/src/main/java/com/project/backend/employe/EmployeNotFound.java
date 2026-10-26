package com.project.backend.employe;

public class EmployeNotFound extends RuntimeException {

    public EmployeNotFound(long numerimatricule) {
        super("Employe introuvable avec le numeroMatricule " + numerimatricule);
    }


}
