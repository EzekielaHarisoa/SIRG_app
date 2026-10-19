package com.project.backend.employe;

import java.util.Date;

public class Employe {

    public long getNumerMatricule() {
        return numerMatricule;
    }

    public void setNumerMatricule(long numerMatricule) {
        this.numerMatricule = numerMatricule;
    }

    public String getNomEtPrenoms() {
        return nomEtPrenoms;
    }

    public void setNomEtPrenoms(String nomEtPrenoms) {
        this.nomEtPrenoms = nomEtPrenoms;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public Date getDateEmbauche() {
        return dateEmbauche;
    }

    public void setDateEmbauche(Date dateEmbauche) {
        this.dateEmbauche = dateEmbauche;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public Long getEntrepriseId() {
        return entrepriseId;
    }

    public void setEntrepriseId(Long entrepriseId) {
        this.entrepriseId = entrepriseId;
    }

    public Long getPosteId() {
        return posteId;
    }

    public void setPosteId(Long posteId) {
        this.posteId = posteId;
    }

    private long numerMatricule;
    private String nomEtPrenoms;
    private String telephone;
    private String adresse;
    private Date dateEmbauche;
    private Long entrepriseId;
    private Long posteId;

    public Employe() {}

    public Employe(String nomEtPrenoms, String telephone,String adresse, Date dateEmbauche, Long entrepriseId, Long posteId) {
        this.nomEtPrenoms = nomEtPrenoms;
        this.telephone = telephone;
        this.adresse = adresse;
        this.dateEmbauche = dateEmbauche;
        this.entrepriseId = entrepriseId;
        this.posteId = posteId;
    }
    public Employe(Long numerMatricule, String nomEtPrenoms, String telephone,String adresse, Date dateEmbauche, Long entrepriseId, Long posteId) {
        this.numerMatricule = numerMatricule;
        this.nomEtPrenoms = nomEtPrenoms;
        this.telephone = telephone;
        this.adresse = adresse;
        this.dateEmbauche = dateEmbauche;
        this.entrepriseId = entrepriseId;
        this.posteId = posteId;
    }
}
