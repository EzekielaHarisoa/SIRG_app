package com.project.backend.conge.TrancheConge;

import java.time.LocalDate;

public class TrancheConge {

    private Long id;
    private Long numeroMatricule;
    private Integer anneeCycle;
    private String typeTranche;
    private LocalDate dateOuverture;
    private LocalDate dateExpiration;
    private double joursAcquis;
    private String statut;

    public TrancheConge() {
    }

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

    public Integer getAnneeCycle() {
        return anneeCycle;
    }

    public void setAnneeCycle(Integer anneeCycle) {
        this.anneeCycle = anneeCycle;
    }

    public String getTypeTranche() {
        return typeTranche;
    }

    public void setTypeTranche(String typeTranche) {
        this.typeTranche = typeTranche;
    }

    public LocalDate getDateOuverture() {
        return dateOuverture;
    }

    public void setDateOuverture(LocalDate dateOuverture) {
        this.dateOuverture = dateOuverture;
    }

    public LocalDate getDateExpiration() {
        return dateExpiration;
    }

    public void setDateExpiration(LocalDate dateExpiration) {
        this.dateExpiration = dateExpiration;
    }

    public double getJoursAcquis() {
        return joursAcquis;
    }

    public void setJoursAcquis(double joursAcquis) {
        this.joursAcquis = joursAcquis;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }
}
