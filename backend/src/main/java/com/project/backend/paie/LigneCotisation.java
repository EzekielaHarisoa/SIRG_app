package com.project.backend.paie;

import java.math.BigDecimal;

public class LigneCotisation {

    private Long id;
    private Long bulletinPaieId;
    private Long cotisationReglementId;
    private BigDecimal base;
    private BigDecimal cotisationSalariale;
    private BigDecimal cotisationPatronale;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBulletinPaieId() {
        return bulletinPaieId;
    }

    public void setBulletinPaieId(Long bulletinPaieId) {
        this.bulletinPaieId = bulletinPaieId;
    }

    public Long getCotisationReglementId() {
        return cotisationReglementId;
    }

    public void setCotisationReglementId(Long cotisationReglementId) {
        this.cotisationReglementId = cotisationReglementId;
    }

    public BigDecimal getBase() {
        return base;
    }

    public void setBase(BigDecimal base) {
        this.base = base;
    }

    public BigDecimal getCotisationSalariale() {
        return cotisationSalariale;
    }

    public void setCotisationSalariale(BigDecimal cotisationSalariale) {
        this.cotisationSalariale = cotisationSalariale;
    }

    public BigDecimal getCotisationPatronale() {
        return cotisationPatronale;
    }

    public void setCotisationPatronale(BigDecimal cotisationPatronale) {
        this.cotisationPatronale = cotisationPatronale;
    }
}
