package com.project.backend.conge.soldeConge;


import com.project.backend.conge.TrancheConge.TrancheCongeSoldeDTO;

import java.util.List;

public class SoldeCongeDTO {

    private Long numeroMatricule;
    private double totalJoursAcquis;
    private double totalJoursConsommes;
    private double totalJoursRestants;
    private List<TrancheCongeSoldeDTO> tranches;

    public SoldeCongeDTO(
            Long numeroMatricule,
            double totalJoursAcquis,
            double totalJoursConsommes,
            double totalJoursRestants,
            List<TrancheCongeSoldeDTO> tranches) {

        this.numeroMatricule = numeroMatricule;
        this.totalJoursAcquis = totalJoursAcquis;
        this.totalJoursConsommes = totalJoursConsommes;
        this.totalJoursRestants = totalJoursRestants;
        this.tranches = tranches;
    }

    public Long getNumeroMatricule() {
        return numeroMatricule;
    }

    public double getTotalJoursAcquis() {
        return totalJoursAcquis;
    }

    public double getTotalJoursConsommes() {
        return totalJoursConsommes;
    }

    public double getTotalJoursRestants() {
        return totalJoursRestants;
    }

    public List<TrancheCongeSoldeDTO> getTranches() {
        return tranches;
    }
}