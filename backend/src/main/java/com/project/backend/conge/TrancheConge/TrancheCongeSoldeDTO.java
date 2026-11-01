package com.project.backend.conge.TrancheConge;

import java.time.LocalDate;

public class TrancheCongeSoldeDTO {

    private Long id;
    private Long numeroMatricule;
    private Integer anneeCycle;
    private String typeTranche;
    private LocalDate dateOuverture;
    private LocalDate dateExpiration;
    private double joursAcquis;
    private double joursConsommes;
    private double joursRestants;
    private String statut;

    public TrancheCongeSoldeDTO(
            Long id,
            Long numeroMatricule,
            Integer anneeCycle,
            String typeTranche,
            LocalDate dateOuverture,
            LocalDate dateExpiration,
            double joursAcquis,
            double joursConsommes,
            double joursRestants,
            String statut) {

        this.id = id;
        this.numeroMatricule = numeroMatricule;
        this.anneeCycle = anneeCycle;
        this.typeTranche = typeTranche;
        this.dateOuverture = dateOuverture;
        this.dateExpiration = dateExpiration;
        this.joursAcquis = joursAcquis;
        this.joursConsommes = joursConsommes;
        this.joursRestants = joursRestants;
        this.statut = statut;
    }

    public Long getId() { return id; }
    public Long getNumeroMatricule() { return numeroMatricule; }
    public Integer getAnneeCycle() { return anneeCycle; }
    public String getTypeTranche() { return typeTranche; }
    public LocalDate getDateOuverture() { return dateOuverture; }
    public LocalDate getDateExpiration() { return dateExpiration; }
    public double getJoursAcquis() { return joursAcquis; }
    public double getJoursConsommes() { return joursConsommes; }
    public double getJoursRestants() { return joursRestants; }
    public String getStatut() { return statut; }
}