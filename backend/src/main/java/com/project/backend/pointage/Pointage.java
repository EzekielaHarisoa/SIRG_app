
package com.project.backend.pointage;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class Pointage {

    private Long id;
    private LocalDateTime heureEntree;
    private LocalDateTime heureSortie;
    private LocalDate datePointage;
    private BigDecimal heureSup;
    private Integer retardMinute;
    private Long numeroMatricule;

    public Pointage() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getHeureEntree() {
        return heureEntree;
    }

    public void setHeureEntree(LocalDateTime heureEntree) {
        this.heureEntree = heureEntree;
    }

    public LocalDateTime getHeureSortie() {
        return heureSortie;
    }

    public void setHeureSortie(LocalDateTime heureSortie) {
        this.heureSortie = heureSortie;
    }

    public LocalDate getDatePointage() {
        return datePointage;
    }

    public void setDatePointage(LocalDate datePointage) {
        this.datePointage = datePointage;
    }

    public BigDecimal getHeureSup() {
        return heureSup;
    }

    public void setHeureSup(BigDecimal heureSup) {
        this.heureSup = heureSup;
    }

    public Integer getRetardMinute() {
        return retardMinute;
    }

    public void setRetardMinute(Integer retardMinute) {
        this.retardMinute = retardMinute;
    }

    public Long getNumeroMatricule() {
        return numeroMatricule;
    }

    public void setNumeroMatricule(Long numeroMatricule) {
        this.numeroMatricule = numeroMatricule;
    }
}
