package com.project.backend.paie;

import java.math.BigDecimal;
import java.time.LocalDate;

public class EmployeFiche {

    private Long matricule;
    private String numeroSecuriteSociale;
    private LocalDate entreeLe;
    private String nomComplet;
    private String adresse;
    private String emploi;
    private String qualification;
    private BigDecimal coefficient;
    private BigDecimal plafondSecuriteSociale;
    private String typeContrat;

    public Long getMatricule() {
        return matricule;
    }

    public void setMatricule(Long matricule) {
        this.matricule = matricule;
    }

    public String getNumeroSecuriteSociale() {
        return numeroSecuriteSociale;
    }

    public void setNumeroSecuriteSociale(String numeroSecuriteSociale) {
        this.numeroSecuriteSociale = numeroSecuriteSociale;
    }

    public LocalDate getEntreeLe() {
        return entreeLe;
    }

    public void setEntreeLe(LocalDate entreeLe) {
        this.entreeLe = entreeLe;
    }

    public String getNomComplet() {
        return nomComplet;
    }

    public void setNomComplet(String nomComplet) {
        this.nomComplet = nomComplet;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getEmploi() {
        return emploi;
    }

    public void setEmploi(String emploi) {
        this.emploi = emploi;
    }

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public BigDecimal getCoefficient() {
        return coefficient;
    }

    public void setCoefficient(BigDecimal coefficient) {
        this.coefficient = coefficient;
    }

    public BigDecimal getPlafondSecuriteSociale() {
        return plafondSecuriteSociale;
    }

    public void setPlafondSecuriteSociale(BigDecimal plafondSecuriteSociale) {
        this.plafondSecuriteSociale = plafondSecuriteSociale;
    }

    public String getTypeContrat() {
        return typeContrat;
    }

    public void setTypeContrat(String typeContrat) {
        this.typeContrat = typeContrat;
    }
}
