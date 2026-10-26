
package com.project.backend.conge;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class SoldeCongeService {

    private final SoldeCongeRepository soldeCongeRepository;

    public SoldeCongeService(SoldeCongeRepository soldeCongeRepository) {
        this.soldeCongeRepository = soldeCongeRepository;
    }

    public List<SoldeConge> findSoldeByNumeroMatricule(
            long numeroMatricule) {

        if (numeroMatricule <= 0) {
            throw new IllegalArgumentException("Le numéro de matricule doit être positif.");
        }

        return soldeCongeRepository.findByNumeroMatricule(numeroMatricule);
    }


    public SoldeConge findByNumeroMatriculeAndAnnee(
            long numeroMatricule, int annee) {

        if (numeroMatricule <= 0) {
            throw new IllegalArgumentException(
                    "Le numéro de matricule doit être positif."
            );
        }

        if (annee < 1900 || annee > 9999) {
            throw new IllegalArgumentException(
                    "L'année doit être comprise entre 1900 et 9999."
            );
        }

        return soldeCongeRepository
                .getSoldeByNumeroMatriculeAndAnnee(numeroMatricule, annee)
                .orElseThrow(() -> new SoldeCongeNotFound(numeroMatricule));
    }

    @Transactional
    public int save(SoldeConge soldeConge) {
        if (soldeConge == null) {
            throw new IllegalArgumentException(
                    "Le solde de congé est obligatoire."
            );
        }

        if (soldeCongeRepository.existsByNumeroMatriculeAndAnnee(
                soldeConge.getNumeroMatricule(),
                soldeConge.getAnnee())) {
            throw new IllegalArgumentException(
                    "Un solde existe déjà pour cet employé et cette année."
            );
        }

        calculerSolde(soldeConge);

        return soldeCongeRepository.save(soldeConge);
    }
    @Transactional
    public int update(SoldeConge soldeConge) {

        if (soldeConge == null) {
            throw new IllegalArgumentException(
                    "Le solde de congé est obligatoire."
            );
        }

        calculerSolde(soldeConge);

        int lignesModifiees =
                soldeCongeRepository.update(soldeConge);

        if (lignesModifiees == 0) {
            throw new SoldeCongeNotFound(
                    soldeConge.getNumeroMatricule()
            );
        }

        return lignesModifiees;
    }


    private BigDecimal calculerJoursAcquis(
            LocalDate dateEmbauche, int annee) {

        LocalDate aujourdHui = LocalDate.now();

        if (annee > aujourdHui.getYear()) {
            return BigDecimal.ZERO;
        }

        LocalDate debutAnnee = LocalDate.of(annee, 1, 1);
        LocalDate finAnnee = LocalDate.of(annee, 12, 31);

        if (dateEmbauche.isAfter(finAnnee)) {
            return BigDecimal.ZERO;
        }

        LocalDate dateLimite = finAnnee.isBefore(aujourdHui)
                ? finAnnee
                : aujourdHui.withDayOfMonth(
                1
        ).minusDays(1);

        if (dateLimite.isBefore(debutAnnee)) {
            return BigDecimal.ZERO;
        }

        int moisAcquis = 0;

        LocalDate premierJour = debutAnnee;

        for (int mois = 1; mois <= 12; mois++) {
            YearMonth periode = YearMonth.of(annee, mois);
            LocalDate finMois = periode.atEndOfMonth();

            if (finMois.isAfter(dateLimite)) {
                continue;
            }

            if (!finMois.isBefore(dateEmbauche)
                    && !finMois.isBefore(premierJour)) {
                moisAcquis++;
            }
        }

        return BigDecimal.valueOf(moisAcquis)
                .multiply(new BigDecimal("2.5"));
    }

    private void calculerSolde(SoldeConge soldeConge) {

        LocalDate dateEmbauche = soldeCongeRepository.findDateEmbauche(soldeConge.getNumeroMatricule());

        BigDecimal joursAcquis = calculerJoursAcquis(
                dateEmbauche,
                soldeConge.getAnnee()
        );

        BigDecimal joursPris = soldeCongeRepository.calculerJoursPris(
                        soldeConge.getNumeroMatricule(),
                        soldeConge.getAnnee()
                );

        BigDecimal soldeRestant = soldeConge.getSoldeInitial()
                        .add(joursAcquis)
                        .subtract(joursPris);

        if (soldeRestant.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "Les jours de congé pris dépassent le solde disponible."
            );
        }

        soldeConge.setJoursAcquis(joursAcquis);
        soldeConge.setJoursPris(joursPris);
        soldeConge.setSoldeRestant(soldeRestant);
    }



}
