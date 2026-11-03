package com.project.backend.paie;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class FichePaie {

    private EntrepriseUsine entreprise;
    private EmployeFiche employe;
    private PeriodePaie periode;
    private BigDecimal salaireBrut;
    private BigDecimal salaireNet;
    private BigDecimal chargePatronale;
    private BigDecimal coutGlobal;
    private BigDecimal totalCotisationsSalariales;
    private BigDecimal totalCotisationsPatronales;
    private List<LigneCotisationDto> lignes;

    public EntrepriseUsine getEntreprise() {
        return entreprise;
    }

    public void setEntreprise(EntrepriseUsine entreprise) {
        this.entreprise = entreprise;
    }

    public EmployeFiche getEmploye() {
        return employe;
    }

    public void setEmploye(EmployeFiche employe) {
        this.employe = employe;
    }

    public PeriodePaie getPeriode() {
        return periode;
    }

    public void setPeriode(PeriodePaie periode) {
        this.periode = periode;
    }

    public BigDecimal getSalaireBrut() {
        return salaireBrut;
    }

    public void setSalaireBrut(BigDecimal salaireBrut) {
        this.salaireBrut = salaireBrut;
    }

    public BigDecimal getSalaireNet() {
        return salaireNet;
    }

    public void setSalaireNet(BigDecimal salaireNet) {
        this.salaireNet = salaireNet;
    }

    public BigDecimal getChargePatronale() {
        return chargePatronale;
    }

    public void setChargePatronale(BigDecimal chargePatronale) {
        this.chargePatronale = chargePatronale;
    }

    public BigDecimal getCoutGlobal() {
        return coutGlobal;
    }

    public void setCoutGlobal(BigDecimal coutGlobal) {
        this.coutGlobal = coutGlobal;
    }

    public BigDecimal getTotalCotisationsSalariales() {
        return totalCotisationsSalariales;
    }

    public void setTotalCotisationsSalariales(BigDecimal totalCotisationsSalariales) {
        this.totalCotisationsSalariales = totalCotisationsSalariales;
    }

    public BigDecimal getTotalCotisationsPatronales() {
        return totalCotisationsPatronales;
    }

    public void setTotalCotisationsPatronales(BigDecimal totalCotisationsPatronales) {
        this.totalCotisationsPatronales = totalCotisationsPatronales;
    }

    public List<LigneCotisationDto> getLignes() {
        return lignes;
    }

    public void setLignes(List<LigneCotisationDto> lignes) {
        this.lignes = lignes;
    }
}
