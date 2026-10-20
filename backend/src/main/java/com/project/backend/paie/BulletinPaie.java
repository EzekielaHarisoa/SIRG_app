package com.project.backend.paie;

import java.math.BigDecimal;
import java.time.LocalDate;

public class BulletinPaie {


    public BigDecimal getTotalPrime() {
        return totalPrime;
    }

    public void setTotalPrime(BigDecimal totalPrime) {
        this.totalPrime = totalPrime;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getSalaireDeBase() {
        return salaireDeBase;
    }

    public void setSalaireDeBase(BigDecimal salaireDeBase) {
        this.salaireDeBase = salaireDeBase;
    }

    public LocalDate getDateEmission() {
        return dateEmission;
    }

    public void setDateEmission(LocalDate dateEmission) {
        this.dateEmission = dateEmission;
    }

    public BigDecimal getSalaireBrute() {
        return salaireBrute;
    }

    public void setSalaireBrute(BigDecimal salaireBrute) {
        this.salaireBrute = salaireBrute;
    }

    public BigDecimal getBaseIrsa() {
        return baseIrsa;
    }

    public void setBaseIrsa(BigDecimal baseIrsa) {
        this.baseIrsa = baseIrsa;
    }

    public BigDecimal getIrsa() {
        return irsa;
    }

    public void setIrsa(BigDecimal irsa) {
        this.irsa = irsa;
    }

    public BigDecimal getSalaireNet() {
        return salaireNet;
    }

    public void setSalaireNet(BigDecimal salaireNet) {
        this.salaireNet = salaireNet;
    }

    public BigDecimal getChargePatronal() {
        return chargePatronal;
    }

    public void setChargePatronal(BigDecimal chargePatronal) {
        this.chargePatronal = chargePatronal;
    }

    public BigDecimal getCoutGlobale() {
        return coutGlobale;
    }

    public void setCoutGlobale(BigDecimal coutGlobale) {
        this.coutGlobale = coutGlobale;
    }

    public BigDecimal getHeurTravaille() {
        return heurTravaille;
    }

    public void setHeurTravaille(BigDecimal heurTravaille) {
        this.heurTravaille = heurTravaille;
    }

    public BigDecimal getCongeRestant() {
        return congeRestant;
    }

    public void setCongeRestant(BigDecimal congeRestant) {
        this.congeRestant = congeRestant;
    }

    public Long getNumeroMatricule() {
        return numeroMatricule;
    }

    public void setNumeroMatricule(Long numeroMatricule) {
        this.numeroMatricule = numeroMatricule;
    }

    private Long id;
    private BigDecimal salaireDeBase;
    private LocalDate dateEmission;
    private BigDecimal totalPrime;
    private BigDecimal salaireBrute;
    private BigDecimal baseIrsa;
    private BigDecimal irsa;
    private BigDecimal salaireNet;
    private BigDecimal chargePatronal;
    private BigDecimal coutGlobale;
    private BigDecimal heurTravaille;
    private BigDecimal congeRestant;
    private Long numeroMatricule;

    public BulletinPaie() {
    }

    public BulletinPaie(Long id, BigDecimal salaireDeBase, LocalDate dateEmission, BigDecimal totalPrime, BigDecimal salaireBrute, BigDecimal baseIrsa, BigDecimal irsa, BigDecimal salaireNet, BigDecimal chargePatronal, BigDecimal coutGlobale, BigDecimal heurTravaille, BigDecimal congeRestant, Long numeroMatricule) {
        this.id = id;
        this.salaireDeBase = salaireDeBase;
        this.dateEmission = dateEmission;
        this.totalPrime = totalPrime;
        this.salaireBrute = salaireBrute;
        this.baseIrsa = baseIrsa;
        this.irsa = irsa;
        this.salaireNet = salaireNet;
        this.chargePatronal = chargePatronal;
        this.coutGlobale = coutGlobale;
        this.heurTravaille = heurTravaille;
        this.congeRestant = congeRestant;
        this.numeroMatricule = numeroMatricule;
    }

}