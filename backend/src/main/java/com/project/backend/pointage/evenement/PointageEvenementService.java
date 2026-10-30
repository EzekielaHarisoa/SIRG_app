
package com.project.backend.pointage.evenement;

import com.project.backend.pointage.Pointage;
import com.project.backend.pointage.PointageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class PointageEvenementService {

    private final PointageRepository pointageRepository;
    private final PointageEvenementRepository evenementRepository;

    private static final LocalTime HEURE_ENTREE_OFFICIELLE =
            LocalTime.of(8, 0);

    private static final long DUREE_NORMALE_MINUTES = 8 * 60;

    public PointageEvenementService(
            PointageRepository pointageRepository,
            PointageEvenementRepository evenementRepository
    ) {
        this.pointageRepository = pointageRepository;
        this.evenementRepository = evenementRepository;
    }

    @Transactional
    public PointageEvenement enregistrerEvenement(
            Long numeroMatricule,
            TypeEvenement typeEvenement
    ) {
        if (numeroMatricule == null || numeroMatricule <= 0) {
            throw new IllegalArgumentException(
                    "Numéro de matricule invalide."
            );
        }

        if (typeEvenement == null) {
            throw new IllegalArgumentException(
                    "Le type d'événement est obligatoire."
            );
        }

        LocalDateTime maintenant = LocalDateTime.now();
        LocalDate date = maintenant.toLocalDate();

        Pointage pointage = pointageRepository
                .findByMatriculeAndDate(numeroMatricule, date)
                .orElse(null);

        if (pointage == null) {
            if (typeEvenement != TypeEvenement.ENTREE) {
                throw new IllegalStateException(
                        "Le premier événement de la journée doit être une entrée."
                );
            }

            pointage = pointageRepository.creerPointageJournalier(
                    numeroMatricule,
                    maintenant
            );
        }

        List<PointageEvenement> evenements =
                evenementRepository.findByPointageId(pointage.getId());

        if (evenements.isEmpty()
                && pointage.getHeureEntree() != null
                && !pointage.getHeureEntree().equals(maintenant)) {
            throw new IllegalStateException(
                    "Un pointage existe déjà pour cette journée, "
                            + "mais aucun événement n'est associé."
            );
        }

        PointageEvenement dernierEvenement = evenements.isEmpty()
                ? null
                : evenements.get(evenements.size() - 1);

        verifierChronologie(dernierEvenement, maintenant);

        verifierTransition(
                dernierEvenement == null
                        ? null
                        : dernierEvenement.getTypeEvenement(),
                typeEvenement
        );

        PointageEvenement evenement = new PointageEvenement();
        evenement.setPointageId(pointage.getId());
        evenement.setTypeEvenement(typeEvenement);
        evenement.setDateHeure(maintenant);
        evenement.setModePointage("QR_CODE");

        PointageEvenement evenementEnregistre =
                evenementRepository.save(evenement);

        if (typeEvenement == TypeEvenement.SORTIE) {
            List<PointageEvenement> tousLesEvenements =
                    evenementRepository.findByPointageId(pointage.getId());

            long minutesTravaillees =
                    calculerMinutesTravaillees(tousLesEvenements);

            int retard = calculerRetard(tousLesEvenements.get(0));

            BigDecimal heuresSupplementaires =
                    calculerHeuresSupplementaires(minutesTravaillees);

            pointageRepository.mettreAJourCalculs(
                    pointage.getId(),
                    heuresSupplementaires,
                    retard
            );

            pointageRepository.mettreAJourHeureSortie(
                    pointage.getId(),
                    maintenant
            );
        }

        return evenementEnregistre;
    }

    private void verifierTransition(
            TypeEvenement dernier,
            TypeEvenement prochain
    ) {
        boolean autorise;

        if (dernier == null) {
            autorise = prochain == TypeEvenement.ENTREE;
        } else {
            autorise = switch (dernier) {
                case ENTREE ->
                        prochain == TypeEvenement.SORTIE_PAUSE
                                || prochain == TypeEvenement.SORTIE;

                case SORTIE_PAUSE ->
                        prochain == TypeEvenement.RETOUR_PAUSE;

                case RETOUR_PAUSE ->
                        prochain == TypeEvenement.SORTIE_PAUSE
                                || prochain == TypeEvenement.SORTIE;

                case SORTIE -> false;
            };
        }

        if (!autorise) {
            throw new IllegalArgumentException(
                    "Événement non autorisé après : " + dernier
            );
        }
    }

    private long calculerMinutesTravaillees(List<PointageEvenement> evenements) {
        long totalMinutes = 0;
        LocalDateTime debutTravail = null;

        for (PointageEvenement evenement : evenements) {
            switch (evenement.getTypeEvenement()) {
                case ENTREE, RETOUR_PAUSE ->
                        debutTravail = evenement.getDateHeure();

                case SORTIE_PAUSE, SORTIE -> {
                    if (debutTravail == null) {
                        throw new IllegalStateException(
                                "Événement incohérent : début de travail manquant."
                        );
                    }

                    totalMinutes += Duration.between(
                            debutTravail,
                            evenement.getDateHeure()
                    ).toMinutes();

                    debutTravail = null;
                }
            }
        }

        if (debutTravail != null) {
            throw new IllegalStateException(
                    "Le pointage est incomplet : "
                            + "une période de travail est encore ouverte."
            );
        }

        return totalMinutes;
    }

    private int calculerRetard(PointageEvenement premiereEntree) {
        LocalTime heureEntree =
                premiereEntree.getDateHeure().toLocalTime();

        if (!heureEntree.isAfter(HEURE_ENTREE_OFFICIELLE)) {
            return 0;
        }

        return (int) Duration.between(HEURE_ENTREE_OFFICIELLE, heureEntree).toMinutes();
    }

    private BigDecimal calculerHeuresSupplementaires(long minutesTravaillees) {
        long minutesSupplementaires = Math.max(0, minutesTravaillees - DUREE_NORMALE_MINUTES);

        return BigDecimal.valueOf(minutesSupplementaires).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
    }

    private void verifierChronologie(PointageEvenement dernierEvenement, LocalDateTime nouvelleDateHeure) {
        if (dernierEvenement == null) {
            return;
        }

        if (!nouvelleDateHeure.isAfter(dernierEvenement.getDateHeure())) {
            throw new IllegalStateException(
                    "L'heure du nouvel événement doit être postérieure "
                            + "au dernier événement enregistré."
            );
        }
    }

    @Transactional(readOnly = true)
    public List<PointageEvenement> consulterHistorique(Long numeroMatricule, LocalDate date) {
        if (numeroMatricule == null || numeroMatricule <= 0) {
            throw new IllegalArgumentException(
                    "Numéro matricule invalide."
            );
        }

        if (date == null) {
            throw new IllegalArgumentException(
                    "La date est obligatoire."
            );
        }

        return pointageRepository
                .findByMatriculeAndDate(numeroMatricule, date)
                .map(pointage ->
                        evenementRepository.findByPointageId(pointage.getId())
                )
                .orElseGet(List::of);
    }

}
