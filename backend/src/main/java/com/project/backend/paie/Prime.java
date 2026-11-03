package com.project.backend.paie;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public class Prime {

    private Long id;

    @NotBlank(message = "Le libellé est obligatoire")
    private String libelle;

    @NotNull(message = "Le montant est obligatoire")
    @Positive(message = "Le montant doit être supérieur à zéro")
    private BigDecimal montant;

    @NotNull(message = "Le numéro matricule est obligatoire")
    @Positive(message = "Le numéro matricule doit être supérieur à zéro")
    private Long numeroMatricule;

    private Long bulletinPaieId;

    public Prime() {
    }

    public Prime(Long id, String libelle, BigDecimal montant, Long numeroMatricule) {
        this.id = id;
        this.libelle = libelle;
        this.montant = montant;
        this.numeroMatricule = numeroMatricule;
    }

    public Prime(Long id, String libelle, BigDecimal montant, Long numeroMatricule, Long bulletinPaieId) {
        this.id = id;
        this.libelle = libelle;
        this.montant = montant;
        this.numeroMatricule = numeroMatricule;
        this.bulletinPaieId = bulletinPaieId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLibelle() {
        return libelle;
    }

    public void setLibelle(String libelle) {
        this.libelle = libelle;
    }

    public BigDecimal getMontant() {
        return montant;
    }

    public void setMontant(BigDecimal montant) {
        this.montant = montant;
    }

    public Long getNumeroMatricule() {
        return numeroMatricule;
    }

    public void setNumeroMatricule(Long numeroMatricule) {
        this.numeroMatricule = numeroMatricule;
    }

    public Long getBulletinPaieId() {
        return bulletinPaieId;
    }

    public void setBulletinPaieId(Long bulletinPaieId) {
        this.bulletinPaieId = bulletinPaieId;
    }
}
