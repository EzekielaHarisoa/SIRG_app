package com.project.backend.pointage;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.PastOrPresent;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class Pointage {

    private Long id;

    private LocalDateTime heureEntree;

    private LocalDateTime heureSortie;

    @NotNull(message = "La date du pointage est obligatoire.")
    @PastOrPresent(message = "La date du pointage ne peut pas être dans le futur.")
    private LocalDate datePointage;

    @NotNull(message = "Les heures supplémentaires sont obligatoires.")
    @DecimalMin(value = "0.0", message = "Les heures supplémentaires doivent être positives ou nulles.")
    private BigDecimal heureSup;

    @NotNull(message = "Le nombre de minutes de retard est obligatoire.")
    @PositiveOrZero(message = "Le retard ne peut pas être négatif.")
    private Integer retardMinute;

    @NotNull(message = "Le numéro de matricule est obligatoire.")
    @Positive(message = "Le numéro de matricule doit être positif.")
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