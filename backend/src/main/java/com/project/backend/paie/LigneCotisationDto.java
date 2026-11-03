package com.project.backend.paie;

import java.math.BigDecimal;

public class LigneCotisationDto {

    private String famille;
    private String libelle;
    private BigDecimal base;
    private BigDecimal tauxSalarial;
    private BigDecimal cotisationSalariale;
    private BigDecimal tauxPatronal;
    private BigDecimal cotisationPatronale;
    private boolean estSection;
    private boolean estSousSection;
    private boolean estDetail;

    public String getFamille() {
        return famille;
    }

    public void setFamille(String famille) {
        this.famille = famille;
    }

    public String getLibelle() {
        return libelle;
    }

    public void setLibelle(String libelle) {
        this.libelle = libelle;
    }

    public BigDecimal getBase() {
        return base;
    }

    public void setBase(BigDecimal base) {
        this.base = base;
    }

    public BigDecimal getTauxSalarial() {
        return tauxSalarial;
    }

    public void setTauxSalarial(BigDecimal tauxSalarial) {
        this.tauxSalarial = tauxSalarial;
    }

    public BigDecimal getCotisationSalariale() {
        return cotisationSalariale;
    }

    public void setCotisationSalariale(BigDecimal cotisationSalariale) {
        this.cotisationSalariale = cotisationSalariale;
    }

    public BigDecimal getTauxPatronal() {
        return tauxPatronal;
    }

    public void setTauxPatronal(BigDecimal tauxPatronal) {
        this.tauxPatronal = tauxPatronal;
    }

    public BigDecimal getCotisationPatronale() {
        return cotisationPatronale;
    }

    public void setCotisationPatronale(BigDecimal cotisationPatronale) {
        this.cotisationPatronale = cotisationPatronale;
    }

    public boolean isEstSection() {
        return estSection;
    }

    public void setEstSection(boolean estSection) {
        this.estSection = estSection;
    }

    public boolean isEstSousSection() {
        return estSousSection;
    }

    public void setEstSousSection(boolean estSousSection) {
        this.estSousSection = estSousSection;
    }

    public boolean isEstDetail() {
        return estDetail;
    }

    public void setEstDetail(boolean estDetail) {
        this.estDetail = estDetail;
    }
}
