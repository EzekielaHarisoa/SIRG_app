package com.project.backend.conge;

import java.time.LocalDate;

public class DemandeConge {

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMotif() {
        return motif;
    }

    public void setMotif(String motif) {
        this.motif = motif;
    }

    public String getTypeConge() {
        return typeConge;
    }

    public void setTypeConge(String typeConge) {
        this.typeConge = typeConge;
    }

    public LocalDate getDateDeDemande() {
        return dateDeDemande;
    }

    public void setDateDeDemande(LocalDate dateDeDemande) {
        this.dateDeDemande = dateDeDemande;
    }

    public LocalDate getDateDeDebut() {
        return dateDeDebut;
    }

    public void setDateDeDebut(LocalDate dateDeDebut) {
        this.dateDeDebut = dateDeDebut;
    }

    public LocalDate getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDate dateFin) {
        this.dateFin = dateFin;
    }

    public String getMotifRefus() {
        return motifRefus;
    }

    public void setMotifRefus(String motifRefus) {
        this.motifRefus = motifRefus;
    }

    public Long getNumeroMatricule() {
        return numeroMatricule;
    }

    public void setNumeroMatricule(Long numeroMatricule) {
        this.numeroMatricule = numeroMatricule;
    }

    private Long id;
    private String motif;
    private String status;
    private String typeConge;
    private LocalDate dateDeDemande;
    private LocalDate dateDeDebut;
    private LocalDate dateFin;
    private String motifRefus;
    private Long numeroMatricule;

    public DemandeConge() {
    }

    public DemandeConge(
            Long id,
            String motif,
            String status,
            String typeConge,
            LocalDate dateDeDemande,
            LocalDate dateDeDebut,
            LocalDate dateFin,
            String motifRefus,
            Long numeroMatricule) {

        this.id = id;
        this.motif = motif;
        this.status = status;
        this.typeConge = typeConge;
        this.dateDeDemande = dateDeDemande;
        this.dateDeDebut = dateDeDebut;
        this.dateFin = dateFin;
        this.motifRefus = motifRefus;
        this.numeroMatricule = numeroMatricule;
    }

}
