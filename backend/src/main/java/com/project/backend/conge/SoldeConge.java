
package com.project.backend.conge;

import java.math.BigDecimal;

public class SoldeConge {

    private Long id;
    private Long numeroMatricule;
    private int annee;
    private BigDecimal soldeInitial;
    private BigDecimal joursAcquis;
    private BigDecimal joursPris;
    private BigDecimal soldeRestant;

    public SoldeConge() {
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
