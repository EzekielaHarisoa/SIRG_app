package com.project.backend.conge.TrancheConge;


import com.project.backend.conge.soldeConge.SoldeCongeDTO;
import com.project.backend.employe.Employe;
import com.project.backend.employe.EmployeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.ArrayList;
@Service
public class TrancheCongeService {

    private final TrancheCongeRepository trancheCongeRepository;
    private final EmployeRepository employeRepository;

    public TrancheCongeService(
            TrancheCongeRepository trancheCongeRepository,
            EmployeRepository employeRepository) {

        this.trancheCongeRepository = trancheCongeRepository;
        this.employeRepository = employeRepository;
    }

    public void testerCalculAnniversaire(long numeroMatricule) {

        Employe employe = employeRepository.getemployeById(numeroMatricule);

        LocalDate resultat = calculerDernierAnniversaire(
                employe.getDateEmbauche()
        );

        System.out.println("Dernier anniversaire : " + resultat);
    }




    private LocalDate convertirEnLocalDate(Date date) {
        return new java.sql.Date(date.getTime()).toLocalDate();
    }


    public LocalDate calculerDernierAnniversaire(Date dateEmbauche) {

        if (dateEmbauche == null) {
            throw new IllegalArgumentException(
                    "La date d'embauche est obligatoire.");
        }

        LocalDate embauche = convertirEnLocalDate(dateEmbauche);
        LocalDate aujourdHui = LocalDate.now();

        if (aujourdHui.isBefore(embauche.plusYears(1))) {
            return null;
        }

        LocalDate dernierAnniversaire = embauche;

        while (!dernierAnniversaire.plusYears(1).isAfter(aujourdHui)) {
            dernierAnniversaire = dernierAnniversaire.plusYears(1);
        }

        return dernierAnniversaire;
    }

    private void creerTranche(long numeroMatricule, int anneeCycle, String typeTranche, LocalDate dateOuverture, int dureeValiditeMois) {

        if (trancheCongeRepository.existsTranche(
                numeroMatricule, anneeCycle, typeTranche)) {
            return;
        }

        LocalDate dateExpiration = dateOuverture.plusMonths(
                dureeValiditeMois
        );

        String statut = LocalDate.now().isBefore(dateExpiration)
                ? "ACTIVE"
                : "EXPIREE";

        TrancheConge tranche = new TrancheConge();

        tranche.setNumeroMatricule(numeroMatricule);
        tranche.setAnneeCycle(anneeCycle);
        tranche.setTypeTranche(typeTranche);
        tranche.setDateOuverture(dateOuverture);
        tranche.setDateExpiration(dateExpiration);
        tranche.setJoursAcquis(15);
        tranche.setStatut(statut);

        trancheCongeRepository.save(tranche);
    }

    public void initialiserTranches(long numeroMatricule) {

        Employe employe = employeRepository.getemployeById(numeroMatricule);

        LocalDate dateOuverture = calculerDernierAnniversaire(
                employe.getDateEmbauche()
        );

        if (dateOuverture == null) {
            throw new IllegalStateException(
                    "L'employé n'a pas encore atteint son premier anniversaire."
            );
        }

        int anneeCycle = dateOuverture.getYear();

        creerTranche(
                numeroMatricule,
                anneeCycle,
                "PREMIERE",
                dateOuverture,
                3
        );

        creerTranche(
                numeroMatricule,
                anneeCycle,
                "DEUXIEME",
                dateOuverture,
                36
        );
    }

    public List<TrancheCongeSoldeDTO> consulterTranches(long numeroMatricule) {

        List<TrancheConge> tranches = trancheCongeRepository.findByNumeroMatricule(numeroMatricule);

        List<TrancheCongeSoldeDTO> resultats = new ArrayList<>();

        for (TrancheConge tranche : tranches) {

            double joursConsommes = trancheCongeRepository.calculerJoursConsommes(tranche.getId());

            double joursRestants = 0;

            if ("ACTIVE".equals(tranche.getStatut())
                    && LocalDate.now().isBefore(tranche.getDateExpiration())) {

                joursRestants = Math.max(
                        0,
                        tranche.getJoursAcquis() - joursConsommes
                );
            }
            TrancheCongeSoldeDTO dto = new TrancheCongeSoldeDTO(
                    tranche.getId(),
                    tranche.getNumeroMatricule(),
                    tranche.getAnneeCycle(),
                    tranche.getTypeTranche(),
                    tranche.getDateOuverture(),
                    tranche.getDateExpiration(),
                    tranche.getJoursAcquis(),
                    joursConsommes,
                    joursRestants,
                    tranche.getStatut()
            );

            resultats.add(dto);
        }

        return resultats;
    }

    public SoldeCongeDTO calculerSoldeGlobal(long numeroMatricule) {

        List<TrancheCongeSoldeDTO> tranches = consulterTranches(numeroMatricule);

        double totalJoursAcquis = 0;
        double totalJoursConsommes = 0;
        double totalJoursRestants = 0;

        for (TrancheCongeSoldeDTO tranche : tranches) {

            totalJoursAcquis += tranche.getJoursAcquis();

            totalJoursConsommes += tranche.getJoursConsommes();

            totalJoursRestants += tranche.getJoursRestants();
        }

        return new SoldeCongeDTO(
                numeroMatricule,
                totalJoursAcquis,
                totalJoursConsommes,
                totalJoursRestants,
                tranches
        );
    }
}