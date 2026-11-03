package com.project.backend.paie;

import java.math.BigDecimal;

public class CotisationReglement {

    private Long id;
    private String famille;
    private String code;
    private String libelle;
    private boolean estSalariale;
    private BigDecimal tauxSalarial;
    private BigDecimal tauxPatronal;
    private String typeBase;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFamille() {
        return famille;
    }

    public void setFamille(String famille) {
        this.famille = famille;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getLibelle() {
        return libelle;
    }

    public void setLibelle(String libelle) {
        this.libelle = libelle;
    }

    public boolean isEstSalariale() {
        return estSalariale;
    }

    public void setEstSalariale(boolean estSalariale) {
        this.estSalariale = estSalariale;
    }

    public BigDecimal getTauxSalarial() {
        return tauxSalarial;
    }

    public void setTauxSalarial(BigDecimal tauxSalarial) {
        this.tauxSalarial = tauxSalarial;
    }

    public BigDecimal getTauxPatronal() {
        return tauxPatronal;
    }

    public void setTauxPatronal(BigDecimal tauxPatronal) {
        this.tauxPatronal = tauxPatronal;
    }

    public String getTypeBase() {
        return typeBase;
    }

    public void setTypeBase(String typeBase) {
        this.typeBase = typeBase;
    }
}
