package com.project.backend.paie;

public class EntrepriseUsine {

    private String nom;
    private String adresse;
    private String siret;
    private String codeNaf;
    private String matriculeUrssaf;
    private String convention;

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getSiret() {
        return siret;
    }

    public void setSiret(String siret) {
        this.siret = siret;
    }

    public String getCodeNaf() {
        return codeNaf;
    }

    public void setCodeNaf(String codeNaf) {
        this.codeNaf = codeNaf;
    }

    public String getMatriculeUrssaf() {
        return matriculeUrssaf;
    }

    public void setMatriculeUrssaf(String matriculeUrssaf) {
        this.matriculeUrssaf = matriculeUrssaf;
    }

    public String getConvention() {
        return convention;
    }

    public void setConvention(String convention) {
        this.convention = convention;
    }
}
