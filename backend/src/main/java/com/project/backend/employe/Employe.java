
package com.project.backend.employe;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.Date;

public class Employe {

    private long numerMatricule;

    @NotBlank(message = "Le nom complet est obligatoire")
    private String nomEtPrenoms;

    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    private String telephone;

    @NotBlank(message = "L'adresse est obligatoire")
    private String adresse;

    @NotNull(message = "La date d'embauche est obligatoire")
    private Date dateEmbauche;

    @NotNull(message = "L'identifiant de l'entreprise est obligatoire")
    @Positive(message = "L'identifiant de l'entreprise doit être positif")
    private Long entrepriseId;

    @NotNull(message = "L'identifiant du poste est obligatoire")
    @Positive(message = "L'identifiant du poste doit être positif")
    private Long posteId;

    public Employe() {
    }

    public Employe(String nomEtPrenoms, String telephone,
                   String adresse, Date dateEmbauche,
                   Long entrepriseId, Long posteId) {
        this.nomEtPrenoms = nomEtPrenoms;
        this.telephone = telephone;
        this.adresse = adresse;
        this.dateEmbauche = dateEmbauche;
        this.entrepriseId = entrepriseId;
        this.posteId = posteId;
    }

    public Employe(Long numerMatricule, String nomEtPrenoms,
                   String telephone, String adresse,
                   Date dateEmbauche, Long entrepriseId, Long posteId) {
        this.numerMatricule = numerMatricule;
        this.nomEtPrenoms = nomEtPrenoms;
        this.telephone = telephone;
        this.adresse = adresse;
        this.dateEmbauche = dateEmbauche;
        this.entrepriseId = entrepriseId;
        this.posteId = posteId;
    }

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
}
