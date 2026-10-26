
package com.project.backend.conge;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public class SoldeConge {

    private Long id;

//    @Positive(message = "Le matricule doit être positif")
    private Long numeroMatricule;

    @Min(value = 1900, message = "L'année minimale est 1900")
    @Max(value = 9999, message = "L'année maximale est 9999")
    private int annee;

    @NotNull(message = "Le solde initial est obligatoire")
    @PositiveOrZero(message = "Le solde initial ne peut pas être négatif")
    private BigDecimal soldeInitial;

//    @NotNull(message = "Les jours acquis sont obligatoires")
    @PositiveOrZero(message = "Les jours acquis ne peuvent pas être négatifs")
    private BigDecimal joursAcquis;

//    @NotNull(message = "Les jours pris sont obligatoires")
    @PositiveOrZero(message = "Les jours pris ne peuvent pas être négatifs")
    private BigDecimal joursPris;

//    @NotNull(message = "Le solde restant est obligatoire")
    @PositiveOrZero(message = "Le solde restant ne peut pas être négatif")
    private BigDecimal soldeRestant;

    public SoldeConge() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getNumeroMatricule() {
        return numeroMatricule;
    }

    public void setNumeroMatricule(Long numeroMatricule) {
        this.numeroMatricule = numeroMatricule;
    }

    public int getAnnee() {
        return annee;
    }

    public void setAnnee(int annee) {
        this.annee = annee;
    }

    public BigDecimal getSoldeInitial() {
        return soldeInitial;
    }

    public void setSoldeInitial(BigDecimal soldeInitial) {
        this.soldeInitial = soldeInitial;
    }

    public BigDecimal getJoursAcquis() {
        return joursAcquis;
    }

    public void setJoursAcquis(BigDecimal joursAcquis) {
        this.joursAcquis = joursAcquis;
    }

    public BigDecimal getJoursPris() {
        return joursPris;
    }

    public void setJoursPris(BigDecimal joursPris) {
        this.joursPris = joursPris;
    }

    public BigDecimal getSoldeRestant() {
        return soldeRestant;
    }

    public void setSoldeRestant(BigDecimal soldeRestant) {
        this.soldeRestant = soldeRestant;
    }
}
