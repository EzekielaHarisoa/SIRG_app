package com.project.backend.paie;

public class BulletinPaieNotFoundException extends RuntimeException{
    public BulletinPaieNotFoundException(long id) {
        super("\"Bulletin de paie introuvable avec l'identifiant : \" " + id);
    }
}
